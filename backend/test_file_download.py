import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from apps.participants.models import Participant
from apps.telegram_bot.models import TelegramAdmin

print('=== FILE DOWNLOAD TEST ===')
print()

# Проверяем участников с файлами
participants = Participant.objects.filter(has_article=True)
print(f'Участников с статьями: {participants.count()}')

if participants.count() == 0:
    print('❌ Нет участников с загруженными статьями')
    sys.exit(1)

for p in participants:
    print(f'\nУчастник: {p.full_name}')
    print(f'  Email: {p.email}')
    print(f'  Статья: {p.article_file}')
    print(f'  Антиплагиат: {p.plagiarism_file}')
    
    # Проверяем путь к файлу
    if p.article_file:
        try:
            path = p.article_file.path
            print(f'  Путь к статье: {path}')
            print(f'  Файл существует: {os.path.exists(path)}')
        except Exception as e:
            print(f'  ❌ Ошибка получения пути: {e}')
    
    if p.plagiarism_file:
        try:
            path = p.plagiarism_file.path
            print(f'  Путь к антиплагиату: {path}')
            print(f'  Файл существует: {os.path.exists(path)}')
        except Exception as e:
            print(f'  ❌ Ошибка получения пути: {e}')

print()

# Проверяем админов
admins = TelegramAdmin.objects.filter(is_active=True)
print(f'Активных админов: {admins.count()}')
for a in admins:
    print(f'  - {a.full_name} ({a.chat_id}) - {a.get_role_display()}')

print()
print('=== TEST COMPLETE ===')
