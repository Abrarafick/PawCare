import os
import uuid
import logging
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, StreamingHttpResponse
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.pets.models import Pet
from .models import MedicalReport
from .serializers import MedicalReportSerializer, MedicalReportUploadSerializer

logger = logging.getLogger(__name__)

# ─── Allowed file types ──────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'pdf'}
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
}
EXTENSION_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
}
MIME_TO_EXTENSION = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
}


def _get_pet_for_user(request, pet_id):
    pet = Pet.objects.filter(id=pet_id, owner=request.user).first()
    if pet is None:
        raise Http404
    return pet


def _get_report_for_pet(request, pet_id, report_id):
    pet = _get_pet_for_user(request, pet_id)
    report = MedicalReport.objects.filter(id=report_id, pet=pet).first()
    if report is None:
        raise Http404
    return report


def _validate_upload_file(file_obj):
    """
    Validate an uploaded file. Returns (mime_type, error_message).
    Checks: extension, size, basic MIME magic bytes (without python-magic).
    """
    max_size = settings.MAX_UPLOAD_SIZE

    if file_obj.size > max_size:
        return None, f'File size must not exceed {max_size // (1024 * 1024)} MB.'

    original_name = file_obj.name or ''
    ext = os.path.splitext(original_name)[1].lower().lstrip('.')
    if ext not in ALLOWED_EXTENSIONS:
        return None, f'File type .{ext} is not allowed. Supported: {", ".join(sorted(ALLOWED_EXTENSIONS))}.'

    # Validate by reading magic bytes
    file_obj.seek(0)
    header = file_obj.read(12)
    file_obj.seek(0)

    detected_mime = _detect_mime(header, ext)
    if detected_mime not in ALLOWED_MIME_TYPES:
        return None, f'File content does not match a supported type. Supported: JPEG, PNG, WEBP, PDF.'

    return detected_mime, None


def _detect_mime(header: bytes, ext: str) -> str:
    """Detect MIME type from file header magic bytes."""
    # JPEG: FF D8 FF
    if header[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    # PNG: 89 50 4E 47
    if header[:4] == b'\x89PNG':
        return 'image/png'
    # PDF: 25 50 44 46
    if header[:4] == b'%PDF':
        return 'application/pdf'
    # WEBP: RIFF....WEBP
    if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
        return 'image/webp'
    # Fall back to extension-based detection
    return EXTENSION_TO_MIME.get(f'.{ext}', 'application/octet-stream')


def _save_private_file(storage_key: str, file_obj) -> str:
    """Save file to private local storage. Returns the storage key."""
    dest_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, 'wb') as f:
        for chunk in file_obj.chunks():
            f.write(chunk)
    return storage_key


def _delete_private_file(storage_key: str) -> bool:
    """Delete file from private local storage. Returns True if deleted."""
    file_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    try:
        if file_path.exists():
            file_path.unlink()
            return True
        logger.warning('File to delete not found: %s', storage_key)
        return False
    except OSError as e:
        logger.error('Failed to delete file %s: %s', storage_key, e)
        return False


def _sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    name = os.path.basename(filename)
    # Keep only safe characters
    safe = ''.join(c for c in name if c.isalnum() or c in '._-')
    return safe[:100] or 'document'


# ─── Views ──────────────────────────────────────────────────────────────────

class MedicalReportListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pet_id):
        pet = _get_pet_for_user(request, pet_id)
        reports = MedicalReport.objects.filter(pet=pet)
        serializer = MedicalReportSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pet_id):
        pet = _get_pet_for_user(request, pet_id)
        serializer = MedicalReportUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file_obj = serializer.validated_data['file']

        # Step 1: Validate file
        mime_type, error = _validate_upload_file(file_obj)
        if error:
            return Response({'file': [error]}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Save file to private storage
        ext = MIME_TO_EXTENSION.get(mime_type, os.path.splitext(file_obj.name)[1].lower())
        safe_name = _sanitize_filename(file_obj.name)
        storage_key = f'reports/{pet.id}/{uuid.uuid4()}{ext}'

        try:
            _save_private_file(storage_key, file_obj)
        except OSError as e:
            logger.error('Failed to save uploaded file: %s', e)
            return Response(
                {'detail': 'Failed to save file. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Step 3: Create database record
        try:
            report = MedicalReport.objects.create(
                pet=pet,
                title=serializer.validated_data['title'],
                document_date=serializer.validated_data['document_date'],
                description=serializer.validated_data.get('description', ''),
                storage_key=storage_key,
                original_filename=safe_name,
                mime_type=mime_type,
                file_size_bytes=file_obj.size,
            )
        except Exception as e:
            # Cleanup orphaned file
            logger.error('DB error after file upload, cleaning up %s: %s', storage_key, e)
            _delete_private_file(storage_key)
            return Response(
                {'detail': 'Failed to save report record. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            MedicalReportSerializer(report, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class MedicalReportDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request, pet_id, report_id):
        report = _get_report_for_pet(request, pet_id, report_id)
        return Response(MedicalReportSerializer(report, context={'request': request}).data)

    def patch(self, request, pet_id, report_id):
        report = _get_report_for_pet(request, pet_id, report_id)
        serializer = MedicalReportSerializer(
            report, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pet_id, report_id):
        report = _get_report_for_pet(request, pet_id, report_id)
        storage_key = report.storage_key

        # Delete DB record first
        report.delete()

        # Then delete from storage (log failure, but don't reverse DB delete)
        deleted = _delete_private_file(storage_key)
        if not deleted:
            logger.error(
                'DB record deleted but file deletion failed for storage_key: %s', storage_key
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class MedicalReportFileView(APIView):
    """Serve the actual file for preview or download. Always authenticated."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pet_id, report_id):
        report = _get_report_for_pet(request, pet_id, report_id)

        file_path = Path(settings.PRIVATE_MEDIA_ROOT) / report.storage_key
        if not file_path.exists():
            logger.error('Report file not found on disk: %s', report.storage_key)
            raise Http404

        as_download = request.query_params.get('download', '').lower() == 'true'

        response = FileResponse(
            open(file_path, 'rb'),
            content_type=report.mime_type,
        )

        if as_download:
            # Suggest download filename based on original
            safe_filename = report.original_filename
            response['Content-Disposition'] = f'attachment; filename="{safe_filename}"'
        else:
            response['Content-Disposition'] = f'inline; filename="{report.original_filename}"'

        return response
