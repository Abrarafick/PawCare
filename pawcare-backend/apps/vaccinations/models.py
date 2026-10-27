import uuid
from django.db import models
from django.utils import timezone
from apps.pets.models import Pet


class VaccinationRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=200)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    administered_date = models.DateField(
        null=True, blank=True,
        help_text='Required when is_completed is True. The actual date the vaccine was given.'
    )
    vet_clinic = models.CharField(
        max_length=200, blank=True,
        help_text='Optional veterinarian or clinic name'
    )
    next_due_date = models.DateField(
        null=True, blank=True,
        help_text='Optional next scheduled due date (user-entered only)'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['pet'], name='idx_vaccination_pet'),
            models.Index(fields=['pet', 'is_completed', 'due_date'], name='idx_vaccination_status'),
        ]

    @property
    def status(self) -> str:
        """
        Compute the vaccination status based on completion and due date.

        Rules (authoritative):
          COMPLETED → is_completed = True
          UPCOMING  → is_completed = False AND due_date >= today
          OVERDUE   → is_completed = False AND due_date < today

        A vaccination due TODAY is UPCOMING, not OVERDUE.
        """
        if self.is_completed:
            return 'COMPLETED'
        today = timezone.now().date()
        return 'UPCOMING' if self.due_date >= today else 'OVERDUE'

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.is_completed and not self.administered_date:
            raise ValidationError(
                {'administered_date': 'Administration date is required when marking a vaccination as completed.'}
            )

    def __str__(self):
        return f'{self.vaccine_name} for {self.pet.name} (due {self.due_date})'

