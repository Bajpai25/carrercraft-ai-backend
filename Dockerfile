
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



