import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from django.core.management.base import BaseCommand

# Загружаем .env
env_path = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / '.env'
load_dotenv(env_path)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

from apps.telegram_bot.bot import setup_bot


class Command(BaseCommand):
    help = 'Запуск Telegram бота'

    def handle(self, *args, **options):
        self.stdout.write('Запуск Telegram бота...')

        app = setup_bot()
        if not app:
            self.stdout.write(self.style.ERROR('TELEGRAM_BOT_TOKEN не установлен'))
            return

        self.stdout.write(self.style.SUCCESS('Бот успешно запущен!'))
        self.stdout.write('Нажмите Ctrl+C для остановки')

        try:
            app.run_polling(drop_pending_updates=True)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Бот остановлен'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка: {e}'))
            logger.exception('Detailed error:')
