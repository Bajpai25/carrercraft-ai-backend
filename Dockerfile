# Dockerfile
FROM mcr.microsoft.com/playwright:v1.53.1-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN apt-get update && apt-get install -y netcat && apt-get clean
COPY . .
RUN npx prisma generate
RUN npm run build
ENV PORT=8000
EXPOSE $PORT
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
