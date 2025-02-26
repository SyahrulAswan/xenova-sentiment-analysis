FROM node:20.18-bullseye

WORKDIR /app

COPY package* ./
RUN npm install

COPY . .

CMD ["node", "app.js"]