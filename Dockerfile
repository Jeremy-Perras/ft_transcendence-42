# ------------------------------- DEPENDENCIES ------------------------------- #
FROM node:19.2-bullseye-slim AS dependencies

# Copy shared library
COPY shared ./shared

# Copy workspaces
COPY ./client/package.json ./client/package-lock.json ./
COPY ./server/package.json ./server/package-lock.json ./
COPY package.json package-lock.json tsconfig.json ./

# Install dependencies
RUN npm ci

# ----------------------------------- BUILD ---------------------------------- #
FROM dependencies AS build

# Copy source files
COPY client ./client
COPY server ./server

# Generate prisma
RUN npm run generate:prisma

# Generate codegen
RUN npm run generate:codegen

# Build server
RUN npm run build:server

# Build client
RUN npm run build:client

# TODO: Clean up
# TODO: Move files

# ---------------------------------- RELEASE --------------------------------- #
FROM build AS release

# Start server
RUN npm run start:server