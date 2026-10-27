import uuid
from django.db import models
from django.conf import settings


class Pet(models.Model):
    SPECIES_CHOICES = [
        ('cat', 'Cat'),
        ('dog', 'Dog'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pets'
    )
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    estimated_age = models.CharField(
        max_length=50, blank=True,
        help_text='e.g. "~3 years" — used only when date of birth is unknown'
    )
    photo_key = models.CharField(
        max_length=500, blank=True,
        help_text='Storage key for the pet photo (not a public URL)'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['owner'], name='idx_pet_owner'),
        ]

    def __str__(self):
        return f'{self.name} ({self.species}) — owner: {self.owner_id}'

