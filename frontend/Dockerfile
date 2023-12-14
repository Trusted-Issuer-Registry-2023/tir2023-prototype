# build stage
FROM node:16-alpine as build-stage

RUN npm install -g http-server

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY frontend/package*.json ./frontend/
COPY ./tir-core ./tir-core
# Install dependencies
RUN cd tir-core && npm install
RUN cd frontend && npm install

# Copy the rest of your app's source code
COPY ./frontend/ ./frontend/

# Compile TypeScript to JavaScript

WORKDIR /usr/src/app/frontend

RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]