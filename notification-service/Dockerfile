FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node

EXPOSE 5004
CMD ["node", "src/app.js"]
