# Helm chart — dpd

Installs Deployard API + web + optional Postgres into a Kubernetes cluster.

```bash
make cluster-up
make docker-build
make kind-load-images
helm upgrade --install dpd deploy/helm/dpd \
  --namespace dpd \
  --create-namespace \
  --set api.secrets.jwtSecret="$(openssl rand -hex 32)" \
  --set postgres.password="$(openssl rand -hex 16)" \
  --wait
```

Web UI: http://localhost:30080

Create the first admin after install:

```bash
kubectl exec -it deploy/dpd-api -n dpd -- \
  node dist/database/scripts/create-admin.js admin@example.com 'StrongPassword!'
```

Full guide: [docs/deploy.md](../../docs/deploy.md)
