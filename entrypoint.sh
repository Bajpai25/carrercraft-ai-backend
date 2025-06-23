#! /bin/sh

# Wait for the database to be up
until nc -z db 5432; do
  echo "Waiting for db to be up..."
  sleep 2
done

# Apply migrations
npx prisma migrate deploy

# Start your server
npm run dev
