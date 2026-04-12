from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'direction', 'participation_format', 'status', 'created_at')
    list_filter = ('status', 'direction', 'participation_format')
    search_fields = ('user__full_name', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    actions = ['approve_applications', 'reject_applications', 'reset_to_pending']
    
    @admin.action(description='Одобрить выбранные заявки')
    def approve_applications(self, request, queryset):
        queryset.update(status='approved')
    
    @admin.action(description='Отклонить выбранные заявки')
    def reject_applications(self, request, queryset):
        queryset.update(status='rejected')
    
    @admin.action(description='Сбросить статус на "На рассмотрении"')
    def reset_to_pending(self, request, queryset):
        queryset.update(status='pending')
