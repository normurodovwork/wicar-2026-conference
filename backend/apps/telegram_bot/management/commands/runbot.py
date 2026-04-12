import asyncio
from django.core.management.base import BaseCommand
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
            app.run_polling()
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Бот остановлен'))
