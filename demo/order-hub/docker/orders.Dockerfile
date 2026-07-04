FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY orders/package.json ./
RUN npm install --omit=dev

COPY orders/src ./src
COPY shared ./shared

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
