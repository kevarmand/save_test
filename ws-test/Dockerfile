FROM node:20-alpine

RUN npm install -g wscat && apk add --no-cache expect

WORKDIR /work

CMD ["sh", "-c", "ln -sf /work/ws /usr/local/bin/ws && tail -f /dev/null"]