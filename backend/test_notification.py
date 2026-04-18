import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from apps.applications.models import Application
from apps.users.models import User
from apps.telegram_bot.bot import send_application_notification_sync

print('=== TEST NOTIFICATION ===')
print()

# Получаем первого пользователя
try:
    user = User.objects.first()
    if not user:
        print('❌ No users found')
        sys.exit(1)
    
    print(f'User: {user.full_name} ({user.email})')
    
    # Создаём тестовую заявку
    print('Creating test application...')
    app = Application.objects.create(
        user=user,
        direction='Test Direction',
        participation_format='online',
        is_foreign=False,
        affiliation='Test University',
        position='Researcher',
        talk_type='Plenary',
        status='pending'
    )
    
    print(f'✅ Application created: #{app.id}')
    print()
    
    # Отправляем уведомление
    print('Sending notification...')
    send_application_notification_sync(app.id)
    print('✅ Notification sent!')
    print()
    print('Check your Telegram for the notification.')
    
    # Удаляем тестовую заявку
    print()
    print('Cleaning up test application...')
    app.delete()
    print('✅ Done')
    
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
