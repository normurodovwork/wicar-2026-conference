from django.urls import path
from .views import CommitteesListView

urlpatterns = [
    path('committees', CommitteesListView.as_view(), name='committees-list'),
]
