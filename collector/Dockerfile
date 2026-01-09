FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p /app/logs && chown -R node:node /app

USER node

# Run the collector
CMD ["node", "src/index.js"]
