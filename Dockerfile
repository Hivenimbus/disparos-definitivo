FROM node:20-alpine AS base
WORKDIR /app

# Common dependencies for native builds (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production-deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM golang:1.22-alpine AS go-builder
WORKDIR /worker
RUN apk add --no-cache git
COPY worker/go.* ./
RUN go mod download
COPY worker ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/worker ./cmd/worker
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/maturation-worker ./cmd/maturation

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=go-builder /out/worker ./dist/worker
COPY --from=go-builder /out/maturation-worker ./dist/maturation-worker
COPY scripts ./scripts

EXPOSE 3000
CMD ["node", "-r", "dotenv/config", "scripts/start.js"]

