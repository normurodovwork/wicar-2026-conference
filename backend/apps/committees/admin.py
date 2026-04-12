from django.contrib import admin
from .models import Committee, CommitteeMember


class CommitteeMemberInline(admin.TabularInline):
    model = CommitteeMember
    extra = 1
    fields = ('full_name', 'role', 'position', 'photo', 'order', 'is_active')


@admin.register(Committee)
class CommitteeAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'order', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('name',)
    ordering = ('order',)
    inlines = [CommitteeMemberInline]
    
    actions = ['activate_committees', 'deactivate_committees']
    
    @admin.action(description='Активировать выбранные комитеты')
    def activate_committees(self, request, queryset):
        queryset.update(is_active=True)
    
    @admin.action(description='Деактивировать выбранные комитеты')
    def deactivate_committees(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(CommitteeMember)
class CommitteeMemberAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'committee', 'role', 'position', 'order', 'is_active')
    list_filter = ('committee', 'role', 'is_active')
    search_fields = ('full_name', 'position')
    ordering = ('committee', 'order')
    
    actions = ['activate_members', 'deactivate_members']
    
    @admin.action(description='Активировать выбранных членов')
    def activate_members(self, request, queryset):
        queryset.update(is_active=True)
    
    @admin.action(description='Деактивировать выбранных членов')
    def deactivate_members(self, request, queryset):
        queryset.update(is_active=False)
