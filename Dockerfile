FROM node:alpine AS builder
RUN apk add --no-cache ca-certificates && update-ca-certificates
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm run build:client
RUN pnpm run build:server

FROM ghcr.io/tgdrive/node
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENV NODE_ENV=production
EXPOSE 8080
ENTRYPOINT [ "node", "build/server/index.mjs" ]