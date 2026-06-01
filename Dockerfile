# Stage 1: Build static assets and custom server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build Vite frontend and bundle Express server with esbuild
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/piana-db.json ./piana-db.json

# Expose port (Cloud Run automatically routes to this port)
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
