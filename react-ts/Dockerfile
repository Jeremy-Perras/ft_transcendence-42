FROM node:carbon AS development

WORKDIR /usr/frontend/src/app

COPY package*.json ./

RUN npm install
RUN npm i react

COPY . .

RUN npm run build

EXPOSE 3000