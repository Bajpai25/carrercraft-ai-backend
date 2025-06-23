# #! /bin/sh

# # Wait for the database to be up
# until nc -z db 5432; do
#   echo "Waiting for db to be up..."
#   sleep 2
# done

# # Apply migrations
# npx prisma migrate deploy

# # Start your server
# npm run dev




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

