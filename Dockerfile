FROM node:current-slim 

WORKDIR /var/local

COPY client ./client
COPY server ./server
COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT [ "docker-entrypoint.sh" ]

CMD [ "start" ]