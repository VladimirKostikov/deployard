<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control plane til Kubernetes deployment</strong>
</p>

<p align="center">
  Oprettet til <strong>undervisning og portfolio</strong>.<br/>
  Fri brug, ændring og deling under <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployment, rollback, pod-status og logs i et typet web-UI<br/>
    i stedet for at skifte mellem kubectl, Compose og engangsskript.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <strong>Dansk</strong> ·
  <a href="README.de.md">Deutsch</a> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deployment-dashboard" width="720" />
</p>

## Om projektet

Deployard er et control plane til deployment i Kubernetes. Web-UI og det typede API sidder foran clusteret, så browsere og scripts aldrig rammer API server direkte.

### Problemet

Cluster-arbejde betyder som regel at hoppe mellem værktøjer. `kubectl` til rollout og pod-status. Docker Compose til lokale builds. Shell-scripts til at loade images ind i kind. Separate faner til logs og port-forward. Hvert værktøj har sin egen auth, outputformat og fejlmønstre. Små teams mærker det hurtigt. Større teams lapper det med interne dashboards, der ofte kun er read-only eller låst til ét miljø.

Deployard fokuserer på deployment-livscyklussen: hvad der kører, hvilken revision der er live, pod-sundhed, rollback, log tailing og at få et Compose-projekt ind i clusteret uden manuel checklist.

### Hvad du får

| Område | Hvad Deployard gør |
|---|---|
| Deployments | Liste, detaljer, revisionshistorik, scale, disable, restart, rollout undo |
| Pods | Live status (watch), log tail over SSE, exec-konsol, file browser |
| Import | Parse Compose, forhåndsvis K8s-manifests, build images, load ind i kind, apply |
| Network | Services, endpoints, ingress, browser-adgang via kontrolleret port-forward |
| Admin | Brugere, roller, sektionsbaserede rettigheder (view / operate / manage) |
| Ops | Health og readiness probes, Prometheus metrics, structured logging |

Frontend kalder aldrig Kubernetes API. NestJS backend holder kubeconfig, JWT-sessioner med token-revokering i PostgreSQL og eksponerer kun whitelisted operationer. Samme mønster som bag et internt platform API.

### Sådan er det bygget

pnpm monorepo: React og Vite på frontend, NestJS med `@kubernetes/client-node` på backend, delte DTOs i `@dpd/shared`, OpenAPI fra controllers.

Lokal udvikling er sat op som et lille rigtigt miljø:

- **kind** kører demo workloads (`demo-shop`) i clusteret
- **Docker Compose** kører Postgres, API og UI via nginx på én port
- **Helm chart** (`deploy/helm/dpd`) til production-lignende installs

Integrationstests rammer et live API mod kind. Playwright dækker login og deployments-flow. Design-noter ligger i [ADRs](../adr/).

### Hvem det er til

Projektet er til læring og portfolio. Det viser Kubernetes ud over `kubectl apply`: rollout, RBAC, streaming, observability og at shippe stacken med Docker, CI og Helm. MIT license. Fork det, udvid det, eller genbrug dele i dit eget UI.

Lens eller Kubernetes Dashboard er nok, hvis du kun skal bruge en generel cluster explorer. Deployard går dybere på deployment, drift og vejen fra Compose til cluster.

## Funktioner

- Deployment-liste, revisionshistorik, rollout undo
- Pod-status med live opdateringer, log tail (SSE), exec-konsol
- Docker Compose import, rebuild, kind image load
- Services, endpoints, ingress, port-forward fra UI
- Roller og sektionsbaseret adgang (view / operate / manage)
- Prometheus metrics for API-processen
- 28 UI-sprog (i18next)

## Forudsætninger

- Docker Desktop (kører)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Tjek værktøjer:

```bash
make install-tools
make doctor
```

## Lokal opsætning

Fuld stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Hvad hvert trin gør:

| Kommando | Handling |
|---|---|
| `make cluster-up` | Opretter kind cluster `dpd-local`, skifter kubectl til `kind-dpd-local` |
| `make seed-demo` | Bygger demo-shop images, loader dem ind i kind, apply `demo/demo-shop/kubernetes` |
| `make docker-up` | Bygger og starter Postgres, API og web (nginx på port fra `WEB_PORT`) |

Stop eller reset:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Lokale URL'er

Standardport er **18480** (`WEB_PORT` i `.env`).

| URL | Hvad |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort i kind, efter `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host access, fra `.env`) |

Standard dev-brugere (kun seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokal udvikling (uden Docker UI)

API og web kører på host. Postgres kan blive i Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Hvad |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Nyttige kommandoer

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

Rebuild efter kodeændringer:

```bash
make docker-up
```

## Production

Se [docs/deploy.md](../deploy.md) for Helm, migrations og `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Eksempler

| Sti | Hvad det er |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seedet ind i kind |
| `demo/weather-station` | Lille compose stack til import-øvelse |
| `demo/todo-board` | Minimalt frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Lag | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkitektur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend kalder aldrig clusteret direkte. API håndhæver JWT auth med sektionsbaserede rettigheder. Kubernetes ServiceAccount bruger least-privilege RBAC (se `examples/kubernetes/rbac.yaml`).

Detaljer: [docs/architecture.md](../architecture.md) og [ADRs](../adr/)

## Dokumentation

| Doc | Emne |
|---|---|
| [Architecture](../architecture.md) | Design og faser |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Licens

[MIT](../../LICENSE). Du må bruge, kopiere, ændre og distribuere projektet til ethvert formål, inklusive kommercielt brug, så længe licensmeddelelsen bevares.
