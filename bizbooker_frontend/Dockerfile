# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent --only=production

# Copy source code
COPY . .

# Change this line in your Dockerfile
RUN npm run build

# To this (increases memory to 4GB)
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve@14.2.1

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactjs -u 1001 && \
    chown -R reactjs:nodejs /app

# Switch to non-root user
USER reactjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://57.158.25.224:3000 || exit 1

# Serve the application
CMD ["serve", "-s", "build", "-l", "3000"]

# Development stage
FROM node:20-slim as development

WORKDIR /app

COPY package*.json ./

# Changed from 'npm ci' to 'npm install' to generate/update package-lock.json if needed
RUN npm install

# The volume mapping in docker-compose will override this in dev
COPY . ./

EXPOSE 3000


CMD ["npm", "start"]

