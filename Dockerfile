ARG BUILD_ENV="build:dev"

FROM node:16
ARG BUILD_ENV
WORKDIR /app/camino-wallet

COPY ./ /app/camino-wallet/
RUN yarn install
RUN yarn $BUILD_ENV
