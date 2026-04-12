# WICAR 2026 Conference

Веб-приложение для конференции **WICAR 2026** со стеком React + Django REST Framework + SQLite/PostgreSQL.

## 🏗 Архитектура

```
├── backend/               # Django + DRF
│   ├── apps/
│   │   ├── users/        # Пользователи + JWT аутентификация
│   │   ├── applications/ # Заявки на участие
│   │   ├── files/        # Загрузка файлов
│   │   ├── committees/   # Комитеты конференции
│   │   ├── participants/ # Участники конференции
│   │   ├── payment/      # Оплата и расчёт взносов
│   │   └── conference_files/ # Глобальные файлы конференции
│   ├── config/           # Django settings
│   └── requirements/     # Python зависимости
├── src/                  # React фронтенд (Vite, Tailwind, shadcn/ui)
├── nginx/                # Nginx конфигурация для production
├── Dockerfile            # Multi-stage build
├── docker-compose.yml    # Dev окружение
└── docker-compose.prod.yml # Production с PostgreSQL + Nginx
```

## 🚀 Быстрый старт

### Локальная разработка

**1. Запуск Django бэкенда:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements/dev.txt
python manage.py migrate
python create_superuser.py
python populate_committees.py
python populate_payment.py
python manage.py runserver
```

**2. Запуск React фронтенда (в отдельном терминале):**
```bash
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:5173`, API на `http://localhost:8000`.

### Docker (Dev)

```bash
docker-compose up
```

### Docker (Production)

```bash
cp .env.production.example .env.production
# Отредактируйте .env.production
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 API Endpoints

| Метод   | Путь                           | Описание                          | Auth |
|---------|-------------------------------|-----------------------------------|------|
| POST    | `/api/register`               | Регистрация                       | Нет  |
| POST    | `/api/login`                  | Вход, JWT токены                  | Нет  |
| GET     | `/api/me`                     | Данные пользователя               | JWT  |
| PUT     | `/api/profile`                | Обновление профиля                | JWT  |
| POST    | `/api/change-password`        | Смена пароля                      | JWT  |
| GET     | `/api/application`            | Получить заявку                   | JWT  |
| POST    | `/api/application`            | Создать/обновить заявку           | JWT  |
| POST    | `/api/upload`                 | Загрузка файла                    | JWT  |
| DELETE  | `/api/files/:id`              | Удаление файла                    | JWT  |
| GET     | `/api/files?type=`            | Глобальные файлы                  | Нет  |
| GET     | `/api/committees`             | Комитеты конференции              | Нет  |
| GET     | `/api/participants`           | Список участников                 | Админ |
| GET     | `/api/participants/me`        | Данные текущего участника         | JWT  |
| GET     | `/api/payment-info`           | Информация об оплате              | Нет  |
| GET     | `/api/payment-calculation`    | Расчёт суммы оплаты               | JWT  |
| GET     | `/api/conference-files`       | Файлы конференции                 | Нет  |
| GET     | `/api/health`                 | Проверка статуса                  | Нет  |

## 🔐 Админ-панель

Доступна по адресу `/admin/`. Войдите с учётными данными суперпользователя.

**Разделы:**
- **Пользователи** — управление пользователями
- **Заявки** — заявки на участие с actions (одобрить/отклонить)
- **Файлы** — загруженные файлы
- **Комитеты** — организационный и программный комитеты с членами
- **Участники** — полная таблица участников с:
  - Изменением статуса (AJAX)
  - Подтверждением оплаты (AJAX)
  - Скачиванием архивов файлов
  - Экспортом в Excel с финансовым отчётом
- **Файлы конференции** — загрузка инфо писем, сборника, программы

## 🛠 Технологии

| Категория       | Технологии                                       |
|-----------------|--------------------------------------------------|
| Frontend        | React 19, React Router 7, Tailwind CSS 4         |
| UI              | shadcn/ui, Radix UI, Lucide, Framer Motion       |
| Backend         | Django 5, Django REST Framework                  |
| Database        | SQLite (dev) → PostgreSQL (prod)                 |
| Auth            | djangorestframework-simplejwt                    |
| File Upload     | Django FileField + MediaRoot                     |
| Deploy          | Docker, Docker Compose, Nginx, Gunicorn          |
| Admin Panel     | Django Admin + Jazzmin                           |

## 📝 Переменные окружения

Скопируйте `.env.example` в `.env`:

| Переменная              | Описание                                  | Обязательная |
|-------------------------|-------------------------------------------|--------------|
| `DJANGO_SECRET_KEY`     | Секретный ключ Django                     | Да           |
| `DJANGO_DEBUG`          | Режим отладки (True/False)                | Да           |
| `DJANGO_ALLOWED_HOSTS`  | Разрешённые хосты                         | Да           |
| `JWT_ACCESS_TOKEN_LIFETIME` | Время жизни access токена (минуты)   | Нет (60)     |
| `JWT_REFRESH_TOKEN_LIFETIME` | Время жизни refresh токена (минуты) | Нет (1440)   |
| `CORS_ALLOWED_ORIGINS`  | Разрешённые CORS origin                   | Да           |

## 📦 Скрипты

| Команда                      | Описание                              |
|------------------------------|---------------------------------------|
| `npm run dev`                | Запуск фронтенда (Vite)               |
| `npm run build`              | Сборка фронтенда                      |
| `npm run django:runserver`   | Запуск Django сервера                 |
| `npm run django:migrate`     | Применение миграций                   |
| `npm run django:makemigrations` | Создание миграций                  |
| `npm run django:createsuperuser` | Создание суперпользователя        |
| `npm run django:populate-committees` | Заполнить комитеты           |
| `npm run django:populate-participants` | Заполнить участников        |
| `npm run django:populate-payment` | Заполнить данные об оплате        |
| `npm run django:runbot`           | Запуск Telegram бота              |

## 🌐 Локализация

Поддержка 3 языков: 🇷🇺 Русский, 🇬🇧 English, 🇺🇿 O'zbekcha

Переключение языка в навигационной панели.

## 🤖 Telegram Бот

Бот уведомляет администраторов о загрузке чеков об оплате и позволяет подтверждать их прямо в чате.

### Настройка:
1. Создайте бота через **@BotFather** и получите токен.
2. Добавьте `TELEGRAM_BOT_TOKEN` в ваш `.env` или `.env.production`.
3. Добавьте себя в админ-панель Django (`/admin/telegram_bot/telegramadmin/`) указав ваш **Chat ID** (узнайте его командой `/id` в боте).

### Запуск:
```bash
npm run django:runbot
```

### В Docker:
Бот запускается автоматически при запуске `docker-compose` (сервис `telegram_bot`).
