import os
import logging
from django.conf import settings
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
from apps.participants.models import Participant
from apps.telegram_bot.models import TelegramAdmin

logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start."""
    chat_id = str(update.effective_chat.id)
    
    # Проверяем, есть ли админ с таким chat_id
    admin = TelegramAdmin.objects.filter(chat_id=chat_id, is_active=True).first()
    
    if not admin:
        await update.message.reply_text(
            '❌ Вы не авторизованы как администратор.\n'
            'Обратитесь к разработчику для получения доступа.'
        )
        return
    
    await update.message.reply_text(
        f'👋 Добро пожаловать, {admin.full_name}!\n\n'
        '🤖 Бот для управления оплатами конференции WICAR 2026\n\n'
        'Команды:\n'
        '/id - Получить ваш Chat ID\n'
        '/report - Финансовый отчёт'
    )


async def get_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /id."""
    chat_id = update.effective_chat.id
    await update.message.reply_text(f'Ваш Chat ID: <code>{chat_id}</code>', parse_mode='HTML')


async def report(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /report - финансовый отчёт."""
    participants = Participant.objects.all()
    
    total_participants = participants.count()
    approved = participants.filter(status='approved').count()
    
    # Оплата UZS
    confirmed_uzs = participants.filter(
        status='approved',
        is_foreign=False,
        payment_confirmed=True
    ).count()
    pending_uzs = participants.filter(
        status='approved',
        is_foreign=False,
        payment_confirmed=False
    ).count()
    
    # Оплата USD
    confirmed_usd = participants.filter(
        status='approved',
        is_foreign=True,
        participation_format__in=['offline', ''],
        payment_confirmed=True
    ).count()
    pending_usd = participants.filter(
        status='approved',
        is_foreign=True,
        participation_format__in=['offline', ''],
        payment_confirmed=False
    ).count()
    
    # Освобождённые (иностранные онлайн)
    exempt = participants.filter(
        status='approved',
        is_foreign=True,
        participation_format='online'
    ).count()
    
    # Суммы
    amount_uzs = getattr(settings, 'PAYMENT_AMOUNT_UZS', 200000)
    amount_usd = getattr(settings, 'PAYMENT_AMOUNT_USD', 20)
    
    total_uzs = confirmed_uzs * amount_uzs
    pending_uzs_amount = pending_uzs * amount_uzs
    total_usd = confirmed_usd * amount_usd
    pending_usd_amount = pending_usd * amount_usd
    
    report_text = (
        '💰 <b>Финансовый отчёт WICAR 2026</b>\n\n'
        f'👥 Всего участников: <b>{total_participants}</b>\n'
        f'✅ Одобрено: <b>{approved}</b>\n\n'
        
        '🇺🇿 <b>Оплата UZS (Узбекистан)</b>\n'
        f'  ✅ Подтверждено: {confirmed_uzs} ({total_uzs:,} UZS)\n'
        f'  ⏳ Ожидает: {pending_uzs} ({pending_uzs_amount:,} UZS)\n\n'
        
        '🌍 <b>Оплата USD (Иностранные)</b>\n'
        f'  ✅ Подтверждено: {confirmed_usd} ({total_usd:,} USD)\n'
        f'  ⏳ Ожидает: {pending_usd} ({pending_usd_amount:,} USD)\n\n'
        
        f'🆓 Освобождённые (онлайн): <b>{exempt}</b>\n\n'
        
        '📊 <b>Итого собрано:</b>\n'
        f'  💵 <b>{total_uzs:,} UZS</b>\n'
        f'  💵 <b>{total_usd:,} USD</b>\n\n'
        
        '📈 <b>Ожидается:</b>\n'
        f'  💵 <b>{pending_uzs_amount:,} UZS</b>\n'
        f'  💵 <b>{pending_usd_amount:,} USD</b>'
    )
    
    await update.message.reply_text(report_text, parse_mode='HTML')


async def send_payment_notification(participant: Participant):
    """Отправка уведомления об оплате админам."""
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token:
        logger.warning('TELEGRAM_BOT_TOKEN не установлен')
        return
    
    admins = TelegramAdmin.objects.filter(is_active=True)
    if not admins.exists():
        logger.warning('Нет активных администраторов Telegram')
        return
    
    # Формируем сообщение
    message = (
        f'💳 <b>Новый чек об оплате</b>\n\n'
        f'👤 <b>ФИО:</b> {participant.full_name}\n'
        f'📧 <b>Email:</b> {participant.email}\n'
        f'📱 <b>Телефон:</b> {participant.phone or "-"}\n'
        f'🏛 <b>Учреждение:</b> {participant.affiliation or "-"}\n'
        f'🌍 <b>Иностранный:</b> {"Да" if participant.is_foreign else "Нет"}\n'
        f'💻 <b>Формат:</b> {participant.participation_format or "-"}\n'
        f'📋 <b>Статус заявки:</b> {participant.get_status_display()}\n'
    )
    
    # Кнопки действий
    keyboard = [
        [
            InlineKeyboardButton("✅ Подтвердить оплату", callback_data=f"confirm_{participant.id}"),
            InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_{participant.id}"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Отправляем всем админам
    for admin in admins:
        try:
            app = Application.builder().token(token).build()
            
            # Отправляем текстовое сообщение
            await app.bot.send_message(
                chat_id=admin.chat_id,
                text=message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
            # Отправляем фото чека
            if participant.payment_file:
                await app.bot.send_photo(
                    chat_id=admin.chat_id,
                    photo=participant.payment_file,
                    caption='📎 Чек об оплате'
                )
            
            logger.info(f'Уведомление отправлено админу {admin.chat_id}')
        except Exception as e:
            logger.error(f'Ошибка отправки уведомления админу {admin.chat_id}: {e}')


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на inline кнопки."""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    action, participant_id = data.split('_')
    participant_id = int(participant_id)
    
    try:
        participant = Participant.objects.get(id=participant_id)
    except Participant.DoesNotExist:
        await query.edit_message_text('❌ Участник не найден')
        return
    
    if action == 'confirm':
        participant.payment_confirmed = True
        participant.save()
        
        await query.edit_message_text(
            f'✅ Оплата подтверждена!\n\n'
            f'👤 {participant.full_name}\n'
            f'📧 {participant.email}'
        )
        
        # Уведомляем пользователя (если есть chat_id)
        # TODO: реализовать уведомление пользователя
        
    elif action == 'reject':
        participant.payment_confirmed = False
        participant.save()
        
        await query.edit_message_text(
            f'❌ Оплата отклонена!\n\n'
            f'👤 {participant.full_name}\n'
            f'📧 {participant.email}'
        )


def setup_bot():
    """Настройка и запуск бота."""
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token:
        logger.warning('TELEGRAM_BOT_TOKEN не установлен')
        return None
    
    app = Application.builder().token(token).build()
    
    # Регистрируем обработчики
    app.add_handler(CommandHandler('start', start))
    app.add_handler(CommandHandler('id', get_id))
    app.add_handler(CommandHandler('report', report))
    app.add_handler(CallbackQueryHandler(handle_callback))
    
    return app
