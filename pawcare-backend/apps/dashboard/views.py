from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.pets.models import Pet
from apps.vaccinations.models import VaccinationRecord


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # All pets for this user
        pets = Pet.objects.filter(owner=user).prefetch_related('vaccinations')

        pet_summaries = []
        all_upcoming = []
        all_overdue = []

        for pet in pets:
            upcoming = list(
                pet.vaccinations.filter(is_completed=False, due_date__gte=today)
                .order_by('due_date')[:5]
            )
            overdue = list(
                pet.vaccinations.filter(is_completed=False, due_date__lt=today)
                .order_by('due_date')
            )

            pet_summary = {
                'id': str(pet.id),
                'name': pet.name,
                'species': pet.species,
                'has_photo': bool(pet.photo_key),
                'photo_url': request.build_absolute_uri(f'/api/pets/{pet.id}/photo/serve/')
                             if pet.photo_key else None,
                'upcoming_count': len(upcoming),
                'overdue_count': len(overdue),
                'upcoming_vaccinations': [
                    {
                        'id': str(v.id),
                        'vaccine_name': v.vaccine_name,
                        'due_date': str(v.due_date),
                        'days_until_due': (v.due_date - today).days,
                    }
                    for v in upcoming
                ],
                'overdue_vaccinations': [
                    {
                        'id': str(v.id),
                        'vaccine_name': v.vaccine_name,
                        'due_date': str(v.due_date),
                        'days_overdue': (today - v.due_date).days,
                    }
                    for v in overdue
                ],
            }
            pet_summaries.append(pet_summary)
            all_upcoming.extend(upcoming)
            all_overdue.extend(overdue)

        return Response({
            'pets': pet_summaries,
            'totals': {
                'pet_count': len(pet_summaries),
                'upcoming_vaccinations': len(all_upcoming),
                'overdue_vaccinations': len(all_overdue),
            }
        })

