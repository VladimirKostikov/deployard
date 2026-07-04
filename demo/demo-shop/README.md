# Demo Shop

Postgres, API, and static web storefront.

## Local Docker

```bash
cd demo/demo-shop
docker compose up --build -d
```

| URL | Description |
|---|---|
| http://localhost:3101 | Web UI |
| http://localhost:3100/health | API health |

## Kubernetes

```bash
make seed-demo
```

Or import `demo-shop` from the dashboard **Import** page.
