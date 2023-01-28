#!/usr/bin/env bash

if [ "$1" = 'start' ]; then

  if [ ! -f ".installed" ]; then
    npm run build:prisma \
    && npm run generate:prisma \
    && npm run build:server \
    && npm run build:client \
    && touch .installed
  fi

  exec npm run start
fi

exec "$@"
