from django.urls import path
from .views import ApplicationView

urlpatterns = [
    path('application', ApplicationView.as_view(), name='application'),
]
