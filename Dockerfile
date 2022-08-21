FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN npm install --global http-server

CMD [" http-server", "build"]
