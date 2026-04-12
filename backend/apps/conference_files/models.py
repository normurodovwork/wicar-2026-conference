import os
from django.db import models


def conference_file_path(instance, filename):
    """Генерация пути для файла конференции."""
    ext = os.path.splitext(filename)[1]
    return f'conference/{instance.file_type}/{instance.get_file_type_display()}{ext}'


class ConferenceFile(models.Model):
    """Модель файлов конференции (инфо письма, сборник, программа)."""
    
    FILE_TYPE_CHOICES = [
        ('info_letter_1', '1-е информационное письмо'),
        ('info_letter_2', '2-е информационное письмо'),
        ('collection', 'Сборник тезисов'),
        ('program', 'Программа конференции'),
    ]
    
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, unique=True, verbose_name='Тип файла')
    file = models.FileField(upload_to=conference_file_path, verbose_name='Файл')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата загрузки')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Файл конференции'
        verbose_name_plural = 'Файлы конференции'
        db_table = 'conference_files'
    
    def __str__(self):
        return self.get_file_type_display()
    
    def filename(self):
        return os.path.basename(self.file.name) if self.file else ''
