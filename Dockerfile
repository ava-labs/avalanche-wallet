# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:15 as build-stage
WORKDIR /app
COPY package*.json /app/
COPY yarn.lock /app/
RUN yarn install
COPY ./ /app/
RUN yarn build
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY /nginx.conf /etc/nginx/conf.d/default.conf
