FROM node:20.18-alpine

WORKDIR /app

COPY package* .
RUN npm install

COPY . .

CMD ["node", "app.js"]