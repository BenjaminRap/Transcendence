#!/bin/sh
set -e

echo "Updating Prisma Client..."
npx prisma generate

if [ "${PROFILE:-prod}" = "dev" ]; then
  echo "Synchronisation of the database (dev)..."
  # Migrate the database without generating migration files
  npx prisma db push

  echo "Starting in DEV mode with nodemon..."
  exec npm run start-dev
else
  echo "Applying migrations (prod)..."
  npx prisma migrate deploy

  echo "Starting in PROD mode..."
  exec npm run start-prod
fi
