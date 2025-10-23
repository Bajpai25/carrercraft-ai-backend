# Use Playwright image
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PORT=8000
EXPOSE $PORT

RUN echo "🔹 Generating Prisma client..." && npx prisma generate
RUN echo "🔹 Building server..." && npm run build

# Move migrations to runtime (after Render injects env vars)
CMD echo "Waiting for database..." \
    && until nc -zv $DB_HOST $DB_PORT; do \
         echo "Database not ready, retrying in 2s..."; \
         sleep 2; \
       done \
    && echo "Running Prisma migrations..." \
    && npx prisma migrate deploy \
    && echo "Starting server on port $PORT..." \
    && npm run start
