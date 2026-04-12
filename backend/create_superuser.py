import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(email='admin@wicar.com').exists():
    User.objects.create_superuser(email='admin@wicar.com', full_name='Admin', password='admin123')
    print('Суперпользователь создан: admin@wicar.com / admin123')
else:
    print('Пользователь уже существует')
