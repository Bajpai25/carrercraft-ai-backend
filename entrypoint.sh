#!/bin/sh
# Optional: wait for database host to be reachable (for safety)
# until pg_isready -h "$DB_HOST" -p 5432 -U "$DB_USER"; do
#   echo "Waiting for PostgreSQL..."
#   sleep 2
# done

# Apply Prisma migrations
npx prisma generate
npx prisma migrate deploy

# Build and start the server (for production)
npm run build
npm run start

