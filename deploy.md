# Деплой WICAR 2026 — Production

## 📡 Данные сервера

| Параметр | Значение |
|----------|----------|
| **Сайт** | `https://wicar.uwed.uz` |
| **SSH** | `192.168.23.43` |
| **Username** | `node_mmi` |
| **Node Port** | `3160` |
| **WICAR Root** | `/home/node_mmi/www/wicar/front` |

> ⚠️ **Пароль от SSH хранится в секретном менеджере. Не коммитьте его в репозиторий!**

## 🏗 Архитектура деплоя

```
┌─────────────────────────────────────────┐
│           Nginx (Reverse Proxy)         │
│         :80 → :443 (SSL)               │
├──────────────┬──────────────────────────┤
│  Frontend    │     Backend (Django)     │
│  Vite/Node   │     Gunicorn :8000       │
│  Port: 3160  │     PostgreSQL           │
└──────────────┴──────────────────────────┘
```

## 📋 Предварительные требования

### На сервере должно быть установлено:
- **Node.js** 22+ (для фронтенда)
- **Docker** 24.0+ (для бэкенда)
- **Docker Compose** 2.20+
- **Nginx** (reverse proxy)
- **PM2** (опционально, для управления Node.js процессом)

---

## 🚀 Фронтенд (React + Vite)

### Шаг 1: Подключение к серверу

```bash
ssh node_mmi@192.168.23.43
```

### Шаг 2: Клонирование/обновление кода

```bash
cd /home/node_mmi/www/wicar/front
git pull origin main
```

### Шаг 3: Установка зависимостей

```bash
npm install
```

### Шаг 4: Сборка

```bash
npm run build
```

### Шаг 5: Запуск через PM2 (или systemd)

```bash
# Если используется PM2
pm2 start "npx vite preview --host 0.0.0.0 --port 3160" --name wicar-frontend
pm2 save

# Или вручную
npx vite preview --host 0.0.0.0 --port 3160 &
```

### Обновление фронтенда

```bash
cd /home/node_mmi/www/wicar/front
git pull origin main
npm install
npm run build
pm2 restart wicar-frontend
```

---

## 🐳 Бэкенд (Django + Docker)

### Шаг 1: Создание `.env.production`

```bash
cd /home/node_mmi/www/wicar/back
cp .env.production.example .env.production
nano .env.production
```

### Обязательные переменные

| Переменная | Значение |
|------------|----------|
| `DJANGO_SECRET_KEY` | Сгенерировать случайный (мин. 50 символов) |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `wicar.uwed.uz,192.168.23.43` |
| `DATABASE_URL` | `postgresql://wicar_user:<password>@db:5432/wicar2026` |
| `DB_USER` | `wicar_user` |
| `DB_PASSWORD` | Сложный пароль |
| `CORS_ALLOWED_ORIGINS` | `https://wicar.uwed.uz` |
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |

### Генерация SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Шаг 2: Запуск контейнеров

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Шаг 3: Миграции и сбор статики

```bash
docker-compose -f docker-compose.prod.yml exec django python manage.py migrate
docker-compose -f docker-compose.prod.yml exec django python manage.py collectstatic --noinput
```

### Шаг 4: Создание суперпользователя

```bash
docker-compose -f docker-compose.prod.yml exec django python manage.py createsuperuser
```

### Шаг 5: Проверка логов

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Обновление бэкенда

```bash
cd /home/node_mmi/www/wicar/back
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec django python manage.py migrate
docker-compose -f docker-compose.prod.yml exec django python manage.py collectstatic --noinput
docker-compose -f docker-compose.prod.yml restart
```

---

## 🌐 Настройка Nginx

### Конфигурация `/etc/nginx/sites-available/wicar`

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name wicar.uwed.uz;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name wicar.uwed.uz;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/wicar.uwed.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wicar.uwed.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    # Фронтенд (Node.js на порту 3160)
    location / {
        proxy_pass http://127.0.0.1:3160;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Бэкенд API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы Django
    location /static/ {
        alias /home/node_mmi/www/wicar/back/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Медиа-файлы
    location /media/ {
        alias /home/node_mmi/www/wicar/back/media/;
        expires 7d;
    }
}
```

### Активация

```bash
sudo ln -s /etc/nginx/sites-available/wicar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d wicar.uwed.uz

# Автообновление
sudo crontab -e
# 0 3 * * * certbot renew --quiet
```

---

## 🗄 Бэкапы

### База данных

```bash
# Бэкап
docker-compose -f docker-compose.prod.yml exec db pg_dump -U wicar_user wicar2026 > /home/node_mmi/backups/db_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U wicar_user wicar2026
```

### Медиа-файлы

```bash
tar -czf /home/node_mmi/backups/media_$(date +%Y%m%d_%H%M%S).tar.gz /home/node_mmi/www/wicar/back/media/
```

### Cron для автобэкапов

```bash
# Crontab: 0 2 * * * /home/node_mmi/scripts/backup.sh
```

---

## 📊 Мониторинг

### Логи

```bash
# Фронтенд
pm2 logs wicar-frontend

# Бэкенд
docker-compose -f docker-compose.prod.yml logs -f django
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Health Check

```bash
curl -I https://wicar.uwed.uz
curl https://wicar.uwed.uz/api/health
```

### Ресурсы

```bash
docker stats
pm2 status
htop
```

---

## 📝 Чек-лист перед деплоем

- [ ] SSH доступ к серверу проверен
- [ ] `DJANGO_SECRET_KEY` сгенерирован
- [ ] `DJANGO_DEBUG=False`
- [ ] SSL сертификат установлен
- [ ] Nginx настроен и протестирован (`nginx -t`)
- [ ] Фронтенд собран и запущен на порту 3160
- [ ] Бэкенд запущен через Docker
- [ ] Миграции применены
- [ ] Статические файлы собраны
- [ ] CORS настроен (`https://wicar.uwed.uz`)
- [ ] Telegram бот запущен
- [ ] Бэкапы настроены
- [ ] Сайт доступен по `https://wicar.uwed.uz`
