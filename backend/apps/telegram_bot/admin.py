from django.contrib import admin
from .models import TelegramAdmin


@admin.register(TelegramAdmin)
class TelegramAdminAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'chat_id', 'role', 'is_active', 'created_at')
    list_filter = ('is_active', 'role')
    search_fields = ('full_name', 'chat_id')
    ordering = ('-created_at',)
    fieldsets = (
        ('Основная информация', {
            'fields': ('full_name', 'chat_id', 'is_active')
        }),
        ('Роль и уведомления', {
            'fields': ('role',),
            'description': (
                '<b>Роли уведомлений:</b><br>'
                '• <b>Все уведомления</b> — получает всё: заявки, оплаты, статьи<br>'
                '• <b>Только оплаты</b> — получает уведомления только о загрузке чеков оплаты<br>'
                '• <b>Только статьи</b> — получает уведомления о новых заявках и загрузке статей/антиплагиата'
            )
        }),
        ('Даты', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)
