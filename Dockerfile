FROM node:20-alpine
WORKDIR /app/server
COPY ./server/package*.json ./
RUN npm install 
COPY ./server ./

WORKDIR /app/app
COPY ./app/ ./
RUN npm install --include=dev
RUN npm run build
WORKDIR /app/server 
CMD ["node", "./app.js"]