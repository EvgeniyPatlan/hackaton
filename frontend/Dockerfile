FROM node:18-alpine AS base
# Install dependencies for proper functioning
RUN apk add --no-cache libc6-compat

# Create working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Dependency stage
FROM base AS deps
# Copy only dependency files
COPY package.json pnpm-lock.yaml* ./
# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all files
COPY . .
# Pass the NEXT_PUBLIC_API_URL build argument if needed
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Build the Next.js app
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built assets and node_modules from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT 3000

# Start the application using the start script (which runs "next start")
CMD ["pnpm", "start"]
