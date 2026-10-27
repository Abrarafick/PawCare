from rest_framework import serializers
from django.conf import settings
from .models import MedicalReport


class MedicalReportSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = MedicalReport
        fields = (
            'id', 'pet', 'title', 'document_date', 'description',
            'original_filename', 'mime_type', 'file_size_bytes', 'file_size_display',
            'file_url', 'download_url',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'pet', 'original_filename', 'mime_type', 'file_size_bytes',
            'file_url', 'download_url', 'file_size_display', 'created_at', 'updated_at',
        )
        # storage_key is intentionally never included in serializer output

    def get_file_url(self, obj):
        request = self.context.get('request')
        url = f'/api/pets/{obj.pet_id}/reports/{obj.id}/file/'
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_download_url(self, obj):
        request = self.context.get('request')
        url = f'/api/pets/{obj.pet_id}/reports/{obj.id}/file/?download=true'
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_file_size_display(self, obj):
        size = obj.file_size_bytes
        if size < 1024:
            return f'{size} B'
        elif size < 1024 * 1024:
            return f'{size / 1024:.1f} KB'
        else:
            return f'{size / (1024 * 1024):.1f} MB'


class MedicalReportUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    title = serializers.CharField(max_length=200, required=True)
    document_date = serializers.DateField(required=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_file(self, value):
        max_size = settings.MAX_UPLOAD_SIZE
        if value.size > max_size:
            raise serializers.ValidationError(
                f'File size must not exceed {max_size // (1024 * 1024)} MB.'
            )
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('Title cannot be blank.')
        return value.strip()

