import os
import logging
import threading
from django.conf import settings
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
from asgiref.sync import sync_to_async
from apps.participants.models import Participant
from apps.telegram_bot.models import TelegramAdmin

logger = logging.getLogger(__name__)


# ===== Кнопки главного меню =====
MAIN_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("📊 Финансовый отчёт"), KeyboardButton("🆔 Мой ID")],
        [KeyboardButton("👥 Ожидает оплаты")],
        [KeyboardButton("❓ Помощь")],
    ],
    resize_keyboard=True,
    one_time_keyboard=False
)

NON_ADMIN_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("🆔 Узнать мой Chat ID")],
    ],
    resize_keyboard=True
)


@sync_to_async
def get_admin_by_chat_id(chat_id):
    """Синхронный запрос к БД для поиска админа."""
    return TelegramAdmin.objects.filter(chat_id=str(chat_id), is_active=True).first()


@sync_to_async
def get_participant_by_id(pid):
    """Синхронный запрос к БД для поиска участника."""
    try:
        return Participant.objects.get(id=pid)
    except Participant.DoesNotExist:
        return None


@sync_to_async
def confirm_payment(participant):
    """Синхронное подтверждение оплаты."""
    participant.payment_confirmed = True
    participant.save()


@sync_to_async
def reject_payment(participant):
    """Синхронное отклонение оплаты."""
    participant.payment_confirmed = False
    participant.save()


@sync_to_async
def get_all_participants():
    """Синхронный запрос всех участников."""
    return list(Participant.objects.all())


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start."""
    try:
        chat_id = str(update.effective_chat.id)
        logger.info(f'/start received from chat_id={chat_id}')
        
        # Проверяем, есть ли админ с таким chat_id
        admin = await get_admin_by_chat_id(chat_id)
        logger.info(f'Admin lookup: {admin.full_name if admin else "Not found"}')
        
        if not admin:
            await update.message.reply_text(
                '👋 <b>Добро пожаловать!</b>\n\n'
                '🔒 У вас нет прав администратора.\n'
                'Чтобы получить доступ, сообщите разработчику ваш Chat ID.\n\n'
                f'Ваш ID: <code>{chat_id}</code>',
                parse_mode='HTML',
                reply_markup=NON_ADMIN_KEYBOARD
            )
            return

        # АДМИН: Главное меню с кнопками внизу
        await update.message.reply_text(
            f'👋 <b>Добро пожаловать, {admin.full_name}!</b>\n\n'
            '🤖 <b>WICAR 2026 Admin Bot</b>\n'
            'Бот для управления оплатами конференции WICAR 2026\n\n'
            '🔔 Когда участник загружает чек об оплате,\n'
            'вы получите уведомление с кнопками подтверждения.\n\n'
            'Используйте кнопки ниже или команды:\n'
            '/report - отчёт\n'
            '/id - ваш ID\n'
            '/pending - ожидающие оплаты',
            parse_mode='HTML',
            reply_markup=MAIN_KEYBOARD
        )
        
    except Exception as e:
        logger.error(f'Unexpected error in /start: {e}', exc_info=True)
        try:
            await update.message.reply_text(f'❌ Произошла ошибка: {str(e)}')
        except:
            pass


async def handle_menu_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на кнопки ReplyKeyboard."""
    text = update.message.text
    
    if text == "📊 Финансовый отчёт":
        await _send_report(update, context)
    elif text == "🆔 Мой ID" or text == "🆔 Узнать мой Chat ID":
        await get_id(update, context)
    elif text == "👥 Ожидает оплаты":
        await show_pending(update, context)
    elif text == "❓ Помощь":
        await show_help(update, context)


async def get_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /id."""
    try:
        chat_id = update.effective_chat.id
        await update.message.reply_text(
            f'🆔 <b>Ваш Chat ID:</b>\n<code>{chat_id}</code>\n\n'
            'Сообщите этот ID разработчику для добавления в админку.',
            parse_mode='HTML'
        )
    except Exception as e:
        logger.error(f'Error in /id: {e}')


async def report(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /report - финансовый отчёт."""
    await _send_report(update, context)


async def _send_report(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправка финансового отчёта."""
    try:
        participants = await get_all_participants()
        
        total_participants = len(participants)
        approved = sum(1 for p in participants if p.status == 'approved')
        
        # Оплата UZS
        confirmed_uzs = sum(1 for p in participants if p.status == 'approved' and not p.is_foreign and p.payment_confirmed)
        pending_uzs = sum(1 for p in participants if p.status == 'approved' and not p.is_foreign and not p.payment_confirmed)
        
        # Оплата USD
        confirmed_usd = sum(1 for p in participants if p.status == 'approved' and p.is_foreign and p.participation_format in ['offline', ''] and p.payment_confirmed)
        pending_usd = sum(1 for p in participants if p.status == 'approved' and p.is_foreign and p.participation_format in ['offline', ''] and not p.payment_confirmed)
        
        # Освобождённые (иностранные онлайн)
        exempt = sum(1 for p in participants if p.status == 'approved' and p.is_foreign and p.participation_format == 'online')
        
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
    except Exception as e:
        logger.error(f'Error in /report: {e}')
        await update.message.reply_text('❌ Ошибка при формировании отчёта.')


async def show_pending(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать участников, ожидающих оплаты."""
    try:
        participants = await get_all_participants()
        pending = [p for p in participants if p.status == 'approved' and not p.payment_confirmed]
        pending = pending[:10]
        
        if not pending:
            await update.message.reply_text('✅ Все одобренные участники уже подтвердили оплату!')
            return
        
        text = '⏳ <b>Ожидают оплаты (последние 10):</b>\n\n'
        for p in pending:
            text += f'👤 {p.full_name}\n'
            text += f'   📧 {p.email}\n'
            text += f'   {"🇺🇿 UZS" if not p.is_foreign else "🌍 USD"}\n\n'
        
        await update.message.reply_text(text, parse_mode='HTML')
    except Exception as e:
        logger.error(f'Error in show_pending: {e}')


async def show_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать справку."""
    help_text = (
        '📋 <b>Справка по командам бота</b>\n\n'
        '/start - Главное меню\n'
        '/id - Получить ваш Chat ID\n'
        '/report - Финансовый отчёт\n'
        '/pending - Ожидает оплаты\n\n'
        '🔔 <b>Уведомления:</b>\n'
        'Когда участник загружает чек, вы получите\n'
        'сообщение с кнопками подтверждения.\n\n'
        '✅ Подтвердить - подтвердить оплату\n'
        '❌ Отклонить - отклонить оплату'
    )
    await update.message.reply_text(help_text, parse_mode='HTML')


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на inline кнопки (для уведомлений)."""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    # Кнопки подтверждения/отклонения оплаты
    if data.startswith('confirm_') or data.startswith('reject_'):
        action, participant_id = data.split('_')
        participant_id = int(participant_id)
        
        participant = await get_participant_by_id(participant_id)
        if not participant:
            await query.edit_message_text('❌ Участник не найден')
            return
        
        if action == 'confirm':
            await confirm_payment(participant)
            
            await query.edit_message_caption(
                caption=f'✅ <b>Оплата подтверждена!</b>\n\n👤 {participant.full_name}\n📧 {participant.email}',
                parse_mode='HTML',
                reply_markup=None
            )
            
        elif action == 'reject':
            await reject_payment(participant)
            
            await query.edit_message_caption(
                caption=f'❌ <b>Оплата отклонена!</b>\n\n👤 {participant.full_name}\n📧 {participant.email}',
                parse_mode='HTML',
                reply_markup=None
            )


def send_payment_notification_sync(participant_id: int):
    """Синхронная обёртка для отправки уведомления (вызывается из Django view)."""
    def _send():
        token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not token:
            logger.warning('TELEGRAM_BOT_TOKEN не установлен')
            return
        
        admins = list(TelegramAdmin.objects.filter(is_active=True))
        if not admins:
            logger.warning('Нет активных администраторов Telegram')
            return
        
        try:
            participant = Participant.objects.get(id=participant_id)
        except Participant.DoesNotExist:
            logger.error(f'Участник {participant_id} не найден')
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
        
        # Кнопки действий (inline)
        keyboard = [
            [
                InlineKeyboardButton("✅ Подтвердить", callback_data=f"confirm_{participant.id}"),
                InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_{participant.id}"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Создаём приложение бота
        app = Application.builder().token(token).build()
        
        # Отправляем всем админам
        for admin in admins:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def send_to_admin():
                    async with app:
                        # Отправляем фото с текстом сообщения как подпись (caption)
                        # и прикрепляем кнопки действий
                        photo_to_send = participant.payment_file if participant.payment_file else None
                        
                        if photo_to_send:
                            await app.bot.send_photo(
                                chat_id=admin.chat_id,
                                photo=photo_to_send,
                                caption=message,
                                parse_mode='HTML',
                                reply_markup=reply_markup
                            )
                        else:
                            # Если фото нет (на всякий случай), отправляем просто текст
                            await app.bot.send_message(
                                chat_id=admin.chat_id,
                                text=message,
                                parse_mode='HTML',
                                reply_markup=reply_markup
                            )
                
                loop.run_until_complete(send_to_admin())
                logger.info(f'Уведомление отправлено админу {admin.chat_id}')
            except Exception as e:
                logger.error(f'Ошибка отправки уведомления админу {admin.chat_id}: {e}')
    
    # Запускаем в отдельном потоке
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


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
    app.add_handler(CommandHandler('pending', show_pending))
    
    # Обработка нажатий на кнопки ReplyKeyboard
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_menu_buttons))
    
    # Обработка inline кнопок (для уведомлений)
    app.add_handler(CallbackQueryHandler(handle_callback))
    
    return app
