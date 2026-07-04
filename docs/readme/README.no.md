<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes deployment control plane</strong>
</p>

<p align="center">
  Laget for <strong>utdanning og portfolio</strong>.<br/>
  Fri bruk, endring og deling under <a href="../../LICENSE">MIT-lisensen</a>.
</p>

<p align="center">
  <sub>
    Utforsk deployments, rollbacks, pod-status og logger via et typet web UI<br/>
    i stedet for å hoppe mellom kubectl, Compose og enkeltstående skript.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.da.md">Dansk</a> ·
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
  <strong>Norsk</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deployments dashboard" width="720" />
</p>

## Om

Deployard er et deployment control plane for Kubernetes. Web UI og typet API ligger foran clusteret, så nettlesere og skript aldri treffer API server direkte.

### Problemet

Clusterarbeid betyr vanligvis å hoppe mellom verktøy. `kubectl` for rollouts og pod-status. Docker Compose for lokale builds. Shell-skript for å laste images inn i kind. Egne faner for logger og port-forwards. Hvert verktøy har egen auth, outputformat og feilmønstre. Små team merker det raskt. Større team fyller gapet med interne dashboards som ofte er read-only eller låst til ett miljø.

Deployard fokuserer på deployment lifecycle: hva som kjører, hvilken revisjon som er live, pod health, rollbacks, log tailing og å få et Compose-prosjekt inn i clusteret uten manuell sjekkliste.

### Hva du får

| Område | Hva Deployard gjør |
|---|---|
| Deployments | Liste, detaljer, revisjonshistorikk, skalering, deaktivering, restart, rollout undo |
| Pods | Live status (watch), log tail over SSE, exec-konsoll, filutforsker |
| Import | Parse Compose, forhåndsvis K8s-manifests, bygg images, last inn i kind, apply |
| Network | Services, endpoints, ingress, tilgang i nettleseren via kontrollert port-forward |
| Admin | Brukere, roller, rettigheter per seksjon (view / operate / manage) |
| Ops | Health og readiness probes, Prometheus-metrikker, strukturert logging |

Frontend kaller aldri Kubernetes API. NestJS backend holder kubeconfig, kjører JWT-sesjoner med token-revokering i PostgreSQL og eksponerer bare whitelisted operasjoner. Samme mønster som bak et internt platform API.

### Hvordan det er bygget

pnpm monorepo: React og Vite på frontend, NestJS med `@kubernetes/client-node` på backend, delte DTOs i `@dpd/shared`, OpenAPI fra controllers.

Lokal utvikling er satt opp som et lite ekte miljø:

- **kind** kjører demo workloads (`demo-shop`) i clusteret
- **Docker Compose** kjører Postgres, API og nginx-servert UI på én port
- **Helm chart** (`deploy/helm/dpd`) for production-lignende installs

Integrasjonstester treffer live API mot kind. Playwright dekker innlogging og deployments-flyten. Designnotater ligger i [ADRs](../adr/).

### Hvem det er for

Prosjektet er for læring og portfolio. Det viser Kubernetes utover `kubectl apply`: rollouts, RBAC, streaming, observability og levering av stacken med Docker, CI og Helm. MIT-lisens. Fork, utvid eller gjenbruk deler i eget UI.

Lens eller Kubernetes Dashboard er nok hvis du bare trenger en generisk cluster explorer. Deployard går dypere på deployments, operasjoner og veien fra Compose til cluster.

## Funksjoner

- Deployment-liste, revisjonshistorikk, rollout undo
- Pod-status med live oppdateringer, log tail (SSE), exec-konsoll
- Docker Compose import, rebuild, kind image load
- Services, endpoints, ingress, port-forward fra UI
- Roller og tilgang per seksjon (view / operate / manage)
- Prometheus-metrikker for API-prosessen
- 28 UI-språk (i18next)

## Forutsetninger

- Docker Desktop (kjører)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Sjekk verktøy:

```bash
make install-tools
make doctor
```

## Lokal oppsett

Full stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Hva hvert steg gjør:

| Kommando | Handling |
|---|---|
| `make cluster-up` | Oppretter kind cluster `dpd-local`, bytter kubectl til `kind-dpd-local` |
| `make seed-demo` | Bygger demo-shop images, laster dem inn i kind, apply `demo/demo-shop/kubernetes` |
| `make docker-up` | Bygger og starter Postgres, API og web (nginx på port fra `WEB_PORT`) |

Stopp eller nullstill:

```bash
make docker-down          # stopp Compose stack
make cluster-down         # slett kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # tøm Postgres volume
```

## Lokale URL-er

Standardport er **18480** (`WEB_PORT` i `.env`).

| URL | Hva |
|---|---|
| http://localhost:18480 | Web UI (innlogging) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus-metrikker (API) |
| http://localhost:30081 | demo-shop web (NodePort i kind, etter `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (hosttilgang, fra `.env`) |

Standard dev-brukere (kun seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokal utvikling (uten Docker UI)

API og web kjører på host. Postgres kan bli i Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Hva |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Nyttige kommandoer

```bash
make docker-logs          # følg API / web / Postgres logger
make lint                 # TypeScript lint (alle pakker)
make test                 # unit tests
make test-integration     # API + kind (API på :3000, Postgres påkrevd)
make test-e2e             # Playwright (web på :5173)
make helm-lint            # lint Helm chart
make helm-install         # installer chart i kind (alternativ til docker-up)
make cluster-down         # fjern kind cluster
```

Rebuild etter kodeendringer:

```bash
make docker-up
```

## Production

Se [docs/deploy.md](../deploy.md) for Helm, migrasjoner og `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Eksempler

| Sti | Hva det er |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seeded inn i kind |
| `demo/weather-station` | Liten compose stack for import-øvelse |
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
| Data | PostgreSQL (brukere, roller) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkitektur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend kaller aldri clusteret direkte. API håndhever JWT auth med rettigheter per seksjon. Kubernetes ServiceAccount bruker least-privilege RBAC (se `examples/kubernetes/rbac.yaml`).

Detaljer: [docs/architecture.md](../architecture.md) og [ADRs](../adr/)

## Dokumentasjon

| Dokument | Tema |
|---|---|
| [Architecture](../architecture.md) | Design og faser |
| [Deploy](../deploy.md) | Helm, migrasjoner, første admin |
| [Repository layout](../repository-structure.md) | Mappekonvensjoner |
| [Security](../../SECURITY.md) | Rapporter sårbarhet |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Lisens

[MIT](../../LICENSE). Du kan bruke, kopiere, endre og distribuere dette prosjektet til ethvert formål, inkludert kommersiell bruk, så lenge lisensvarselet beholdes.
