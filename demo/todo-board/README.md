# Todo Board

Redis, API, and web UI.

| Service | Role |
|---|---|
| `todo-redis` | Task storage |
| `todo-api` | REST API |
| `todo-web` | Browser UI |

## Local Docker

```bash
cd demo/todo-board
docker compose up --build -d
```

| URL | Description |
|---|---|
| http://localhost:3201 | Web UI |
