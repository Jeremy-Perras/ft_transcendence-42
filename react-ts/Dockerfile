# Stage 1: build
FROM node:14 AS development

WORKDIR /usr/react-ts/src/app

COPY package*.json ./

RUN npm install
RUN npm i react

COPY . .

RUN npm run build

EXPOSE 3000