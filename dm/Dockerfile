FROM docker.io/library/node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN PRISMA_DATABASE_URL="postgresql://notifications@localhost:5432/notifications?schema=public" npx prisma generate

COPY src ./src

RUN npm prune --omit=dev

CMD ["npm", "start"]