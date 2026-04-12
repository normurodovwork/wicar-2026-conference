import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.payment.models import PaymentInfo

if not PaymentInfo.objects.exists():
    PaymentInfo.objects.create(
        card_number='8600 1234 5678 9012',
        card_holder='WICAR CONFERENCE',
        card_bank='Uzum Bank',
        amount_uzs=200000,
        amount_usd=20,
        contact_phone='+998 90 985 80 44',
        contact_email='conference@wicar.uz',
        telegram_contact='+998 90 985 80 44',
    )
    print('Создана запись PaymentInfo')
else:
    print('PaymentInfo уже существует')
