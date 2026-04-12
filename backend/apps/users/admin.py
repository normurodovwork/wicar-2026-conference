from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('full_name', 'email', 'phone', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('full_name', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('full_name', 'phone', 'role')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'phone', 'password1', 'password2'),
        }),
    )
    
    actions = ['activate_users', 'deactivate_users', 'make_admin']
    
    @admin.action(description='Активировать выбранных пользователей')
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
    
    @admin.action(description='Деактивировать выбранных пользователей')
    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
    
    @admin.action(description='Сделать администраторами')
    def make_admin(self, request, queryset):
        queryset.update(role='admin', is_staff=True)
