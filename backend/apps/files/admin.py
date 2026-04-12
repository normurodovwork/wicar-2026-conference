from django.contrib import admin
from .models import File


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'type', 'application', 'uploaded_at')
    list_filter = ('type',)
    search_fields = ('original_name',)
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)
