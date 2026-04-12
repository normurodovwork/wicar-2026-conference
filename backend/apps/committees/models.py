from django.db import models


class Committee(models.Model):
    """Модель комитета конференции."""
    
    TYPE_CHOICES = [
        ('organizing', 'Организационный комитет'),
        ('program', 'Программный комитет'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, unique=True, verbose_name='Тип комитета')
    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Комитет'
        verbose_name_plural = 'Комитеты'
        db_table = 'committees'
        ordering = ['order']
    
    def __str__(self):
        return self.name


class CommitteeMember(models.Model):
    """Модель члена комитета."""
    
    ROLE_CHOICES = [
        ('chairman', 'Председатель'),
        ('vice', 'Заместитель председателя'),
        ('member', 'Член комитета'),
    ]
    
    committee = models.ForeignKey(
        Committee,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='Комитет'
    )
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name='Роль')
    position = models.CharField(max_length=255, verbose_name='Должность/Организация')
    photo = models.CharField(max_length=500, blank=True, null=True, verbose_name='URL фото')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    
    class Meta:
        verbose_name = 'Член комитета'
        verbose_name_plural = 'Члены комитетов'
        db_table = 'committee_members'
        ordering = ['committee', 'order']
    
    def __str__(self):
        return f'{self.full_name} ({self.committee.name})'
