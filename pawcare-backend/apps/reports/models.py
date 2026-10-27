import uuid
from django.db import models
from apps.pets.models import Pet


class MedicalReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    document_date = models.DateField()
    description = models.TextField(blank=True)

    # Private storage reference — NEVER a public URL
    storage_key = models.CharField(
        max_length=500,
        help_text='Private storage key (path within private_media). Never exposed publicly.'
    )
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(
        max_length=100,
        help_text='Validated server-side MIME type'
    )
    file_size_bytes = models.BigIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-document_date', '-created_at']
        indexes = [
            models.Index(fields=['pet'], name='idx_report_pet'),
            models.Index(fields=['pet', '-document_date'], name='idx_report_pet_date'),
        ]

    def __str__(self):
        return f'{self.title} ({self.document_date}) — {self.pet.name}'

