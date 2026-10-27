from django.urls import path
from .views import (
    MedicalReportListCreateView,
    MedicalReportDetailView,
    MedicalReportFileView,
)

urlpatterns = [
    path(
        'pets/<uuid:pet_id>/reports/',
        MedicalReportListCreateView.as_view(),
        name='report-list-create'
    ),
    path(
        'pets/<uuid:pet_id>/reports/<uuid:report_id>/',
        MedicalReportDetailView.as_view(),
        name='report-detail'
    ),
    path(
        'pets/<uuid:pet_id>/reports/<uuid:report_id>/file/',
        MedicalReportFileView.as_view(),
        name='report-file'
    ),
]

