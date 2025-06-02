# Стадия сборки
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Выполняем сборку (создаёт dist/)
RUN npm run build && ls -la /app/dist

# Стадия запуска
FROM node:22-slim AS production
WORKDIR /app

RUN npm install -g serve

# Копируем dist вместо build
COPY --from=build /app/dist ./dist

EXPOSE 3003

CMD ["serve", "-s", "dist", "-l", "3003"]
