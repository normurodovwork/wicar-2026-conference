"""Настройки для разработки (dev)."""
from .base import *

DEBUG = True

# В dev используем SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR.parent / 'db.sqlite3',
    }
}

# В dev разрешаем все CORS для локальной разработки
CORS_ALLOW_ALL_ORIGINS = True

# Логирование в dev
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
