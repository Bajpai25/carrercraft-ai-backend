# Use Playwright image
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install netcat for DB wait check
RUN apt-get update && apt-get install -y netcat && apt-get clean

# Copy all project files
COPY . .

# Generate Prisma client and build the server
RUN npx prisma generate
RUN npm run build

# Expose port
ENV PORT=8000
EXPOSE $PORT

# Copy entrypoint script and make executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use entrypoint to wait for DB, run migrations, and start server
ENTRYPOINT ["/entrypoint.sh"]
