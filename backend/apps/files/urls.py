from django.urls import path
from .views import FileUploadView, FileDeleteView, GlobalFilesView

urlpatterns = [
    path('upload', FileUploadView.as_view(), name='upload'),
    path('files/<int:pk>', FileDeleteView.as_view(), name='file-delete'),
    path('files', GlobalFilesView.as_view(), name='files-list'),
]
