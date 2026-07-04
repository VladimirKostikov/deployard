# Production deployment

## Helm (recommended)

```bash
make docker-build
make kind-load-images
helm upgrade --install dpd deploy/helm/dpd \
  --namespace dpd \
  --create-namespace \
  --set api.secrets.jwtSecret="$(openssl rand -hex 32)" \
  --set api.secrets.webhookSecret="$(openssl rand -hex 16)" \
  --set postgres.password="$(openssl rand -hex 16)" \
  --wait
```

The chart deploys API, web UI, and optional in-cluster Postgres (`postgres.enabled=true` by default).

| Setting | Production value |
|---|---|
| `api.env.appEnv` | `production` |
| `api.env.dbSynchronize` | `false` |
| `api.env.dbMigrate` | `true` |
| `api.env.dbSeed` | `false` |
| `api.env.cookieSecure` | `true` (with HTTPS) |

Web UI: NodePort `30080` by default.

## External Postgres

Disable bundled Postgres and pass a connection string:

```bash
helm upgrade --install dpd deploy/helm/dpd \
  --set postgres.enabled=false \
  --set api.secrets.databaseUrl='postgresql://user:pass@host:5432/dpd'
```

## First admin user

`DB_SEED` is disabled in production. After migrations run, create an admin:

```bash
kubectl exec -it deploy/dpd-api -n dpd -- \
  node dist/database/scripts/create-admin.js admin@example.com 'StrongPassword!'
```

Or locally:

```bash
DATABASE_URL=postgresql://... \
pnpm --filter @dpd/api create-admin admin@example.com 'StrongPassword!'
```

## Docker Compose (development)

```bash
cp .env.example .env
make docker-up
```

Dev uses `DB_SYNCHRONIZE=true` and `DB_SEED=true`. Seed users are documented in the root README.

## Migrations

```bash
pnpm --filter @dpd/api migration:show
pnpm --filter @dpd/api migration:run
```

Migrations run automatically on API startup when `DB_MIGRATE=true`.
