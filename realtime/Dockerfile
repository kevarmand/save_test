FROM docker.io/library/node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY certs ./certs

CMD ["npm", "run", "dev"]