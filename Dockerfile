# ── Stage 1: build the static export ───────────────────────────────
# Build context = this repository ROOT (the brain-frontend app lives at the root,
# unlike the old PreCheck repo where it sat under frontend/).
# EasyPanel → frontend service → Dockerfile: Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public API base URLs baked into the static build. Override with --build-arg if needed.
# NEXT_PUBLIC_API_URL        → PreCheck API (dashboard/summary/inbound).
# NEXT_PUBLIC_MANAGE_API_BASE_URL → Brain manage-api (login + entitlements);
#   empty falls back to the relative "/api/manage" (no hardcoded domain).
ARG NEXT_PUBLIC_API_URL=https://precheckv2-precheck-api.cpux9k.easypanel.host
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_MANAGE_API_BASE_URL=
ENV NEXT_PUBLIC_MANAGE_API_BASE_URL=${NEXT_PUBLIC_MANAGE_API_BASE_URL}
RUN npm run build

# ── Stage 2: serve the static files with nginx ──────────────────────
FROM nginx:1.27-alpine
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
