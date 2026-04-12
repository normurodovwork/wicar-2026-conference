from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import PaymentInfo
from .serializers import PaymentInfoSerializer


class PaymentInfoView(generics.RetrieveAPIView):
    """Получение информации об оплате для текущего пользователя."""
    serializer_class = PaymentInfoSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        """Получаем активную запись оплаты или создаём дефолтную."""
        payment_info = PaymentInfo.objects.filter(is_active=True).first()
        if not payment_info:
            # Создаём дефолтную запись
            payment_info = PaymentInfo.objects.create(
                card_number='8600 0000 0000 0000',
                card_holder='WICAR CONFERENCE',
                card_bank='Uzum Bank',
                amount_uzs=200000,
                amount_usd=20,
                contact_phone='+998 90 985 80 44',
                contact_email='conference@wicar.uz',
                telegram_contact='+998 90 985 80 44',
            )
        return payment_info


class PaymentCalculationView(generics.GenericAPIView):
    """Расчёт суммы оплаты для текущего участника."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Рассчитываем сумму оплаты на основе данных участника."""
        from apps.participants.models import Participant
        
        try:
            participant = Participant.objects.get(user=request.user)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant not found'})
        
        # Получаем информацию об оплате
        payment_info = PaymentInfo.objects.filter(is_active=True).first()
        if not payment_info:
            payment_info = PaymentInfo.objects.create(
                card_number='8600 0000 0000 0000',
                card_holder='WICAR CONFERENCE',
                card_bank='Uzum Bank',
                amount_uzs=200000,
                amount_usd=20,
            )
        
        # Определяем сумму оплаты
        amount = 0
        currency = 'UZS'
        should_pay = False
        message = ''
        
        # Проверяем статус
        if participant.status != 'approved':
            message = 'Оплата возможна только после одобрения заявки организационным комитетом.'
        else:
            should_pay = True
            # Иностранные участники в онлайн-формате не платят
            if participant.is_foreign and participant.participation_format == 'online':
                amount = 0
                message = 'Организационный взнос не взимается с иностранных участников, участвующих в конференции в онлайн-формате.'
            elif participant.is_foreign:
                amount = payment_info.amount_usd
                currency = 'USD'
                message = f'Сумма оплаты для зарубежных участников: {amount} {currency}'
            else:
                amount = payment_info.amount_uzs
                currency = 'UZS'
                message = f'Взнос за участие в конференции и публикацию одной статьи составляет: {amount:,} {currency}'.replace(',', ' ')
        
        return Response({
            'should_pay': should_pay,
            'amount': amount,
            'currency': currency,
            'message': message,
            'card_number': payment_info.card_number,
            'card_holder': payment_info.card_holder,
            'card_bank': payment_info.card_bank,
            'contact_phone': payment_info.contact_phone,
            'contact_email': payment_info.contact_email,
            'telegram_contact': payment_info.telegram_contact,
        })
