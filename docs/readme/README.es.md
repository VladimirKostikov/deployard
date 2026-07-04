<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control plane de deployments en Kubernetes</strong>
</p>

<p align="center">
  Creado con fines <strong>educativos y de portfolio</strong>.<br/>
  Uso, modificación y distribución libres bajo la <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployments, rollbacks, estado de pods y logs desde una web UI tipada<br/>
    en lugar de alternar entre kubectl, Compose y scripts sueltos.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.da.md">Dansk</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <strong>Español</strong> ·
  <a href="README.et.md">Eesti</a> ·
  <a href="README.fi.md">Suomi</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ga.md">Gaeilge</a> ·
  <a href="README.hr.md">Hrvatski</a> ·
  <a href="README.hu.md">Magyar</a> ·
  <a href="README.is.md">Íslenska</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.lt.md">Lietuvių</a> ·
  <a href="README.lv.md">Latviešu</a> ·
  <a href="README.mt.md">Malti</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.no.md">Norsk</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Panel de deployments de Deployard" width="720" />
</p>

## Acerca del proyecto

Deployard es un control plane de deployments para Kubernetes. La web UI y la API tipada están delante del cluster, así que navegadores y scripts no acceden al API server directamente.

### El problema

Trabajar con el cluster suele implicar saltar entre herramientas. `kubectl` para rollouts y estado de pods. Docker Compose para builds locales. Scripts de shell para cargar imágenes en kind. Pestañas aparte para logs y port-forward. Cada herramienta tiene su propia autenticación, formato de salida y formas de fallar. Los equipos pequeños lo notan pronto. Los grandes lo compensan con dashboards internos, a menudo de solo lectura o atados a un entorno.

Deployard se centra en el ciclo de vida del deployment: qué está en ejecución, qué revisión está activa, salud de pods, rollbacks, tail de logs y llevar un proyecto Compose al cluster sin checklist manual.

### Qué incluye

| Área | Qué hace Deployard |
|---|---|
| Deployments | Listado, detalle, historial de revisiones, scale, disable, restart, rollout undo |
| Pods | Estado en vivo (watch), tail de logs por SSE, consola exec, file browser |
| Import | Parse de Compose, vista previa de manifiestos K8s, build de imágenes, load en kind, apply |
| Network | Services, endpoints, ingress, acceso desde el navegador vía port-forward controlado |
| Admin | Usuarios, roles, permisos por sección (view / operate / manage) |
| Ops | Health y readiness probes, métricas Prometheus, structured logging |

El frontend nunca llama a la Kubernetes API. El backend NestJS guarda el kubeconfig, sesiones JWT con revocación de tokens en PostgreSQL y expone solo operaciones permitidas. Mismo patrón que detrás de una platform API interna.

### Cómo está construido

Monorepo pnpm: React y Vite en el frontend, NestJS con `@kubernetes/client-node` en el backend, DTOs compartidos en `@dpd/shared`, OpenAPI desde controllers.

El desarrollo local está montado como un entorno real pequeño:

- **kind** ejecuta cargas demo (`demo-shop`) en el cluster
- **Docker Compose** levanta Postgres, API y UI servida por nginx en un solo puerto
- **Helm chart** (`deploy/helm/dpd`) para instalaciones tipo production

Los tests de integración golpean una API en vivo contra kind. Playwright cubre login y el flujo de deployments. Notas de diseño en [ADRs](../adr/).

### Para quién es

El proyecto es para aprender y portfolio. Muestra Kubernetes más allá de `kubectl apply`: rollouts, RBAC, streaming, observability y despliegue del stack con Docker, CI y Helm. Licencia MIT. Haz fork, extiéndelo o reutiliza partes en tu propia UI.

Lens o Kubernetes Dashboard bastan si solo necesitas un explorador genérico del cluster. Deployard profundiza en deployments, operaciones y el camino de Compose al cluster.

## Funciones

- Listado de deployments, historial de revisiones, rollout undo
- Estado de pods con actualizaciones en vivo, tail de logs (SSE), consola exec
- Import de Docker Compose, rebuild, kind image load
- Services, endpoints, ingress, port-forward desde la UI
- Roles y acceso por sección (view / operate / manage)
- Métricas Prometheus del proceso API
- 28 idiomas de UI (i18next)

## Requisitos

- Docker Desktop (en ejecución)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Comprobar herramientas:

```bash
make install-tools
make doctor
```

## Configuración local

Stack completo: **kind cluster** (cargas demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Qué hace cada paso:

| Comando | Acción |
|---|---|
| `make cluster-up` | Crea el kind cluster `dpd-local`, cambia kubectl a `kind-dpd-local` |
| `make seed-demo` | Construye imágenes demo-shop, las carga en kind, aplica `demo/demo-shop/kubernetes` |
| `make docker-up` | Construye y arranca Postgres, API y web (nginx en el puerto de `WEB_PORT`) |

Parar o resetear:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## URLs locales

El puerto por defecto es **18480** (`WEB_PORT` en `.env`).

| URL | Qué es |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort en kind, tras `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (acceso desde host, en `.env`) |

Usuarios dev por defecto (solo seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Desarrollo local (sin Docker UI)

API y web en el host. Postgres puede quedarse en Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Qué es |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Comandos útiles

```bash
make docker-logs          # follow API / web / Postgres logs
make lint                 # TypeScript lint (all packages)
make test                 # unit tests
make test-integration     # API + kind (API on :3000, Postgres required)
make test-e2e             # Playwright (web on :5173)
make helm-lint            # lint Helm chart
make helm-install         # install chart into kind (alternative to docker-up)
make cluster-down         # remove kind cluster
```

Rebuild tras cambios de código:

```bash
make docker-up
```

## Production

Consulta [docs/deploy.md](../deploy.md) para Helm, migrations y `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Ejemplos

| Ruta | Qué es |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed en kind |
| `demo/weather-station` | Stack compose pequeño para practicar import |
| `demo/todo-board` | Sample mínimo frontend + API |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Capa | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arquitectura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

El frontend nunca llama al cluster directamente. La API aplica JWT auth con permisos por sección. El Kubernetes ServiceAccount usa RBAC least-privilege (ver `examples/kubernetes/rbac.yaml`).

Detalles: [docs/architecture.md](../architecture.md) y [ADRs](../adr/)

## Documentación

| Doc | Tema |
|---|---|
| [Architecture](../architecture.md) | Design y fases |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Licencia

[MIT](../../LICENSE). Puedes usar, copiar, modificar y distribuir el proyecto para cualquier fin, incluido uso comercial, siempre que se conserve el aviso de licencia.
