"""
PawCare Unified Storage Helper
Supports local filesystem storage (development) and Cloudflare R2 / AWS S3 (production).
"""
import os
import logging
from pathlib import Path
from django.conf import settings
from django.http import FileResponse, Http404

logger = logging.getLogger(__name__)


def _is_cloud_storage() -> bool:
    backend = getattr(settings, 'STORAGE_BACKEND', 'local').lower()
    return backend in ['s3', 'r2', 'b2'] or bool(
        os.environ.get('R2_BUCKET_NAME') or os.environ.get('AWS_STORAGE_BUCKET_NAME')
    )


def _get_s3_client():
    import boto3

    endpoint_url = os.environ.get('AWS_S3_ENDPOINT_URL') or os.environ.get('R2_ENDPOINT_URL')
    if not endpoint_url and os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID'):
        account_id = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID')
        endpoint_url = f'https://{account_id}.r2.cloudflarestorage.com'

    access_key = os.environ.get('AWS_ACCESS_KEY_ID') or os.environ.get('R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY') or os.environ.get('R2_SECRET_ACCESS_KEY')
    region = os.environ.get('AWS_S3_REGION_NAME', 'auto')

    return boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
    )


def _get_bucket_name() -> str:
    return os.environ.get('R2_BUCKET_NAME') or os.environ.get('AWS_STORAGE_BUCKET_NAME') or ''


def save_private_file(storage_key: str, file_obj) -> str:
    """Save a file to private storage (S3/R2 or local). Returns storage_key."""
    if _is_cloud_storage():
        s3 = _get_s3_client()
        bucket = _get_bucket_name()
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        s3.upload_fileobj(file_obj, bucket, storage_key)
        return storage_key

    dest_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    if hasattr(file_obj, 'seek'):
        file_obj.seek(0)
    with open(dest_path, 'wb') as f:
        if hasattr(file_obj, 'chunks'):
            for chunk in file_obj.chunks():
                f.write(chunk)
        else:
            f.write(file_obj.read())
    return storage_key


def get_private_file_response(
    storage_key: str,
    content_type: str,
    download_filename: str = None,
    as_download: bool = False,
) -> FileResponse:
    """Serve a private file via FileResponse (streaming from S3/R2 or local disk)."""
    if _is_cloud_storage():
        s3 = _get_s3_client()
        bucket = _get_bucket_name()
        try:
            obj = s3.get_object(Bucket=bucket, Key=storage_key)
            response = FileResponse(obj['Body'], content_type=content_type)
        except Exception as e:
            logger.error('Failed to get file from S3/R2 %s: %s', storage_key, e)
            raise Http404
    else:
        file_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
        if not file_path.exists():
            logger.error('File not found on local disk: %s', storage_key)
            raise Http404
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)

    if as_download and download_filename:
        response['Content-Disposition'] = f'attachment; filename="{download_filename}"'
    elif download_filename:
        response['Content-Disposition'] = f'inline; filename="{download_filename}"'

    return response


def delete_private_file(storage_key: str) -> bool:
    """Delete a private file from S3/R2 or local disk. Returns True on success."""
    if not storage_key:
        return True

    if _is_cloud_storage():
        s3 = _get_s3_client()
        bucket = _get_bucket_name()
        try:
            s3.delete_object(Bucket=bucket, Key=storage_key)
            return True
        except Exception as e:
            logger.error('Failed to delete file from S3/R2 %s: %s', storage_key, e)
            return False

    file_path = Path(settings.PRIVATE_MEDIA_ROOT) / storage_key
    try:
        if file_path.exists():
            file_path.unlink()
            return True
        logger.warning('Local file to delete not found: %s', storage_key)
        return False
    except OSError as e:
        logger.error('Failed to delete local file %s: %s', storage_key, e)
        return False
