FROM docker.io/library/node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

CMD ["npm", "start"]