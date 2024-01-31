
FROM node:16

# Создание и установка рабочей директории в контейнере
WORKDIR /usr/src/app

# Копирование файлов package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование всех файлов приложения в контейнер
COPY . .

# Определение команды запуска приложения
CMD ["node", "skb.js"]
