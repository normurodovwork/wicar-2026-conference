# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Django production
FROM python:3.12-slim
WORKDIR /app

# Системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Python зависимости
COPY backend/requirements/prod.txt .
RUN pip install --no-cache-dir -r prod.txt

# Django проект
COPY backend/ .
COPY --from=frontend-build /app/dist /app/static/dist/

# Сбор статических файлов
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
