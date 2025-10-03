FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use npm install (lockfile optional) for flexibility
RUN npm install --production=false

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app .

# Ensure node user owns working dir
RUN chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:${PORT}/api/healthz || exit 1
CMD ["npm","start"]
