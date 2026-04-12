# WICAR 2026 Conference

Веб-приложение для конференции **WICAR 2026** со стеком React + Django REST Framework + SQLite/PostgreSQL.

## 🏗 Архитектура

```
├── backend/               # Django + DRF
│   ├── apps/
│   │   ├── users/        # Пользователи + JWT аутентификация
│   │   ├── applications/ # Заявки на участие
│   │   └── files/        # Загрузка файлов
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
python manage.py createsuperuser
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

| Метод   | Путь                  | Описание                          | Auth |
|---------|-----------------------|-----------------------------------|------|
| POST    | `/api/register`       | Регистрация                       | Нет  |
| POST    | `/api/login`          | Вход, JWT токены                  | Нет  |
| GET     | `/api/me`             | Данные пользователя               | JWT  |
| PUT     | `/api/profile`        | Обновление профиля                | JWT  |
| POST    | `/api/change-password`| Смена пароля                      | JWT  |
| GET     | `/api/application`    | Получить заявку                   | JWT  |
| POST    | `/api/application`    | Создать/обновить заявку           | JWT  |
| POST    | `/api/upload`         | Загрузка файла                    | JWT  |
| DELETE  | `/api/files/:id`      | Удаление файла                    | JWT  |
| GET     | `/api/files?type=`    | Глобальные файлы                  | Нет  |
| GET     | `/api/health`         | Проверка статуса                  | Нет  |

## 🔐 Админ-панель

Доступна по адресу `/admin/`. Войдите с учётными данными суперпользователя.

- Управление пользователями, заявками и файлами
- Красивый интерфейс через Jazzmin
- Actions для массового одобрения/отклонения заявок

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
| `npm run django:runserver`   | Запуск Django сервера                 |
| `npm run django:migrate`     | Применение миграций                   |
| `npm run django:makemigrations` | Создание миграций                  |
| `npm run django:createsuperuser` | Создание суперпользователя        |
| `npm run build`              | Сборка фронтенда                      |
