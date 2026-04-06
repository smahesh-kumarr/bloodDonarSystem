FROM node:18-alpine
WORKDIR /app

# Install production deps only (nodemon is devDependency, skipped by --omit=dev)
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Run as non-root user for security
USER node

EXPOSE 5001
CMD ["node", "src/app.js"]
