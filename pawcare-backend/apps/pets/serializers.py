import os
import uuid
import logging
from pathlib import Path

from django.conf import settings
from rest_framework import serializers
from .models import Pet

logger = logging.getLogger(__name__)


class PetSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    vaccination_count = serializers.SerializerMethodField()
    upcoming_vaccinations = serializers.SerializerMethodField()
    overdue_vaccinations = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = (
            'id', 'name', 'species', 'date_of_birth', 'estimated_age',
            'photo_key', 'photo_url', 'notes', 'created_at', 'updated_at',
            'vaccination_count', 'upcoming_vaccinations', 'overdue_vaccinations',
        )
        read_only_fields = ('id', 'photo_key', 'photo_url', 'created_at', 'updated_at',
                            'vaccination_count', 'upcoming_vaccinations', 'overdue_vaccinations')

    def get_photo_url(self, obj):
        if not obj.photo_key:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/pets/{obj.id}/photo/')
        return f'/api/pets/{obj.id}/photo/'

    def get_vaccination_count(self, obj):
        return obj.vaccinations.count()

    def get_upcoming_vaccinations(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return obj.vaccinations.filter(is_completed=False, due_date__gte=today).count()

    def get_overdue_vaccinations(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return obj.vaccinations.filter(is_completed=False, due_date__lt=today).count()

    def validate(self, data):
        # On partial updates (PATCH), only validate if both age fields are explicitly being cleared
        is_partial = self.partial
        if not is_partial:
            # Full update: require at least one age field
            dob = data.get('date_of_birth')
            est_age = data.get('estimated_age', '')
            if not dob and not est_age:
                raise serializers.ValidationError(
                    'Please provide either a date of birth or an estimated age.'
                )
        else:
            # Partial update: check that we're not simultaneously clearing both
            dob = data.get('date_of_birth', getattr(self.instance, 'date_of_birth', None))
            est_age = data.get('estimated_age', getattr(self.instance, 'estimated_age', ''))
            if not dob and not est_age:
                raise serializers.ValidationError(
                    'A pet must have either a date of birth or an estimated age.'
                )
        return data


class PetPhotoUploadSerializer(serializers.Serializer):
    photo = serializers.ImageField(required=True)

    def validate_photo(self, value):
        max_size = settings.MAX_UPLOAD_SIZE
        if value.size > max_size:
            raise serializers.ValidationError(
                f'Photo file size must not exceed {max_size // (1024*1024)} MB.'
            )
        allowed = ['image/jpeg', 'image/png', 'image/webp']
        content_type = value.content_type or ''
        if content_type not in allowed:
            raise serializers.ValidationError(
                'Only JPEG, PNG, and WEBP images are allowed for pet photos.'
            )
        return value
