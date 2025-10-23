# # Use Playwright image
# FROM mcr.microsoft.com/playwright:v1.53.1-jammy

# # Set working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm ci

# # Install netcat for DB wait check
# RUN apt-get update && apt-get install -y netcat && apt-get clean

# # Copy all project files
# COPY . .

# # Generate Prisma client and build the server
# RUN npx prisma generate
# RUN npm run build

# # Expose port
# ENV PORT=8000
# EXPOSE $PORT

# # Copy entrypoint script and make executable
# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# # Use entrypoint to wait for DB, run migrations, and start server
# ENTRYPOINT ["/entrypoint.sh"]


# FROM node:18-alpine

# # Set working directory in container
# WORKDIR /app

# # First copy package files and install
# COPY package*.json .

# RUN npm ci

# # Then copy the rest of your application
# COPY . .

# # # Generate Prisma Client
# # RUN npx prisma generate

# # # Command to start your server
# # CMD [ "npm run dev" ]

# Use the correct version of Playwright that matches your installed version
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
