FROM node:20-alpine AS base

WORKDIR /app

COPY api/package.json ./
RUN npm install --omit=dev

COPY api/src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
