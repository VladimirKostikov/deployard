# @dpd/web

React dashboard for Kubernetes deployment lifecycle management.

## Features

- Deployment list and detail views
- Pod status table with auto-refresh
- Namespace selector
- i18n: Russian, English, German

## Run locally

```bash
pnpm dev
```

UI: http://localhost:5173

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | API base path (proxied by Vite in dev) |
