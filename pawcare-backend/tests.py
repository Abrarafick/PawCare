"""
PawCare Backend Tests
Tests authentication, pet ownership isolation, vaccination status logic,
and medical report authorization.
"""
import io
import uuid
from datetime import date, timedelta

import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.pets.models import Pet
from apps.vaccinations.models import VaccinationRecord


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_a(db):
    return User.objects.create_user(
        username='usera@example.com',
        email='usera@example.com',
        password='SecurePass123!'
    )


@pytest.fixture
def user_b(db):
    return User.objects.create_user(
        username='userb@example.com',
        email='userb@example.com',
        password='SecurePass123!'
    )


@pytest.fixture
def auth_client_a(user_a):
    client = APIClient()
    refresh = RefreshToken.for_user(user_a)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def auth_client_b(user_b):
    client = APIClient()
    refresh = RefreshToken.for_user(user_b)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def pet_a(db, user_a):
    return Pet.objects.create(
        owner=user_a,
        name='Whiskers',
        species='cat',
        date_of_birth=date(2020, 1, 15),
    )


@pytest.fixture
def pet_b(db, user_b):
    return Pet.objects.create(
        owner=user_b,
        name='Buddy',
        species='dog',
        date_of_birth=date(2019, 6, 1),
    )


# ─── Authentication Tests ─────────────────────────────────────────────────────

class TestAuthentication:
    def test_register_valid_user(self, api_client, db):
        response = api_client.post('/api/auth/register/', {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }, format='json')
        assert response.status_code == 201
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'newuser@example.com'

    def test_register_duplicate_email(self, api_client, user_a):
        response = api_client.post('/api/auth/register/', {
            'email': 'usera@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }, format='json')
        assert response.status_code == 400
        assert 'email' in str(response.data).lower() or 'already exists' in str(response.data).lower()

    def test_register_password_mismatch(self, api_client, db):
        response = api_client.post('/api/auth/register/', {
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'WrongPass456!',
        }, format='json')
        assert response.status_code == 400

    def test_login_valid(self, api_client, user_a):
        response = api_client.post('/api/auth/login/', {
            'email': 'usera@example.com',
            'password': 'SecurePass123!',
        }, format='json')
        assert response.status_code == 200
        assert 'access' in response.data

    def test_login_invalid_password(self, api_client, user_a):
        response = api_client.post('/api/auth/login/', {
            'email': 'usera@example.com',
            'password': 'WrongPassword!',
        }, format='json')
        assert response.status_code == 401

    def test_login_unknown_email(self, api_client, db):
        response = api_client.post('/api/auth/login/', {
            'email': 'nobody@example.com',
            'password': 'SomePass123!',
        }, format='json')
        assert response.status_code == 401

    def test_private_endpoint_requires_auth(self, api_client, db):
        response = api_client.get('/api/pets/')
        assert response.status_code == 401

    def test_me_returns_current_user(self, auth_client_a, user_a):
        response = auth_client_a.get('/api/auth/me/')
        assert response.status_code == 200
        assert response.data['email'] == 'usera@example.com'


# ─── Pet Tests ────────────────────────────────────────────────────────────────

class TestPets:
    def test_create_pet(self, auth_client_a, db):
        response = auth_client_a.post('/api/pets/', {
            'name': 'Luna',
            'species': 'cat',
            'date_of_birth': '2021-03-01',
        }, format='json')
        assert response.status_code == 201
        assert response.data['name'] == 'Luna'
        assert 'id' in response.data

    def test_list_returns_only_own_pets(self, auth_client_a, pet_a, pet_b):
        response = auth_client_a.get('/api/pets/')
        assert response.status_code == 200
        ids = [p['id'] for p in response.data]
        assert str(pet_a.id) in ids
        assert str(pet_b.id) not in ids

    def test_cannot_get_another_users_pet(self, auth_client_a, pet_b):
        response = auth_client_a.get(f'/api/pets/{pet_b.id}/')
        assert response.status_code == 404

    def test_cannot_edit_another_users_pet(self, auth_client_a, pet_b):
        response = auth_client_a.patch(f'/api/pets/{pet_b.id}/', {'name': 'Hacked'}, format='json')
        assert response.status_code == 404

    def test_cannot_delete_another_users_pet(self, auth_client_a, pet_b):
        response = auth_client_a.delete(f'/api/pets/{pet_b.id}/')
        assert response.status_code == 404

    def test_edit_own_pet(self, auth_client_a, pet_a):
        response = auth_client_a.patch(
            f'/api/pets/{pet_a.id}/', {'name': 'Whiskers Jr.'}, format='json'
        )
        assert response.status_code == 200
        assert response.data['name'] == 'Whiskers Jr.'

    def test_delete_own_pet(self, auth_client_a, pet_a):
        response = auth_client_a.delete(f'/api/pets/{pet_a.id}/')
        assert response.status_code == 204
        assert not Pet.objects.filter(id=pet_a.id).exists()


# ─── Vaccination Tests ────────────────────────────────────────────────────────

class TestVaccinationStatus:
    def test_future_vaccination_is_upcoming(self, db, pet_a):
        future_date = timezone.now().date() + timedelta(days=30)
        v = VaccinationRecord.objects.create(
            pet=pet_a, vaccine_name='Rabies', due_date=future_date
        )
        assert v.status == 'UPCOMING'

    def test_past_vaccination_is_overdue(self, db, pet_a):
        past_date = timezone.now().date() - timedelta(days=10)
        v = VaccinationRecord.objects.create(
            pet=pet_a, vaccine_name='Rabies', due_date=past_date
        )
        assert v.status == 'OVERDUE'

    def test_due_today_is_upcoming_not_overdue(self, db, pet_a):
        today = timezone.now().date()
        v = VaccinationRecord.objects.create(
            pet=pet_a, vaccine_name='Rabies', due_date=today
        )
        assert v.status == 'UPCOMING'

    def test_completed_vaccination_is_completed(self, db, pet_a):
        past_date = timezone.now().date() - timedelta(days=10)
        v = VaccinationRecord.objects.create(
            pet=pet_a, vaccine_name='Rabies', due_date=past_date,
            is_completed=True, administered_date=past_date
        )
        assert v.status == 'COMPLETED'


class TestVaccinationAPI:
    def test_add_vaccination(self, auth_client_a, pet_a):
        future_date = (timezone.now().date() + timedelta(days=30)).isoformat()
        response = auth_client_a.post(
            f'/api/pets/{pet_a.id}/vaccinations/',
            {'vaccine_name': 'FVRCP', 'due_date': future_date},
            format='json'
        )
        assert response.status_code == 201
        assert response.data['status'] == 'UPCOMING'

    def test_mark_vaccination_complete(self, auth_client_a, pet_a):
        future_date = (timezone.now().date() + timedelta(days=30)).isoformat()
        create_resp = auth_client_a.post(
            f'/api/pets/{pet_a.id}/vaccinations/',
            {'vaccine_name': 'FVRCP', 'due_date': future_date},
            format='json'
        )
        vax_id = create_resp.data['id']
        today = timezone.now().date().isoformat()

        complete_resp = auth_client_a.patch(
            f'/api/pets/{pet_a.id}/vaccinations/{vax_id}/complete/',
            {'administered_date': today},
            format='json'
        )
        assert complete_resp.status_code == 200
        assert complete_resp.data['status'] == 'COMPLETED'
        assert complete_resp.data['is_completed'] is True
        assert complete_resp.data['administered_date'] == today

    def test_completed_not_in_pending_list(self, auth_client_a, pet_a):
        past_date = (timezone.now().date() - timedelta(days=5)).isoformat()
        create_resp = auth_client_a.post(
            f'/api/pets/{pet_a.id}/vaccinations/',
            {'vaccine_name': 'Rabies', 'due_date': past_date},
            format='json'
        )
        vax_id = create_resp.data['id']

        auth_client_a.patch(
            f'/api/pets/{pet_a.id}/vaccinations/{vax_id}/complete/',
            {'administered_date': timezone.now().date().isoformat()},
            format='json'
        )

        # Should not appear in PENDING (outstanding) list
        pending_resp = auth_client_a.get(
            f'/api/pets/{pet_a.id}/vaccinations/?status=PENDING'
        )
        assert pending_resp.status_code == 200
        pending_ids = [v['id'] for v in pending_resp.data]
        assert vax_id not in pending_ids

        # Should appear in COMPLETED list
        completed_resp = auth_client_a.get(
            f'/api/pets/{pet_a.id}/vaccinations/?status=COMPLETED'
        )
        completed_ids = [v['id'] for v in completed_resp.data]
        assert vax_id in completed_ids

    def test_cannot_access_other_users_pet_vaccinations(self, auth_client_a, pet_b):
        response = auth_client_a.get(f'/api/pets/{pet_b.id}/vaccinations/')
        assert response.status_code == 404

    def test_vaccination_complete_requires_administered_date(self, auth_client_a, pet_a):
        future_date = (timezone.now().date() + timedelta(days=30)).isoformat()
        create_resp = auth_client_a.post(
            f'/api/pets/{pet_a.id}/vaccinations/',
            {'vaccine_name': 'FVRCP', 'due_date': future_date},
            format='json'
        )
        vax_id = create_resp.data['id']

        complete_resp = auth_client_a.patch(
            f'/api/pets/{pet_a.id}/vaccinations/{vax_id}/complete/',
            {},  # No administered_date
            format='json'
        )
        assert complete_resp.status_code == 400


# ─── Medical Reports Tests ────────────────────────────────────────────────────

class TestMedicalReports:
    def _make_fake_jpeg(self):
        """Create a minimal valid JPEG file in memory."""
        buf = io.BytesIO()
        # JPEG header magic bytes
        buf.write(b'\xff\xd8\xff\xe0')
        buf.write(b'\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00')
        buf.write(b'\xff\xd9')  # EOI
        buf.seek(0)
        buf.name = 'test_report.jpg'
        return buf

    def _make_fake_pdf(self):
        """Create a minimal valid PDF file in memory."""
        buf = io.BytesIO()
        buf.write(b'%PDF-1.4\n%%EOF')
        buf.seek(0)
        buf.name = 'test_report.pdf'
        return buf

    def test_upload_jpeg_report(self, auth_client_a, pet_a, settings, tmp_path):
        settings.PRIVATE_MEDIA_ROOT = tmp_path

        response = auth_client_a.post(
            f'/api/pets/{pet_a.id}/reports/',
            {
                'file': self._make_fake_jpeg(),
                'title': 'Annual Checkup',
                'document_date': '2024-03-15',
                'description': 'Routine checkup results',
            },
            format='multipart'
        )
        assert response.status_code == 201
        assert response.data['title'] == 'Annual Checkup'
        assert response.data['mime_type'] == 'image/jpeg'
        assert 'file_url' in response.data
        assert 'download_url' in response.data
        # storage_key must NEVER be in response
        assert 'storage_key' not in response.data

    def test_upload_pdf_report(self, auth_client_a, pet_a, settings, tmp_path):
        settings.PRIVATE_MEDIA_ROOT = tmp_path

        response = auth_client_a.post(
            f'/api/pets/{pet_a.id}/reports/',
            {
                'file': self._make_fake_pdf(),
                'title': 'Lab Results',
                'document_date': '2024-04-01',
            },
            format='multipart'
        )
        assert response.status_code == 201
        assert response.data['mime_type'] == 'application/pdf'

    def test_cannot_access_other_users_reports(self, auth_client_a, pet_b):
        response = auth_client_a.get(f'/api/pets/{pet_b.id}/reports/')
        assert response.status_code == 404

    def test_reports_isolated_to_pet(self, auth_client_a, pet_a, settings, tmp_path):
        """Reports uploaded to pet_a do not appear for a different pet."""
        settings.PRIVATE_MEDIA_ROOT = tmp_path

        pet_a2 = Pet.objects.create(
            owner=pet_a.owner, name='Luna', species='cat', date_of_birth=date(2021, 1, 1)
        )
        auth_client_a.post(
            f'/api/pets/{pet_a.id}/reports/',
            {
                'file': self._make_fake_jpeg(),
                'title': 'Whiskers Checkup',
                'document_date': '2024-01-01',
            },
            format='multipart'
        )

        # Luna's report list must be empty
        response = auth_client_a.get(f'/api/pets/{pet_a2.id}/reports/')
        assert response.status_code == 200
        assert len(response.data) == 0

    def test_upload_invalid_extension_rejected(self, auth_client_a, pet_a, settings, tmp_path):
        settings.PRIVATE_MEDIA_ROOT = tmp_path
        buf = io.BytesIO(b'some text content')
        buf.name = 'report.txt'
        response = auth_client_a.post(
            f'/api/pets/{pet_a.id}/reports/',
            {'file': buf, 'title': 'Test', 'document_date': '2024-01-01'},
            format='multipart'
        )
        assert response.status_code == 400

    def test_report_file_requires_auth(self, api_client, pet_a, db):
        """Unauthenticated request to file endpoint returns 401."""
        fake_id = uuid.uuid4()
        response = api_client.get(f'/api/pets/{pet_a.id}/reports/{fake_id}/file/')
        assert response.status_code == 401

    def test_delete_own_report(self, auth_client_a, pet_a, settings, tmp_path):
        settings.PRIVATE_MEDIA_ROOT = tmp_path

        create_resp = auth_client_a.post(
            f'/api/pets/{pet_a.id}/reports/',
            {
                'file': self._make_fake_jpeg(),
                'title': 'Delete Me',
                'document_date': '2024-01-01',
            },
            format='multipart'
        )
        assert create_resp.status_code == 201
        report_id = create_resp.data['id']

        delete_resp = auth_client_a.delete(f'/api/pets/{pet_a.id}/reports/{report_id}/')
        assert delete_resp.status_code == 204

        # Verify it's gone
        get_resp = auth_client_a.get(f'/api/pets/{pet_a.id}/reports/{report_id}/')
        assert get_resp.status_code == 404

    def test_cannot_delete_other_users_report(self, auth_client_a, auth_client_b, pet_a, pet_b, settings, tmp_path):
        settings.PRIVATE_MEDIA_ROOT = tmp_path

        # User B uploads a report for their pet
        create_resp = auth_client_b.post(
            f'/api/pets/{pet_b.id}/reports/',
            {
                'file': self._make_fake_jpeg(),
                'title': "Buddy's Report",
                'document_date': '2024-01-01',
            },
            format='multipart'
        )
        assert create_resp.status_code == 201
        report_id = create_resp.data['id']

        # User A tries to delete User B's report through User B's pet → 404
        delete_resp = auth_client_a.delete(f'/api/pets/{pet_b.id}/reports/{report_id}/')
        assert delete_resp.status_code == 404


# ─── Dashboard Tests ──────────────────────────────────────────────────────────

class TestDashboard:
    def test_dashboard_returns_only_own_pets(self, auth_client_a, pet_a, pet_b):
        response = auth_client_a.get('/api/dashboard/')
        assert response.status_code == 200
        pet_ids = [p['id'] for p in response.data['pets']]
        assert str(pet_a.id) in pet_ids
        assert str(pet_b.id) not in pet_ids

    def test_dashboard_counts_overdue(self, auth_client_a, pet_a):
        past = timezone.now().date() - timedelta(days=5)
        VaccinationRecord.objects.create(
            pet=pet_a, vaccine_name='Rabies', due_date=past
        )
        response = auth_client_a.get('/api/dashboard/')
        totals = response.data['totals']
        assert totals['overdue_vaccinations'] >= 1
