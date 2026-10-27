from django.urls import path
from .views import PetListCreateView, PetDetailView, PetPhotoUploadView, PetPhotoServeView

urlpatterns = [
    path('pets/', PetListCreateView.as_view(), name='pet-list-create'),
    path('pets/<uuid:pet_id>/', PetDetailView.as_view(), name='pet-detail'),
    path('pets/<uuid:pet_id>/photo/', PetPhotoUploadView.as_view(), name='pet-photo-upload'),
    path('pets/<uuid:pet_id>/photo/serve/', PetPhotoServeView.as_view(), name='pet-photo-serve'),
]

