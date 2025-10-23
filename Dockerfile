# Use Playwright image
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PORT=8000
EXPOSE $PORT

# Generate Prisma client only (safe at build time)
RUN npx prisma generate && npm run build

# Run migrations at runtime
CMD echo "Waiting for database..." \
    && until nc -zv $DB_HOST $DB_PORT; do \
         echo "Database not ready, retrying in 2s..."; \
         sleep 2; \
       done \
    && echo "Running Prisma migrations..." \
    && npx prisma migrate deploy \
    && echo "Starting server on port $PORT..." \
    && npm run start
