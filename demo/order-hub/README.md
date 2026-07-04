# Order Hub

Six services behind one web UI: gateway, catalog, inventory, orders, redis.

| Service | Role |
|---|---|
| `order-redis` | Cache for gateway catalog responses |
| `catalog-svc` | Product catalog API |
| `inventory-svc` | Stock levels and reservations |
| `orders-svc` | Places orders via catalog + inventory |
| `hub-gateway` | Aggregates APIs for the browser |
| `web` | Browser UI |

## Request flow

```
web → hub-gateway → catalog-svc
                 → inventory-svc
                 → orders-svc → catalog-svc + inventory-svc
                 → order-redis
```

## Local Docker

```bash
cd demo/order-hub
docker compose up --build -d
```

| URL | Description |
|---|---|
| http://localhost:3310 | Web UI |
| http://localhost:3310/api/mesh | Service health |
