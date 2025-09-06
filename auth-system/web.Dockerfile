# Install dependencies stage
FROM node:18-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Install all dependencies including dev dependencies for build
RUN npm ci

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js

# Create a simple health check script
USER root
RUN echo 'const http = require("http"); \
const options = { hostname: "localhost", port: 3000, path: "/", method: "GET" }; \
const req = http.request(options, (res) => { \
  if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } \
}); \
req.on("error", () => { process.exit(1); }); \
req.end();' > healthcheck.js

USER nextjs

# Start the application
CMD ["node", "server.js"]