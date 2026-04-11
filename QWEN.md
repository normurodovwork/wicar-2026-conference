# WICAR 2026 Conference

## Project Overview

Это веб-приложение для конференции **WICAR 2026**, построенное на стеке React + Express + SQLite. Приложение предоставляет функционал регистрации/авторизации пользователей, подачи заявок на участие в конференции (с выбором направления и формата участия), загрузки файлов (статьи, подтверждения оплаты, информационные письма) и панели управления (dashboard).

### Ключевые возможности
- **Аутентификация**: регистрация и вход с JWT-токенами (bcrypt для хеширования паролей)
- **Заявки**: пользователи могут подать заявку на участие в конференции
- **Загрузка файлов**: поддержка загрузки статей, подтверждений оплаты и других документов через Multer
- **Роутинг**: React Router (Home, Login, Register, Dashboard)
- **UI**: Tailwind CSS v4, shadcn/ui компоненты, Lucide иконки, Framer Motion для анимаций
- **Тема**: next-themes для переключения тем (светлая/тёмная/system)
- **Интернационализация**: LanguageProvider для многоязычной поддержки

### Архитектура
```
├── server.ts          # Express-сервер + API роуты + Vite middleware
├── src/
│   ├── App.tsx        # Основной React-компонент с роутингом
│   ├── main.tsx       # Точка входа React
│   ├── components/    # UI-компоненты (Navbar, LanguageProvider, SeoHead)
│   ├── pages/         # Страницы (Home, Login, Register, Dashboard)
│   └── lib/
│       └── db.ts      # Инициализация SQLite (better-sqlite3)
├── database.sqlite    # SQLite база данных (создаётся автоматически)
├── uploads/           # Папка для загруженных файлов
└── components/ui/     # shadcn/ui компоненты
```

## Technologies

| Категория       | Технологии                                       |
|-----------------|--------------------------------------------------|
| Frontend        | React 19, React Router 7, Tailwind CSS 4         |
| UI              | shadcn/ui, base-ui, Radix UI, Lucide, Framer Motion |
| Backend         | Express 4, TypeScript                            |
| Database        | SQLite (better-sqlite3)                          |
| Auth            | JWT (jsonwebtoken), bcryptjs                     |
| File Upload     | Multer                                           |
| Build           | Vite 6, tsx                                      |
| Theming         | next-themes                                      |

## Building and Running

### Prerequisites
- Node.js

### Commands

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (Express + Vite middleware)
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview

# Очистка dist/
npm run clean

# Проверка типов TypeScript
npm run lint
```

### Environment Variables

Скопируйте `.env.example` в `.env.local` и настройте:

| Переменная        | Описание                                  | Обязательная |
|-------------------|-------------------------------------------|--------------|
| `JWT_SECRET`      | Секретный ключ для подписи JWT токенов    | Да           |
| `GEMINI_API_KEY`  | API ключ для Gemini AI                    | Опционально  |
| `APP_URL`         | URL приложения (для хостинга)             | Опционально  |

## Database

Приложение использует **SQLite** через `better-sqlite3`. Схема создаётся автоматически при запуске (`src/lib/db.ts`):

- **users** — пользователи (id, full_name, email, phone, password, role)
- **applications** — заявки на участие (id, user_id, direction, participation_format, status, created_at)
- **files** — загруженные файлы (id, application_id, type, file_url, original_name)

Если база данных повреждена, достаточно удалить `database.sqlite` — она пересоздастся при следующем запуске (но данные будут утеряны).

## API Endpoints

| Метод   | Путь                  | Описание                          | Auth |
|---------|-----------------------|-----------------------------------|------|
| POST    | `/api/register`       | Регистрация нового пользователя   | Нет  |
| POST    | `/api/login`          | Вход, возврат JWT токена          | Нет  |
| GET     | `/api/me`             | Получение данных текущего пользователя | Да |
| GET     | `/api/application`    | Получение заявки пользователя     | Да   |
| POST    | `/api/application`    | Создание/обновление заявки        | Да   |
| POST    | `/api/upload`         | Загрузка файла                    | Да   |
| GET     | `/api/files`          | Получение глобальных файлов по типу | Нет |
| GET     | `/api/health`         | Проверка работоспособности        | Нет  |

## Development Conventions

- **TypeScript** используется повсеместно (как frontend, так и backend)
- **tsx** для запуска TypeScript-файлов без предварительной компиляции
- **shadcn/ui** компоненты находятся в `components/ui/`
- **Утилиты**: `cn()` из `@/lib/utils` для объединения классов Tailwind
- **Алиасы**: `@` указывает на корень проекта (настроено в `vite.config.ts` и `components.json`)
