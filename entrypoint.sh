# #!/bin/sh
# # Optional: wait for database host to be reachable (for safety)
# # until pg_isready -h "$DB_HOST" -p 5432 -U "$DB_USER"; do
# #   echo "Waiting for PostgreSQL..."
# #   sleep 2
# # done

# # Apply Prisma migrations
# npx prisma generate
# npx prisma migrate deploy

# # Build and start the server (for production)
# npm run build
# npm run start


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


