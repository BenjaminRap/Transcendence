#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

if [ "${PROFILE:-prod}" = "dev" ]; then
  echo "🚀 Starting in DEV mode with nodemon..."
  npm install -g nodemon
  exec nodemon --watch /app/backend/javascript -e js /app/backend/javascript/index.js
else
  echo "🚀 Starting in PROD mode..."
  exec npm run start
fi
