FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY certs ./certs

CMD ["npm", "run", "dev"]