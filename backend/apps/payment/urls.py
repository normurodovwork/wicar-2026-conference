from django.urls import path
from .views import PaymentInfoView, PaymentCalculationView

urlpatterns = [
    path('payment-info', PaymentInfoView.as_view(), name='payment-info'),
    path('payment-calculation', PaymentCalculationView.as_view(), name='payment-calculation'),
]
