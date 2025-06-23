
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

FROM mcr.microsoft.com/playwright:v1.43.1-jammy

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your project
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port your app runs on
EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
