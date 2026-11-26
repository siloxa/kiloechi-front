# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Kiloechi frontend — build the React app, then serve it from nginx.
#
# This image builds only client/ (the Vite SPA). server/ (the Express + node:sqlite API
# used for local development) is not part of it: in staging and production nginx proxies
# /api and /uploads to the real kiloechi-back instead — see .nginx/default.conf.template.
# The client already calls relative /api and /uploads paths (client/src/lib/api.js), so no
# build-time API URL is needed.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps

WORKDIR /app

# Only the manifests, so this layer is reused until the dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build

COPY . .

# vite.config.js builds client/ (root: 'client') to ../dist, i.e. /app/dist here.
# Type-checked by Vite's build step; a broken build fails here rather than the deploy.
RUN npm run build

FROM nginx:1.29-alpine AS runtime

# Substituted into the config when the container starts, so the same image can be pointed at
# another backend without being rebuilt.
ENV BACKEND_HOST=kiloechi-app \
    BACKEND_PORT=8080

# The official image renders everything in templates/ through envsubst on start-up.
COPY .nginx/default.conf.template /etc/nginx/templates/default.conf.template

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 \
    CMD wget --spider -q http://127.0.0.1:3000/healthz || exit 1
