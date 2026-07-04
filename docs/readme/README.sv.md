<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kontrollplan för Kubernetes-deployments</strong>
</p>

<p align="center">
  Skapad för <strong>utbildning och portfölj</strong>.<br/>
  Fri att använda, ändra och dela under <a href="../../LICENSE">MIT-licensen</a>.
</p>

<p align="center">
  <sub>
    Utforska deployments, rollback, pod-status och loggar via ett typat webbgränssnitt<br/>
    i stället för att jonglera kubectl, Compose och engångsskript.
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
  <a href="README.no.md">Norsk</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <strong>Svenska</strong> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Deployard deployments-dashboard" width="720" />
</p>

## Om

Deployard är en kontrollplan för deployments i Kubernetes. Webbgränssnittet och det typade API:et ligger framför klustret så att webbläsare och skript aldrig når API-servern direkt.

### Problemet

Klusterarbete innebär oftast att hoppa mellan verktyg. `kubectl` för rollouts och pod-status. Docker Compose för lokala builds. Shell-skript för att ladda images till kind. Separata flikar för loggar och port-forward. Varje verktyg har sin egen autentisering, utdataformat och typiska fel. Små team märker det snabbt. Större team täcker över det med interna dashboards som ofta bara är läsbara eller låsta till en miljö.

Deployard fokuserar på deployment-livscykeln: vad som körs, vilken revision som är aktiv, pod-hälsa, rollback, logg-tail och att få in ett Compose-projekt i klustret utan en manuell checklista.

### Vad du får

| Område | Vad Deployard gör |
|---|---|
| Deployments | Lista, detaljer, revisionshistorik, skalning, inaktivera, omstart, rollout undo |
| Pods | Live-status (watch), logg-tail via SSE, exec-konsol, filbläddrare |
| Import | Tolka Compose, förhandsgranska K8s-manifest, bygga images, ladda till kind, apply |
| Network | Services, endpoints, ingress, åtkomst i webbläsaren via kontrollerad port-forward |
| Admin | Användare, roller, behörigheter per sektion (view / operate / manage) |
| Ops | Health- och readiness probes, Prometheus-mätvärden, strukturerad loggning |

Frontend anropar aldrig Kubernetes API. NestJS-backend håller kubeconfig, kör JWT-sessioner med token-revokering i PostgreSQL och exponerar bara tillåtna operationer. Samma mönster som bakom ett internt plattforms-API.

### Hur det är byggt

pnpm monorepo: React och Vite i frontend, NestJS med `@kubernetes/client-node` i backend, delade DTO:er i `@dpd/shared`, OpenAPI från controllers.

Lokal utveckling är uppsatt som en liten riktig miljö:

- **kind** kör demo-workloads (`demo-shop`) i klustret
- **Docker Compose** kör Postgres, API och UI via nginx på en port
- **Helm chart** (`deploy/helm/dpd`) för production-liknande installationer

Integrationstester träffar ett live-API mot kind. Playwright täcker inloggning och deployments-flödet. Designanteckningar finns i [ADR](../adr/).

### Vem det är för

Projektet är till för lärande och portfölj. Det visar Kubernetes bortom `kubectl apply`: rollouts, RBAC, streaming, observability och att leverera stacken med Docker, CI och Helm. MIT-licens. Forka, utöka eller återanvänd delar i ditt eget UI.

Lens eller Kubernetes Dashboard räcker om du bara behöver en generisk klusterutforskare. Deployard går djupare på deployments, drift och vägen från Compose till kluster.

## Funktioner

- Deployments-lista, revisionshistorik, rollout undo
- Pod-status med live-uppdateringar, logg-tail (SSE), exec-konsol
- Docker Compose-import, rebuild, kind image load
- Services, endpoints, ingress, port-forward från UI
- Roller och sektionsbaserad åtkomst (view / operate / manage)
- Prometheus-mätvärden för API-processen
- 28 UI-språk (i18next)

## Förutsättningar

- Docker Desktop (körs)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Kontrollera verktyg:

```bash
make install-tools
make doctor
```

## Lokal setup

Hel stack: **kind-kluster** (demo-workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Vad varje steg gör:

| Kommando | Åtgärd |
|---|---|
| `make cluster-up` | Skapar kind-kluster `dpd-local`, byter kubectl till `kind-dpd-local` |
| `make seed-demo` | Bygger demo-shop-images, laddar dem till kind, applicerar `demo/demo-shop/kubernetes` |
| `make docker-up` | Bygger och startar Postgres, API och web (nginx på port från `WEB_PORT`) |

Stoppa eller återställ:

```bash
make docker-down          # stoppa Compose-stack
make cluster-down         # ta bort kind-kluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # rensa Postgres-volym
```

## Lokala URL:er

Standardport är **18480** (`WEB_PORT` i `.env`).

| URL | Vad |
|---|---|
| http://localhost:18480 | Web UI (inloggning) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus-mätvärden (API) |
| http://localhost:30081 | demo-shop web (NodePort i kind, efter `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (värdåtkomst, från `.env`) |

Standard dev-användare (endast seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokal utveckling (utan Docker UI)

API och web körs på värden. Postgres kan ligga kvar i Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Vad |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Användbara kommandon

```bash
make docker-logs          # följ API / web / Postgres-loggar
make lint                 # TypeScript lint (alla paket)
make test                 # enhetstester
make test-integration     # API + kind (API på :3000, Postgres krävs)
make test-e2e             # Playwright (web på :5173)
make helm-lint            # lint Helm chart
make helm-install         # installera chart i kind (alternativ till docker-up)
make cluster-down         # ta bort kind-kluster
```

Bygg om efter kodändringar:

```bash
make docker-up
```

## Production

Se [docs/deploy.md](../deploy.md) för Helm, migreringar och `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Exempel

| Sökväg | Vad det är |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seedat till kind |
| `demo/weather-station` | Liten compose-stack för importövning |
| `demo/todo-board` | Minimalt frontend + API-exempel |
| `examples/kubernetes/` | kind config, RBAC-exempel |

```bash
make demo-load
make seed-demo
```

## Stack

| Lager | Teknik |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (användare, roller) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkitektur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend anropar aldrig klustret direkt. API:et tillämpar JWT-auth med sektionsbaserade behörigheter. Kubernetes ServiceAccount använder RBAC med minsta möjliga rättigheter (se `examples/kubernetes/rbac.yaml`).

Detaljer: [docs/architecture.md](../architecture.md) och [ADR](../adr/)

## Dokumentation

| Dokument | Ämne |
|---|---|
| [Architecture](../architecture.md) | Design och faser |
| [Deploy](../deploy.md) | Helm, migreringar, första admin |
| [Repository layout](../repository-structure.md) | Mappkonventioner |
| [Security](../../SECURITY.md) | Rapportera sårbarhet |
| [Changelog](../../CHANGELOG.md) | Versionsanteckningar |

## Licens

[MIT](../../LICENSE). Du får använda, kopiera, ändra och distribuera detta projekt för vilket syfte som helst, inklusive kommersiellt, så länge licensmeddelandet bevaras.
