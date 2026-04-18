import os
import django
import sys

# Configure Django environment
sys.path.append('/home/node_mmi/www/wicar/back')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

try:
    User = get_user_model()
    # Check if admin user exists
    if not User.objects.filter(email='admin@wicar.com').exists():
        User.objects.create_superuser('admin@wicar.com', 'Admin', 'admin123')
        print("Суперпользователь 'admin@wicar.com' / пароль 'admin123' успешно создан!")
    else:
        print("Суперпользователь 'admin@wicar.com' уже существует.")
except Exception as e:
    print(f"Ошибка при создании: {e}")
