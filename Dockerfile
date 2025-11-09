# Dockerfile for Claude Code Remote
# Multi-stage build for efficient image size

FROM node:18-alpine AS base

# Install dependencies needed for tmux integration and node-pty compilation
RUN apk add --no-cache \
    tmux \
    bash \
    curl \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs sessions

# Set proper permissions
RUN chmod +x *.js

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${DISCORD_WEBHOOK_PORT:-3023}/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Default command (can be overridden in docker-compose)
CMD ["node", "start-discord-webhook.js"]
