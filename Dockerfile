FROM node:alpine AS build
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
COPY --from=build /app/build ./build
ENV NODE_ENV=production
EXPOSE 8080
ENTRYPOINT [ "node", "build/server/index.mjs" ]