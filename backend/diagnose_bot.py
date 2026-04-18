import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from django.conf import settings
from apps.telegram_bot.models import TelegramAdmin
from apps.applications.models import Application
from apps.participants.models import Participant

print('=== TELEGRAM BOT DIAGNOSTICS ===')
print()

# 1. Проверка токена
print('1. TELEGRAM_BOT_TOKEN:')
token = settings.TELEGRAM_BOT_TOKEN
if token:
    print(f'   ✅ SET (length: {len(token)})')
    print(f'   Token preview: {token[:10]}...')
else:
    print('   ❌ NOT SET')
print()

# 2. Проверка админов
print('2. Active Telegram admins:')
admins = TelegramAdmin.objects.filter(is_active=True)
print(f'   Count: {admins.count()}')
for admin in admins:
    print(f'   - {admin.full_name} (chat_id: {admin.chat_id})')
print()

# 3. Проверка заявок
print('3. Applications:')
print(f'   Total: {Application.objects.count()}')
print(f'   Pending: {Application.objects.filter(status="pending").count()}')
print(f'   Approved: {Application.objects.filter(status="approved").count()}')
print(f'   Rejected: {Application.objects.filter(status="rejected").count()}')
print()

# 4. Проверка участников
print('4. Participants:')
print(f'   Total: {Participant.objects.count()}')
print(f'   With articles: {Participant.objects.filter(has_article=True).count()}')
print(f'   With plagiarism: {Participant.objects.filter(has_plagiarism=True).count()}')
print()

# 5. Проверка signals
print('5. Signals:')
from django.db.models import signals
app_receivers = [r for r in signals.post_save.receivers if 'Application' in str(r)]
file_receivers = [r for r in signals.post_save.receivers if 'File' in str(r)]
print(f'   Application post_save receivers: {len(app_receivers)}')
print(f'   File post_save receivers: {len(file_receivers)}')
print()

# 6. Тест отправки уведомления
print('6. Test notification send:')
if token and admins.count() > 0:
    print('   Testing send_application_notification_sync...')
    try:
        from apps.telegram_bot.bot import send_application_notification_sync
        # Создадим тестовое уведомление (но не будем отправлять реально)
        print('   ✅ Function imported successfully')
    except Exception as e:
        print(f'   ❌ Import error: {e}')
else:
    print('   ⏭️ Skipped (no token or admins)')

print()
print('=== DIAGNOSTICS COMPLETE ===')
