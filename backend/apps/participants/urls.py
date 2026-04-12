from django.urls import path
from .views import ParticipantsListView, ParticipantDetailView, ParticipantPaymentConfirmView, CurrentParticipantView

urlpatterns = [
    path('participants', ParticipantsListView.as_view(), name='participants-list'),
    path('participants/me', CurrentParticipantView.as_view(), name='participant-me'),
    path('participants/<int:pk>', ParticipantDetailView.as_view(), name='participant-detail'),
    path('participants/<int:pk>/confirm-payment', ParticipantPaymentConfirmView.as_view(), name='participant-confirm-payment'),
]
