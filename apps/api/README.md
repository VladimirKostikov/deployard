# @dpd/api

NestJS backend — controlled proxy to the Kubernetes API.

## Responsibilities

- List deployments and revision history
- Rollback deployments
- Pod status and log streaming (SSE)
- Namespace listing
- Health and Prometheus metrics endpoints

## Run locally

```bash
pnpm dev
```

Swagger: http://localhost:3000/api/docs

## Configuration

Environment variables in the repository root `.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `K8S_CONFIG_MODE` | `default` | `default` or `cluster` |
| `K8S_SKIP_TLS_VERIFY` | `auto` | TLS skip for local kubeconfig |
| `DB_SYNCHRONIZE` | `false` | Auto schema sync (dev only) |
| `DB_MIGRATE` | `true` when sync is off | Run TypeORM migrations on startup |
| `DB_SEED` | `false` | Seed demo users (dev only) |

## Migrations

```bash
pnpm --filter @dpd/api migration:show
pnpm --filter @dpd/api migration:run
pnpm --filter @dpd/api migration:revert
```

Production: `DB_SYNCHRONIZE=false`, `DB_MIGRATE=true`, `DB_SEED=false`.
