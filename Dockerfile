# Стадия сборки
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Стадия запуска — на nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Пользовательская конфигурация nginx, если надо
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3003
