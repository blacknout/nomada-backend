FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN npm ci

RUN apk add --no-cache postgresql-client

COPY . .

RUN npm run build

CMD ["node", "dist/server.js"]

