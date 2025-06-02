# Менеджер задач
Простой менеджер задач на базе React. Задачи хранятся в локальной памяти и очищаются при обновлении страницы.
### Stack
- React
- Node.js
- Docker

### Packages
- ESLint
- axios

## Шаги запуска
1. Сборка проекта
```bash
npm run build
```
2. Сборка образа Docker
```bash
docker build -f Dockerfile -t WebAppKubSU .
```
3. Сборка образа Docker
```bash
docker run -p 3003:3003 WebAppKubSU
```

### Дополнительно
- Геолокация поддерживается только при HTTPS соединении или "localhost"
- Модуль погоды будет работать только при разрешении геолокации
- Prod среда выполнена в облаке TimeWeb на VPS с Linux (Ubuntu Server 24.04)
- SSL сертификаты от корневого личного домена "scientianor.ru"
- Nginx расположен на том же сервере, что и Docker container