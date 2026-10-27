from rest_framework import serializers
from django.utils import timezone
from .models import VaccinationRecord


class VaccinationRecordSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = VaccinationRecord
        fields = (
            'id', 'pet', 'vaccine_name', 'due_date', 'is_completed',
            'administered_date', 'vet_clinic', 'next_due_date', 'notes',
            'status', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'pet', 'status', 'created_at', 'updated_at')

    def get_status(self, obj):
        return obj.status

    def validate(self, data):
        is_completed = data.get('is_completed', getattr(self.instance, 'is_completed', False))
        administered_date = data.get('administered_date',
                                     getattr(self.instance, 'administered_date', None))

        if is_completed and not administered_date:
            raise serializers.ValidationError({
                'administered_date': 'Administration date is required when marking as completed.'
            })

        next_due_date = data.get('next_due_date', None)
        due_date = data.get('due_date', getattr(self.instance, 'due_date', None))
        if next_due_date and due_date and next_due_date <= due_date:
            raise serializers.ValidationError({
                'next_due_date': 'Next due date must be after the current due date.'
            })

        return data


class MarkCompleteSerializer(serializers.Serializer):
    administered_date = serializers.DateField(required=True)
    vet_clinic = serializers.CharField(required=False, allow_blank=True)
    next_due_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_administered_date(self, value):
        today = timezone.now().date()
        if value > today:
            raise serializers.ValidationError('Administration date cannot be in the future.')
        return value

    def validate(self, data):
        administered_date = data.get('administered_date')
        next_due_date = data.get('next_due_date')
        if next_due_date and administered_date and next_due_date <= administered_date:
            raise serializers.ValidationError({
                'next_due_date': 'Next due date must be after the administration date.'
            })
        return data

