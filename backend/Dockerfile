FROM node:20-alpine AS base
WORKDIR /app

# Instala dependências completas para build
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Build da aplicação NestJS
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime apenas com dependências de produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
