FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY backend/package*.json ./backend/
COPY ./tir-core ./tir-core
# Install dependencies
RUN cd tir-core && npm install
RUN cd backend && npm install

# Copy the rest of your app's source code
COPY ./backend/ ./backend/

# Compile TypeScript to JavaScript

WORKDIR /usr/src/app/backend

RUN npm run build

EXPOSE 3000

# Your start command should reference the compiled JavaScript file
CMD ["npm","start"]
