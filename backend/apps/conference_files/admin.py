from django.contrib import admin
from .models import ConferenceFile


@admin.register(ConferenceFile)
class ConferenceFileAdmin(admin.ModelAdmin):
    list_display = ('get_file_type_display', 'filename', 'file_size', 'uploaded_at', 'updated_at')
    list_filter = ('file_type',)
    search_fields = ('file_type',)
    ordering = ('file_type',)
    readonly_fields = ('uploaded_at', 'updated_at', 'file_size')
    
    fieldsets = (
        ('Файл', {
            'fields': ('file_type', 'file')
        }),
        ('Информация', {
            'fields': ('file_size', 'uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size(self, obj):
        if obj.file:
            size = obj.file.size
            if size < 1024:
                return f'{size} B'
            elif size < 1024 * 1024:
                return f'{size / 1024:.1f} KB'
            else:
                return f'{size / (1024 * 1024):.1f} MB'
        return '-'
    file_size.short_description = 'Размер файла'
