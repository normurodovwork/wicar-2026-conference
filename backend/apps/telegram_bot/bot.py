import os
import logging
import threading
from django.conf import settings
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application as TgApplication, CommandHandler, ContextTypes, CallbackQueryHandler, MessageHandler, filters
from asgiref.sync import sync_to_async
from apps.participants.models import Participant
from apps.applications.models import Application
from apps.files.models import File
from apps.telegram_bot.models import TelegramAdmin

logger = logging.getLogger(__name__)


# ===== Кнопки главного меню =====
MAIN_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("📊 Финансовый отчёт"), KeyboardButton("🆔 Мой ID")],
        [KeyboardButton("👥 Ожидает оплаты"), KeyboardButton("📝 Новые заявки")],
        [KeyboardButton("📄 Проверить статьи"), KeyboardButton("❓ Помощь")],
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
def get_application_by_id(aid):
    """Синхронный запрос к БД для поиска заявки."""
    try:
        return Application.objects.select_related('user').get(id=aid)
    except Application.DoesNotExist:
        return None


@sync_to_async
def get_file_by_id(fid):
    """Синхронный запрос к БД для поиска файла."""
    try:
        return File.objects.select_related('application__user').get(id=fid)
    except File.DoesNotExist:
        return None


@sync_to_async
def approve_application(application_id):
    """Одобрение заявки."""
    try:
        app = Application.objects.get(id=application_id)
        app.status = 'approved'
        app.save()
        # Обновляем Participant если есть
        try:
            participant = Participant.objects.get(application=app)
            participant.status = 'approved'
            participant.save()
        except Participant.DoesNotExist:
            pass
        return True
    except Application.DoesNotExist:
        return False


@sync_to_async
def reject_application(application_id):
    """Отклонение заявки."""
    try:
        app = Application.objects.get(id=application_id)
        app.status = 'rejected'
        app.save()
        # Обновляем Participant если есть
        try:
            participant = Participant.objects.get(application=app)
            participant.status = 'rejected'
            participant.save()
        except Participant.DoesNotExist:
            pass
        return True
    except Application.DoesNotExist:
        return False


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
    elif text == "📝 Новые заявки":
        await show_pending_applications(update, context)
    elif text == "📄 Проверить статьи":
        await show_articles_for_review(update, context)
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


@sync_to_async
def get_pending_applications():
    """Получить заявки в статусе pending."""
    return list(Application.objects.filter(status='pending').select_related('user').order_by('-created_at')[:10])


@sync_to_async
def get_articles_with_files():
    """Получить участников с загруженными статьями."""
    return list(Participant.objects.filter(
        has_article=True
    ).exclude(article_file='').order_by('-created_at')[:10])


async def show_pending_applications(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать заявки в статусе pending."""
    try:
        applications = await get_pending_applications()

        if not applications:
            await update.message.reply_text('✅ Нет заявок в статусе ожидания!')
            return

        for app in applications:
            text = (
                f'📝 <b>Новая заявка #{app.id}</b>\n\n'
                f'👤 <b>ФИО:</b> {app.user.full_name}\n'
                f'📧 <b>Email:</b> {app.user.email}\n'
                f'📱 <b>Телефон:</b> {app.user.phone or "-"}\n'
                f'📚 <b>Направление:</b> {app.direction}\n'
                f'💻 <b>Формат:</b> {"Очно" if app.participation_format == "offline" else "Онлайн"}\n'
                f'🌍 <b>Иностранный:</b> {"Да" if app.is_foreign else "Нет"}\n'
                f'🏛 <b>Учреждение:</b> {app.affiliation or "-"}\n'
                f'📋 <b>Должность:</b> {app.position or "-"}\n'
                f'🎤 <b>Тип доклада:</b> {app.talk_type or "-"}\n'
                f'📅 <b>Дата подачи:</b> {app.created_at.strftime("%d.%m.%Y %H:%M")}\n'
            )

            # Кнопки действий
            keyboard = [
                [
                    InlineKeyboardButton("✅ Одобрить", callback_data=f"app_approve_{app.id}"),
                    InlineKeyboardButton("❌ Отклонить", callback_data=f"app_reject_{app.id}"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)

            await update.message.reply_text(text, parse_mode='HTML', reply_markup=reply_markup)
    except Exception as e:
        logger.error(f'Error in show_pending_applications: {e}')


async def show_articles_for_review(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать участников с загруженными статьями для проверки."""
    try:
        participants = await get_articles_with_files()

        if not participants:
            await update.message.reply_text('✅ Нет загруженных статей для проверки!')
            return

        for p in participants:
            text = (
                f'📄 <b>Статья на проверку</b>\n\n'
                f'👤 <b>ФИО:</b> {p.full_name}\n'
                f'📧 <b>Email:</b> {p.email}\n'
                f'📚 <b>Направление:</b> {p.direction or "-"}\n'
                f'💻 <b>Формат:</b> {"Очно" if p.participation_format == "offline" else "Онлайн"}\n'
                f'📝 <b>Статус заявки:</b> {p.get_status_display()}\n'
                f'📄 <b>Статья:</b> {"✅ Загружена" if p.has_article else "❌ Не загружена"}\n'
                f'🛡 <b>Антиплагиат:</b> {"✅ Загружен" if p.has_plagiarism else "❌ Не загружен"}\n'
            )

            # Кнопки действий
            keyboard = []
            if p.article_file:
                keyboard.append([InlineKeyboardButton("📄 Скачать статью", callback_data=f"file_article_{p.id}")])
            if p.plagiarism_file:
                keyboard.append([InlineKeyboardButton("🛡 Скачать антиплагиат", callback_data=f"file_plagiarism_{p.id}")])

            if keyboard:
                reply_markup = InlineKeyboardMarkup(keyboard)
                await update.message.reply_text(text, parse_mode='HTML', reply_markup=reply_markup)
            else:
                await update.message.reply_text(text, parse_mode='HTML')
    except Exception as e:
        logger.error(f'Error in show_articles_for_review: {e}')


async def show_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать справку."""
    help_text = (
        '📋 <b>Справка по командам бота</b>\n\n'
        '/start - Главное меню\n'
        '/id - Получить ваш Chat ID\n'
        '/report - Финансовый отчёт\n'
        '/pending - Ожидает оплаты\n'
        '/applications - Новые заявки\n'
        '/articles - Проверить статьи\n\n'
        '🔔 <b>Уведомления:</b>\n'
        'Когда участник загружает чек, вы получите\n'
        'сообщение с кнопками подтверждения.\n\n'
        '✅ Подтвердить - подтвердить оплату\n'
        '❌ Отклонить - отклонить оплату\n\n'
        '📝 <b>Управление заявками:</b>\n'
        'Просматривайте новые заявки и управляйте ими\n'
        'кнопками Одобрить/Отклонить\n\n'
        '📄 <b>Проверка статей:</b>\n'
        'Просматривайте и скачивайте статьи\n'
        'и отчёты антиплагиата участников'
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

    # Кнопки одобрения/отклонения заявок
    elif data.startswith('app_approve_') or data.startswith('app_reject_'):
        parts = data.split('_')
        action = parts[1]  # approve или reject
        application_id = int(parts[2])

        application = await get_application_by_id(application_id)
        if not application:
            await query.edit_message_text('❌ Заявка не найдена')
            return

        if action == 'approve':
            success = await approve_application(application_id)
            if success:
                await query.edit_message_text(
                    f'✅ <b>Заявка одобрена!</b>\n\n'
                    f'👤 {application.user.full_name}\n'
                    f'📧 {application.user.email}',
                    parse_mode='HTML',
                    reply_markup=None
                )
            else:
                await query.edit_message_text('❌ Ошибка при одобрении заявки')

        elif action == 'reject':
            success = await reject_application(application_id)
            if success:
                await query.edit_message_text(
                    f'❌ <b>Заявка отклонена!</b>\n\n'
                    f'👤 {application.user.full_name}\n'
                    f'📧 {application.user.email}',
                    parse_mode='HTML',
                    reply_markup=None
                )
            else:
                await query.edit_message_text('❌ Ошибка при отклонении заявки')

    # Кнопки скачивания файлов (статья/антиплагиат)
    elif data.startswith('file_article_') or data.startswith('file_plagiarism_'):
        parts = data.split('_')
        file_type = parts[1]  # article или plagiarism
        participant_id = int(parts[2])

        participant = await get_participant_by_id(participant_id)
        if not participant:
            await query.edit_message_text('❌ Участник не найден')
            return

        file_field = participant.article_file if file_type == 'article' else participant.plagiarism_file
        file_label = 'Статья' if file_type == 'article' else 'Антиплагиат'

        if file_field:
            # Отправляем файл
            try:
                import asyncio
                from django.conf import settings
                
                # Получаем полный путь к файлу
                file_path = file_field.path if hasattr(file_field, 'path') else str(file_field)
                
                logger.info(f'Отправка файла: {file_path}')
                
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                async def send_file():
                    from django.conf import settings
                    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None) or os.environ.get('TELEGRAM_BOT_TOKEN')
                    app = TgApplication.builder().token(token).build()
                    async with app:
                        # Открываем и отправляем файл
                        with open(file_path, 'rb') as f:
                            await app.bot.send_document(
                                chat_id=update.effective_chat.id,
                                document=f,
                                filename=file_field.name.split('/')[-1],
                                caption=f'📄 <b>{file_label}</b>\n\n👤 {participant.full_name}\n📧 {participant.email}',
                                parse_mode='HTML'
                            )

                loop.run_until_complete(send_file())
                await query.answer(f'✅ {file_label} отправлен')
            except FileNotFoundError:
                logger.error(f'Файл не найден: {file_field}')
                await query.answer(f'❌ Файл не найден на сервере', show_alert=True)
            except Exception as e:
                logger.error(f'Ошибка отправки файла: {e}', exc_info=True)
                await query.answer(f'❌ Ошибка отправки файла: {str(e)}', show_alert=True)
        else:
            await query.answer(f'❌ {file_label} не найден', show_alert=True)


def send_payment_notification_sync(participant_id: int):
    """Синхронная обёртка для отправки уведомления об оплате (вызывается из Django view)."""
    def _send():
        from django.conf import settings
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None) or os.environ.get('TELEGRAM_BOT_TOKEN')
        if not token:
            logger.warning('TELEGRAM_BOT_TOKEN не установлен')
            return

        # Получаем админов, которые должны получать уведомления об оплатах
        admins = list(TelegramAdmin.objects.filter(
            is_active=True,
            role__in=['all', 'payment']
        ))
        if not admins:
            logger.warning('Нет активных администраторов Telegram для уведомлений об оплате')
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
        app = TgApplication.builder().token(token).build()

        # Отправляем всем админам с ролью all или payment
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
                logger.info(f'Уведомление об оплате отправлено админу {admin.full_name} ({admin.chat_id})')
            except Exception as e:
                logger.error(f'Ошибка отправки уведомления об оплате админу {admin.chat_id}: {e}', exc_info=True)

    # Запускаем в отдельном потоке
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_application_notification_sync(application_id: int):
    """Синхронная обёртка для отправки уведомления о новой заявке."""
    def _send():
        from django.conf import settings
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None) or os.environ.get('TELEGRAM_BOT_TOKEN')
        if not token:
            logger.warning('TELEGRAM_BOT_TOKEN не установлен')
            return

        # Получаем админов, которые должны получать уведомления о заявках (все + статьи)
        admins = list(TelegramAdmin.objects.filter(
            is_active=True,
            role__in=['all', 'article']
        ))
        if not admins:
            logger.warning('Нет активных администраторов Telegram для уведомлений о заявках')
            return

        try:
            application = Application.objects.select_related('user').get(id=application_id)
        except Application.DoesNotExist:
            logger.error(f'Заявка {application_id} не найдена')
            return

        # Формируем сообщение
        message = (
            f'📝 <b>Новая заявка #{application.id}</b>\n\n'
            f'👤 <b>ФИО:</b> {application.user.full_name}\n'
            f'📧 <b>Email:</b> {application.user.email}\n'
            f'📱 <b>Телефон:</b> {application.user.phone or "-"}\n'
            f'📚 <b>Направление:</b> {application.direction}\n'
            f'💻 <b>Формат:</b> {"Очно" if application.participation_format == "offline" else "Онлайн"}\n'
            f'🌍 <b>Иностранный:</b> {"Да" if application.is_foreign else "Нет"}\n'
            f'🏛 <b>Учреждение:</b> {application.affiliation or "-"}\n'
            f'📋 <b>Должность:</b> {application.position or "-"}\n'
            f'🎤 <b>Тип доклада:</b> {application.talk_type or "-"}\n'
            f'📅 <b>Дата подачи:</b> {application.created_at.strftime("%d.%m.%Y %H:%M")}\n'
        )

        # Кнопки действий (inline)
        keyboard = [
            [
                InlineKeyboardButton("✅ Одобрить", callback_data=f"app_approve_{application.id}"),
                InlineKeyboardButton("❌ Отклонить", callback_data=f"app_reject_{application.id}"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        # Создаём приложение бота
        app = TgApplication.builder().token(token).build()

        # Отправляем всем админам с ролью all или article
        for admin in admins:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                async def send_to_admin():
                    async with app:
                        await app.bot.send_message(
                            chat_id=admin.chat_id,
                            text=message,
                            parse_mode='HTML',
                            reply_markup=reply_markup
                        )

                loop.run_until_complete(send_to_admin())
                logger.info(f'Уведомление о заявке отправлено админу {admin.full_name} ({admin.chat_id})')
            except Exception as e:
                logger.error(f'Ошибка отправки уведомления о заявке админу {admin.chat_id}: {e}', exc_info=True)

    # Запускаем в отдельном потоке
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_file_notification_sync(participant_id: int, file_type: str):
    """Синхронная обёртка для отправки уведомления о загрузке файла (статья/антиплагиат)."""
    def _send():
        from django.conf import settings
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None) or os.environ.get('TELEGRAM_BOT_TOKEN')
        if not token:
            logger.warning('TELEGRAM_BOT_TOKEN не установлен')
            return

        # Получаем админов, которые должны получать уведомления о статьях
        admins = list(TelegramAdmin.objects.filter(
            is_active=True,
            role__in=['all', 'article']
        ))
        if not admins:
            logger.warning('Нет активных администраторов Telegram для уведомлений о файлах')
            return

        try:
            participant = Participant.objects.get(id=participant_id)
        except Participant.DoesNotExist:
            logger.error(f'Участник {participant_id} не найден')
            return

        file_label = '📄 Статья' if file_type == 'article' else '🛡 Антиплагиат'

        # Проверяем, загружены ли оба документа
        both_files = participant.has_article and participant.has_plagiarism

        # Формируем сообщение
        message = (
            f'{file_label} <b>загружена</b>\n\n'
            f'👤 <b>ФИО:</b> {participant.full_name}\n'
            f'📧 <b>Email:</b> {participant.email}\n'
            f'📚 <b>Направление:</b> {participant.direction or "-"}\n'
            f'💻 <b>Формат:</b> {"Очно" if participant.participation_format == "offline" else "Онлайн"}\n'
            f'📄 <b>Статья:</b> {"✅" if participant.has_article else "❌"}\n'
            f'🛡 <b>Антиплагиат:</b> {"✅" if participant.has_plagiarism else "❌"}\n'
        )

        if both_files:
            message = '🎉 <b>Оба документа загружены!</b>\n\n' + message

        # Кнопки действий (inline)
        keyboard = []
        if participant.has_article:
            keyboard.append([InlineKeyboardButton("📄 Скачать статью", callback_data=f"file_article_{participant.id}")])
        if participant.has_plagiarism:
            keyboard.append([InlineKeyboardButton("🛡 Скачать антиплагиат", callback_data=f"file_plagiarism_{participant.id}")])

        reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None

        # Создаём приложение бота
        app = TgApplication.builder().token(token).build()

        # Отправляем всем админам с ролью all или article
        for admin in admins:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                async def send_to_admin():
                    async with app:
                        await app.bot.send_message(
                            chat_id=admin.chat_id,
                            text=message,
                            parse_mode='HTML',
                            reply_markup=reply_markup
                        )

                loop.run_until_complete(send_to_admin())
                logger.info(f'Уведомление о файле отправлено админу {admin.full_name} ({admin.chat_id})')
            except Exception as e:
                logger.error(f'Ошибка отправки уведомления о файле админу {admin.chat_id}: {e}', exc_info=True)

    # Запускаем в отдельном потоке
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def setup_bot():
    """Настройка и запуск бота."""
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token:
        logger.warning('TELEGRAM_BOT_TOKEN не установлен')
        return None

    app = TgApplication.builder().token(token).build()

    # Регистрируем обработчики
    app.add_handler(CommandHandler('start', start))
    app.add_handler(CommandHandler('id', get_id))
    app.add_handler(CommandHandler('report', report))
    app.add_handler(CommandHandler('pending', show_pending))
    app.add_handler(CommandHandler('applications', show_pending_applications))
    app.add_handler(CommandHandler('articles', show_articles_for_review))

    # Обработка нажатий на кнопки ReplyKeyboard
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_menu_buttons))

    # Обработка inline кнопок (для уведомлений)
    app.add_handler(CallbackQueryHandler(handle_callback))

    return app
