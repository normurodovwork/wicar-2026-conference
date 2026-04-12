import time
from django.db import models
from django.conf import settings


def file_upload_path(instance, filename):
    """Генерация пути для загрузки файла."""
    return f'{instance.type}/{int(time.time())}_{filename}'


class File(models.Model):
    """Модель файла."""
    
    TYPE_CHOICES = [
        ('article', 'Статья'),
        ('plagiarism', 'Отчет о плагиате'),
        ('payment', 'Квитанция об оплате'),
        ('info_letter', 'Информационное письмо'),
        ('collection', 'Сборник'),
        ('program', 'Программа'),
    ]
    
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='files',
        verbose_name='Заявка'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='Тип файла')
    file = models.FileField(upload_to=file_upload_path, verbose_name='Файл')
    original_name = models.CharField(max_length=255, verbose_name='Оригинальное имя')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата загрузки')
    
    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        db_table = 'files'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f'{self.original_name} ({self.get_type_display()})'
