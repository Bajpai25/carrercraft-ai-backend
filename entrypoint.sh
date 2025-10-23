#!/bin/sh
set -e
echo "Waiting for database at $DB_HOST:$DB_PORT..."
until nc -zv $DB_HOST $DB_PORT; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done
echo "Database is ready!"
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting server on port $PORT..."
exec npm run start
