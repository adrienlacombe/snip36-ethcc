# SNIP-36 CoinFlip Demo Frontend
# Multi-stage: build with Node → serve with nginx
#
# Build: docker build -f docker/frontend.Dockerfile -t snip36-frontend .
# Run:   docker run -p 3000:80 snip36-frontend

# ── Stage 1: Build ──────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────
FROM nginx:alpine AS runtime

# Custom nginx config to proxy /api to backend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
