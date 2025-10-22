# Use Playwright image
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Set environment variable for PORT
ENV PORT=8000

# Expose the port
EXPOSE $PORT

# Build-time tasks: Prisma client generation & migrations
RUN echo "🔹 Generating Prisma client..." \
    && npx prisma generate \
    && echo "🔹 Running Prisma migrations..." \
    && npx prisma migrate deploy \
    && echo "🔹 Building server..." \
    && npm run build

# Wait for Supabase DB (transaction pooler) to be ready, then start server
CMD echo "🔹 Waiting for database..." \
    && until nc -zv $DB_HOST $DB_PORT; do \
         echo "Database not ready, retrying in 2s..."; \
         sleep 2; \
       done \
    && echo "✅ Database reachable. Starting server on port $PORT..." \
    && npm run start
