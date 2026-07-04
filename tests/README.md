# Tests

## Unit (`apps/api`)

```bash
pnpm --filter @dpd/api test
```

## Integration (`tests/integration`)

Requires a running API and kind cluster with demo deployment:

```bash
make cluster-up
make seed-demo
pnpm --filter @dpd/api dev
make test-integration
```

Environment:

| Variable | Default |
|---|---|
| `API_BASE_URL` | `http://localhost:3000/api` |
| `TEST_NAMESPACE` | `default` |
| `TEST_DEPLOYMENT` | `demo-api` |

## E2E (`tests/e2e`)

Requires web + API:

```bash
make cluster-up
make seed-demo
pnpm dev
pnpm --filter @dpd/e2e exec playwright install chromium
make test-e2e
```

| Variable | Default |
|---|---|
| `E2E_BASE_URL` | `http://localhost:5173` |
| `E2E_DEPLOYMENT` | `demo-api` |
