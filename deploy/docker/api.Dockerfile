FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app


FROM base AS build

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @dpd/shared build
RUN rm -f apps/api/tsconfig.build.tsbuildinfo
RUN pnpm --filter @dpd/api build
RUN pnpm deploy --filter @dpd/api --prod /prod/api
RUN rm -rf /prod/api/dist && cp -r /app/apps/api/dist /prod/api/dist


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache tini wget docker-cli docker-cli-compose curl su-exec

ARG TARGETARCH
RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) KARCH=amd64 ;; \
      arm64) KARCH=arm64 ;; \
      *) KARCH=amd64 ;; \
    esac; \
    curl -fsSL "https://dl.k8s.io/release/v1.32.2/bin/linux/${KARCH}/kubectl" -o /usr/local/bin/kubectl; \
    chmod +x /usr/local/bin/kubectl

COPY --from=build /prod/api /app
COPY scripts/docker/entrypoint-api.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && chown -R node:node /app

USER root

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/entrypoint.sh"]
