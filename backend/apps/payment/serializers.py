from rest_framework import serializers
from .models import PaymentInfo


class PaymentInfoSerializer(serializers.ModelSerializer):
    """Сериализатор информации об оплате."""
    
    class Meta:
        model = PaymentInfo
        fields = (
            'id', 'card_number', 'card_holder', 'card_bank',
            'amount_uzs', 'amount_usd',
            'contact_phone', 'contact_email', 'telegram_contact',
            'description_uz', 'description_ru',
            'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
