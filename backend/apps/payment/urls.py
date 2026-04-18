from django.urls import path
from .views import PaymentInfoView, PaymentCalculationView, PaymentInfoAdminView

urlpatterns = [
    path('payment-info', PaymentInfoView.as_view(), name='payment-info'),
    path('payment-calculation', PaymentCalculationView.as_view(), name='payment-calculation'),
    # Админские эндпоинты
    path('admin/payment-info', PaymentInfoAdminView.as_view(), name='admin-payment-info-list'),
    path('admin/payment-info/<int:pk>', PaymentInfoAdminView.as_view(), name='admin-payment-info-detail'),
]
