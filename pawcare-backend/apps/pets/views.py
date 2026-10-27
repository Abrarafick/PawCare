import os
import uuid
import logging
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Pet
from .serializers import PetSerializer, PetPhotoUploadSerializer

logger = logging.getLogger(__name__)


class PetListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        pets = Pet.objects.filter(owner=request.user)
        serializer = PetSerializer(pets, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = PetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PetDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def _get_pet(self, request, pet_id):
        """Get pet, returning 404 regardless of whether it belongs to another user."""
        pet = Pet.objects.filter(id=pet_id, owner=request.user).first()
        if pet is None:
            raise Http404
        return pet

    def get(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        serializer = PetSerializer(pet, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        serializer = PetSerializer(pet, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        serializer = PetSerializer(
            pet, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        # Clean up pet photo if it exists
        if pet.photo_key:
            _delete_private_file(pet.photo_key)
        pet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PetPhotoUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _get_pet(self, request, pet_id):
        pet = Pet.objects.filter(id=pet_id, owner=request.user).first()
        if pet is None:
            raise Http404
        return pet

    def post(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        serializer = PetPhotoUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        photo_file = serializer.validated_data['photo']

        # Delete old photo if it exists
        if pet.photo_key:
            _delete_private_file(pet.photo_key)

        # Save new photo
        ext = _get_extension(photo_file.name)
        storage_key = f'pets/{pet.id}/{uuid.uuid4()}{ext}'
        saved_key = _save_private_file(storage_key, photo_file)

        pet.photo_key = saved_key
        pet.save(update_fields=['photo_key', 'updated_at'])

        from .serializers import PetSerializer
        return Response(PetSerializer(pet, context={'request': request}).data)

    def delete(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        if pet.photo_key:
            _delete_private_file(pet.photo_key)
            pet.photo_key = ''
            pet.save(update_fields=['photo_key', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class PetPhotoServeView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_pet(self, request, pet_id):
        pet = Pet.objects.filter(id=pet_id, owner=request.user).first()
        if pet is None:
            raise Http404
        return pet

    def get(self, request, pet_id):
        pet = self._get_pet(request, pet_id)
        if not pet.photo_key:
            raise Http404

        file_path = Path(settings.PRIVATE_MEDIA_ROOT) / pet.photo_key
        if not file_path.exists():
            logger.error('Pet photo file not found: %s', file_path)
            raise Http404

        # Determine content type
        ext = file_path.suffix.lower()
        content_types = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                         '.png': 'image/png', '.webp': 'image/webp'}
        content_type = content_types.get(ext, 'application/octet-stream')

        return FileResponse(open(file_path, 'rb'), content_type=content_type)


# ─── Private storage helpers ────────────────────────────────────────────────

def _save_private_file(storage_key: str, file_obj) -> str:
    """Save a file to private local storage. Returns the storage key."""
    dest_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, 'wb') as f:
        for chunk in file_obj.chunks():
            f.write(chunk)
    return storage_key


def _delete_private_file(storage_key: str) -> bool:
    """Delete a file from private local storage. Returns True if deleted."""
    file_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    try:
        if file_path.exists():
            file_path.unlink()
            return True
    except OSError as e:
        logger.error('Failed to delete private file %s: %s', storage_key, e)
    return False


def _get_extension(filename: str) -> str:
    """Return the file extension including dot, lowercased."""
    _, ext = os.path.splitext(filename)
    return ext.lower()

