from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.pets.models import Pet
from .models import VaccinationRecord
from .serializers import VaccinationRecordSerializer, MarkCompleteSerializer


def _get_pet_for_user(request, pet_id):
    """Get pet owned by user, raise Http404 if not found or not owned."""
    pet = Pet.objects.filter(id=pet_id, owner=request.user).first()
    if pet is None:
        raise Http404
    return pet


def _get_vaccination_for_pet(request, pet_id, vaccination_id):
    """Get vaccination belonging to the user's pet."""
    pet = _get_pet_for_user(request, pet_id)
    vaccination = VaccinationRecord.objects.filter(id=vaccination_id, pet=pet).first()
    if vaccination is None:
        raise Http404
    return vaccination


class VaccinationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pet_id):
        pet = _get_pet_for_user(request, pet_id)
        queryset = VaccinationRecord.objects.filter(pet=pet)

        # Optional filter by status
        filter_status = request.query_params.get('status', '').upper()
        today = timezone.now().date()

        if filter_status == 'COMPLETED':
            queryset = queryset.filter(is_completed=True)
        elif filter_status == 'UPCOMING':
            queryset = queryset.filter(is_completed=False, due_date__gte=today)
        elif filter_status == 'OVERDUE':
            queryset = queryset.filter(is_completed=False, due_date__lt=today)
        elif filter_status == 'PENDING':
            # PENDING = UPCOMING + OVERDUE (outstanding reminders)
            queryset = queryset.filter(is_completed=False)

        serializer = VaccinationRecordSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, pet_id):
        pet = _get_pet_for_user(request, pet_id)
        serializer = VaccinationRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pet=pet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VaccinationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pet_id, vaccination_id):
        vaccination = _get_vaccination_for_pet(request, pet_id, vaccination_id)
        return Response(VaccinationRecordSerializer(vaccination).data)

    def put(self, request, pet_id, vaccination_id):
        vaccination = _get_vaccination_for_pet(request, pet_id, vaccination_id)
        serializer = VaccinationRecordSerializer(vaccination, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pet_id, vaccination_id):
        vaccination = _get_vaccination_for_pet(request, pet_id, vaccination_id)
        serializer = VaccinationRecordSerializer(vaccination, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pet_id, vaccination_id):
        vaccination = _get_vaccination_for_pet(request, pet_id, vaccination_id)
        # Safety: warn if deleting a completed record, but allow it
        # The check is done client-side; the API allows deletion of any owned record
        vaccination.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VaccinationCompleteView(APIView):
    """Mark a vaccination as completed."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pet_id, vaccination_id):
        vaccination = _get_vaccination_for_pet(request, pet_id, vaccination_id)

        if vaccination.is_completed:
            return Response(
                {'detail': 'This vaccination is already marked as completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = MarkCompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        vaccination.is_completed = True
        vaccination.administered_date = data['administered_date']
        if 'vet_clinic' in data:
            vaccination.vet_clinic = data['vet_clinic']
        if 'next_due_date' in data:
            vaccination.next_due_date = data.get('next_due_date')
        if 'notes' in data:
            vaccination.notes = data.get('notes', vaccination.notes)

        vaccination.save()
        return Response(VaccinationRecordSerializer(vaccination).data)

