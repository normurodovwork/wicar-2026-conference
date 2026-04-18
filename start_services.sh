#!/bin/bash
export PATH="/usr/bin:/home/node_mmi/.nvm/versions/node/v22.22.0/bin:$PATH"

# Delete existing pm2 processes
pm2 delete wicar-frontend || true
pm2 delete wicar-backend || true
pm2 delete wicar-bot || true

# Start Frontend
cd /home/node_mmi/www/wicar/front
pm2 start "npx vite preview" --name wicar-frontend

# Start Backend
cd /home/node_mmi/www/wicar/back
pm2 start "/home/node_mmi/www/wicar/back/.venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8001 --workers 3" --name wicar-backend

# Start Bot
pm2 start "/home/node_mmi/www/wicar/back/.venv/bin/python manage.py runbot" --name wicar-bot

# Save PM2 state
pm2 save

pm2 list
