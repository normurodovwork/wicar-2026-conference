from django.contrib import admin
from .models import PaymentInfo


@admin.register(PaymentInfo)
class PaymentInfoAdmin(admin.ModelAdmin):
    list_display = ('card_number', 'card_holder', 'card_bank', 'amount_uzs', 'amount_usd', 'is_active')
    list_filter = ('is_active', 'card_bank')
    search_fields = ('card_number', 'card_holder')
    fieldsets = (
        ('Данные карты', {
            'fields': ('card_number', 'card_holder', 'card_bank')
        }),
        ('Суммы', {
            'fields': ('amount_uzs', 'amount_usd')
        }),
        ('Контакты', {
            'fields': ('contact_phone', 'contact_email', 'telegram_contact')
        }),
        ('Описание', {
            'fields': ('description_uz', 'description_ru'),
            'classes': ('collapse',)
        }),
        ('Настройки', {
            'fields': ('is_active',)
        }),
    )
