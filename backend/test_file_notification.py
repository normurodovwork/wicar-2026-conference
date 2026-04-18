import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from apps.participants.models import Participant
from apps.telegram_bot.bot import send_file_notification_sync

print('=== FILE NOTIFICATION TEST ===')
print()

# Получаем участника с файлами
participant = Participant.objects.filter(has_article=True, has_plagiarism=True).first()

if not participant:
    print('❌ Нет участников с обоими файлами')
    sys.exit(1)

print(f'Участник: {participant.full_name}')
print(f'  Статья: {participant.article_file.name if participant.article_file else "Нет"}')
print(f'  Антиплагиат: {participant.plagiarism_file.name if participant.plagiarism_file else "Нет"}')
print()

# Отправляем уведомление о статье
print('Отправляем уведомление о загрузке статьи...')
try:
    send_file_notification_sync(participant.id, 'article')
    print('✅ Уведомление о статье отправлено')
except Exception as e:
    print(f'❌ Ошибка: {e}')
    import traceback
    traceback.print_exc()

print()

# Отправляем уведомление об антиплагиате
print('Отправляем уведомление о загрузке антиплагиата...')
try:
    send_file_notification_sync(participant.id, 'plagiarism')
    print('✅ Уведомление об антиплагиате отправлено')
except Exception as e:
    print(f'❌ Ошибка: {e}')
    import traceback
    traceback.print_exc()

print()
print('Проверьте Telegram - должны прийти 2 уведомления с кнопками для скачивания')
print('=== TEST COMPLETE ===')
