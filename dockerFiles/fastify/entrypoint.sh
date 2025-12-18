#!/bin/sh
set -e

if [ "${PROFILE:-prod}" = "dev" ]; then
  echo "Running Prisma migrations (dev)..."
  npx prisma migrate dev --name init

  echo "Starting in DEV mode with nodemon..."
  exec npm run start-dev
else
  echo "Applying Prisma migrations (prod)..."
  npx prisma migrate deploy

  echo "Starting in PROD mode..."
  exec npm run start-prod
fi
