from django.urls import path
from .views import ConferenceFilesListView, ConferenceFileDetailView

urlpatterns = [
    path('conference-files', ConferenceFilesListView.as_view(), name='conference-files-list'),
    path('conference-files/<str:file_type>', ConferenceFileDetailView.as_view(), name='conference-file-detail'),
]
