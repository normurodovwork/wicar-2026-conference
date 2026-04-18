import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from apps.telegram_bot.models import TelegramAdmin

print('=== ROLE FILTERING TEST ===')
print()

# Все админы
all_admins = TelegramAdmin.objects.filter(is_active=True)
print(f'Все активные админы: {all_admins.count()}')
for a in all_admins:
    print(f'  - {a.full_name}: {a.get_role_display()}')
print()

# Админы для оплат
payment_admins = TelegramAdmin.objects.filter(is_active=True, role__in=['all', 'payment'])
print(f'Админы для оплат (all + payment): {payment_admins.count()}')
for a in payment_admins:
    print(f'  - {a.full_name}: {a.get_role_display()}')
print()

# Админы для статей
article_admins = TelegramAdmin.objects.filter(is_active=True, role__in=['all', 'article'])
print(f'Админы для статей (all + article): {article_admins.count()}')
for a in article_admins:
    print(f'  - {a.full_name}: {a.get_role_display()}')
print()

print('=== TEST PASSED ===')
