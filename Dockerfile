FROM mcr.microsoft.com/playwright:v1.53.1-jammy

# Install netcat to allow "nc" in CMD
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=8000
EXPOSE $PORT

RUN echo "🔹 Generating Prisma client..." \
    && npx prisma generate \
    && echo "🔹 Running Prisma migrations..." \
    && npx prisma migrate deploy \
    && echo "🔹 Building server..." \
    && npm run build

# Wait for DB and start the server
CMD echo "Waiting for database..." \
    && until nc -zv $DB_HOST $DB_PORT; do \
         echo "Database not ready, retrying in 2s..."; \
         sleep 2; \
       done \
    && echo "Database reachable. Starting server on port $PORT..." \
    && npm run start
