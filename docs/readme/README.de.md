<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control Plane für Kubernetes Deployments</strong>
</p>

<p align="center">
  Erstellt für <strong>Bildung und Portfolio</strong>.<br/>
  Freie Nutzung, Änderung und Weitergabe unter der <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployments, Rollbacks, Pod-Status und Logs in einer typisierten Web-UI<br/>
    statt ständig zwischen kubectl, Compose und Einmalformed-Skripten zu wechseln.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.da.md">Dansk</a> ·
  <strong>Deutsch</strong> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <a href="README.es.md">Español</a> ·
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
  <img src="../assets/screenshot.png" alt="Deployard Deployments-Dashboard" width="720" />
</p>

## Über das Projekt

Deployard ist ein Control Plane für Deployments in Kubernetes. Web-UI und typisierte API sitzen vor dem Cluster, damit Browser und Skripte den API Server nicht direkt ansprechen.

### Das Problem

Cluster-Arbeit bedeutet meist, zwischen Tools zu springen. `kubectl` für Rollouts und Pod-Status. Docker Compose für lokale Builds. Shell-Skripte, um Images in kind zu laden. Separate Tabs für Logs und Port-Forwards. Jedes Tool hat eigene Auth, Ausgabeformate und Fehlermuster. Kleine Teams merken das schnell. Größere Teams flicken es mit internen Dashboards, die oft read-only sind oder an eine Umgebung gebunden bleiben.

Deployard konzentriert sich auf den Deployment-Lebenszyklus: was läuft, welche Revision ist live, Pod-Gesundheit, Rollbacks, Log-Tailing und ein Compose-Projekt ohne manuelle Checkliste in den Cluster zu bringen.

### Was Sie bekommen

| Bereich | Was Deployard leistet |
|---|---|
| Deployments | Liste, Details, Revisionshistorie, Scale, Disable, Restart, Rollout Undo |
| Pods | Live-Status (Watch), Log-Tail über SSE, Exec-Konsole, Dateibrowser |
| Import | Compose parsen, K8s-Manifeste vorschauen, Images bauen, in kind laden, Apply |
| Network | Services, Endpoints, Ingress, Browser-Zugriff über kontrollierten Port-Forward |
| Admin | Benutzer, Rollen, bereichsbasierte Rechte (view / operate / manage) |
| Ops | Health- und Readiness-Probes, Prometheus-Metriken, Structured Logging |

Das Frontend ruft nie die Kubernetes API auf. Das NestJS-Backend hält die kubeconfig, JWT-Sessions mit Token-Widerruf in PostgreSQL und stellt nur freigegebene Operationen bereit. Gleiches Muster wie hinter einer internen Platform-API.

### Aufbau

pnpm Monorepo: React und Vite im Frontend, NestJS mit `@kubernetes/client-node` im Backend, gemeinsame DTOs in `@dpd/shared`, OpenAPI aus Controllern.

Die lokale Entwicklung ist wie eine kleine echte Umgebung eingerichtet:

- **kind** führt Demo-Workloads (`demo-shop`) im Cluster aus
- **Docker Compose** startet Postgres, API und UI über nginx auf einem Port
- **Helm Chart** (`deploy/helm/dpd`) für Production-Installationen

Integrationstests laufen gegen eine live API auf kind. Playwright deckt Login und den Deployments-Flow ab. Design-Notizen stehen in [ADRs](../adr/).

### Für wen das gedacht ist

Das Projekt ist für Lernen und Portfolio. Es zeigt Kubernetes jenseits von `kubectl apply`: Rollouts, RBAC, Streaming, Observability und Auslieferung des Stacks mit Docker, CI und Helm. MIT-Lizenz. Forken, erweitern oder Teile im eigenen UI wiederverwenden.

Lens oder Kubernetes Dashboard reichen, wenn Sie nur einen generischen Cluster-Explorer brauchen. Deployard geht tiefer bei Deployments, Betrieb und dem Weg von Compose zum Cluster.

## Funktionen

- Deployment-Liste, Revisionshistorie, Rollout Undo
- Pod-Status mit Live-Updates, Log-Tail (SSE), Exec-Konsole
- Docker Compose Import, Rebuild, kind Image Load
- Services, Endpoints, Ingress, Port-Forward aus der UI
- Rollen und bereichsbasierter Zugriff (view / operate / manage)
- Prometheus-Metriken für den API-Prozess
- 28 UI-Sprachen (i18next)

## Voraussetzungen

- Docker Desktop (läuft)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Tooling prüfen:

```bash
make install-tools
make doctor
```

## Lokale Einrichtung

Voller Stack: **kind Cluster** (Demo-Workloads) + **Docker Compose** (Postgres, API, Web-UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Was jeder Schritt macht:

| Befehl | Aktion |
|---|---|
| `make cluster-up` | Erstellt kind Cluster `dpd-local`, schaltet kubectl auf `kind-dpd-local` |
| `make seed-demo` | Baut demo-shop Images, lädt sie in kind, wendet `demo/demo-shop/kubernetes` an |
| `make docker-up` | Baut und startet Postgres, API und Web (nginx auf Port aus `WEB_PORT`) |

Stoppen oder zurücksetzen:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Lokale URLs

Standardport ist **18480** (`WEB_PORT` in `.env`).

| URL | Was |
|---|---|
| http://localhost:18480 | Web UI (Login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API Liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes Readiness |
| http://localhost:18480/api/metrics | Prometheus Metrics (API) |
| http://localhost:30081 | demo-shop Web (NodePort in kind, nach `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (Host-Zugriff, aus `.env`) |

Standard-Dev-Benutzer (nur Seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokale Entwicklung (ohne Docker UI)

API und Web laufen auf dem Host. Postgres kann in Docker bleiben.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Was |
|---|---|
| http://localhost:5173 | Web UI (Vite Dev Server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Nützliche Befehle

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

Rebuild nach Codeänderungen:

```bash
make docker-up
```

## Production

Siehe [docs/deploy.md](../deploy.md) für Helm, Migrations und `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Beispiele

| Pfad | Was es ist |
|---|---|
| `demo/demo-shop` | Postgres + API + Web, in kind geseedet |
| `demo/weather-station` | Kleiner Compose-Stack zum Import-Üben |
| `demo/todo-board` | Minimales Frontend + API Sample |
| `examples/kubernetes/` | kind Config, RBAC Samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Schicht | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Das Frontend spricht den Cluster nie direkt an. Die API erzwingt JWT-Auth mit bereichsbasierten Rechten. Der Kubernetes ServiceAccount nutzt Least-Privilege RBAC (siehe `examples/kubernetes/rbac.yaml`).

Details: [docs/architecture.md](../architecture.md) und [ADRs](../adr/)

## Dokumentation

| Doc | Thema |
|---|---|
| [Architecture](../architecture.md) | Design und Phasen |
| [Deploy](../deploy.md) | Helm, Migrations, First Admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Lizenz

[MIT](../../LICENSE). Sie dürfen das Projekt für jeden Zweck nutzen, kopieren, ändern und verbreiten, einschließlich kommerzieller Nutzung, solange der Lizenztext erhalten bleibt.
