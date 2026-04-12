import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.participants.models import Participant
from apps.users.models import User
from apps.applications.models import Application


def populate_participants():
    """Создаёт участников из существующих пользователей и заявок."""
    
    # Получаем всех пользователей с заявками
    users_with_applications = User.objects.filter(application__isnull=False)
    
    created_count = 0
    skipped_count = 0
    
    for user in users_with_applications:
        # Проверяем, существует ли уже участник
        if Participant.objects.filter(user=user).exists():
            skipped_count += 1
            print(f'Пропущен: {user.full_name} (уже существует)')
            continue
        
        # Получаем заявку
        try:
            application = user.application
        except Application.DoesNotExist:
            skipped_count += 1
            print(f'Пропущен: {user.full_name} (нет заявки)')
            continue
        
        # Создаём участника
        participant = Participant.objects.create(
            user=user,
            application=application,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone or '',
            affiliation=application.affiliation or '',
            direction=application.direction or '',
            participation_format=application.participation_format or '',
            position=application.position or '',
            talk_type=application.talk_type or '',
            status=application.status,
        )
        
        created_count += 1
        print(f'Создан участник: {participant.full_name} ({participant.email})')
    
    print(f'\nГотово! Создано: {created_count}, Пропущено: {skipped_count}')


if __name__ == '__main__':
    populate_participants()
