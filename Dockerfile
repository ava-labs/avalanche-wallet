FROM node:15 AS builder

COPY . /
# COPY package.json yarn.lock tsconfig.json /

RUN yarn install && yarn build

FROM nginx:alpine

COPY --from=builder /dist /usr/share/nginx/html
