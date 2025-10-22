
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

# Expose a port (optional, Render uses $PORT dynamically)
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
