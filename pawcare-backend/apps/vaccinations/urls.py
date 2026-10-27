from django.urls import path
from .views import (
    VaccinationListCreateView,
    VaccinationDetailView,
    VaccinationCompleteView,
)

urlpatterns = [
    path(
        'pets/<uuid:pet_id>/vaccinations/',
        VaccinationListCreateView.as_view(),
        name='vaccination-list-create'
    ),
    path(
        'pets/<uuid:pet_id>/vaccinations/<uuid:vaccination_id>/',
        VaccinationDetailView.as_view(),
        name='vaccination-detail'
    ),
    path(
        'pets/<uuid:pet_id>/vaccinations/<uuid:vaccination_id>/complete/',
        VaccinationCompleteView.as_view(),
        name='vaccination-complete'
    ),
]

