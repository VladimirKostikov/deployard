<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes deployment control plane</strong>
</p>

<p align="center">
  Gemaakt voor <strong>educatieve doeleinden en portfolio</strong>.<br/>
  Vrij te gebruiken, aan te passen en te delen onder de <a href="../../LICENSE">MIT-licentie</a>.
</p>

<p align="center">
  <sub>
    Bekijk deployments, rollbacks, pod-status en logs via een getypeerde web UI<br/>
    in plaats van kubectl, Compose en losse scripts te combineren.
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
  <strong>Nederlands</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deployments dashboard" width="720" />
</p>

## Over

Deployard is een deployment control plane voor Kubernetes. De web UI en getypeerde API staan voor het cluster, zodat browsers en scripts nooit rechtstreeks de API server aanroepen.

### Het probleem

Clusterwerk betekent meestal schakelen tussen tools. `kubectl` voor rollouts en pod-status. Docker Compose voor lokale builds. Shell-scripts om images in kind te laden. Aparte tabbladen voor logs en port-forwards. Elke tool heeft eigen auth, outputformaat en foutpatronen. Kleine teams merken dat snel. Grotere teams vullen het gat met interne dashboards die vaak read-only zijn of aan één omgeving vastzitten.

Deployard richt zich op de deployment lifecycle: wat draait, welke revisie live is, pod health, rollbacks, log tailing en een Compose-project in het cluster zetten zonder handmatige checklist.

### Wat je krijgt

| Gebied | Wat Deployard doet |
|---|---|
| Deployments | Lijst, detail, revisiegeschiedenis, schalen, uitschakelen, herstarten, rollout undo |
| Pods | Live status (watch), log tail via SSE, exec-console, bestandsbrowser |
| Import | Compose parsen, K8s-manifests previewen, images bouwen, laden in kind, apply |
| Network | Services, endpoints, ingress, toegang in de browser via gecontroleerde port-forward |
| Admin | Gebruikers, rollen, rechten per sectie (view / operate / manage) |
| Ops | Health en readiness probes, Prometheus-metrics, gestructureerde logging |

De frontend roept nooit de Kubernetes API aan. De NestJS backend beheert de kubeconfig, JWT-sessies met tokenrevocatie in PostgreSQL en biedt alleen toegestane operaties. Hetzelfde patroon als achter een intern platform API.

### Hoe het is opgebouwd

pnpm monorepo: React en Vite aan de frontend, NestJS met `@kubernetes/client-node` aan de backend, gedeelde DTO's in `@dpd/shared`, OpenAPI uit controllers.

Lokale ontwikkeling is ingericht als een kleine echte omgeving:

- **kind** draait demo workloads (`demo-shop`) in het cluster
- **Docker Compose** draait Postgres, API en nginx-geserveerde UI op één poort
- **Helm chart** (`deploy/helm/dpd`) voor production-achtige installs

Integratietests raken een live API tegen kind. Playwright dekt login en de deployments-flow. Ontwerpnotities staan in [ADRs](../adr/).

### Voor wie

Het project is bedoeld voor leren en portfolio. Het laat Kubernetes zien voorbij `kubectl apply`: rollouts, RBAC, streaming, observability en het uitrollen van de stack met Docker, CI en Helm. MIT-licentie. Fork, breid uit of hergebruik delen in je eigen UI.

Lens of Kubernetes Dashboard volstaan als je alleen een generieke cluster explorer nodig hebt. Deployard gaat dieper op deployments, operaties en het pad van Compose naar cluster.

## Functies

- Deploymentlijst, revisiegeschiedenis, rollout undo
- Pod-status met live updates, log tail (SSE), exec-console
- Docker Compose import, rebuild, kind image load
- Services, endpoints, ingress, port-forward vanuit de UI
- Rollen en toegang per sectie (view / operate / manage)
- Prometheus-metrics voor het API-proces
- 28 UI-talen (i18next)

## Vereisten

- Docker Desktop (actief)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Controleer tooling:

```bash
make install-tools
make doctor
```

## Lokale setup

Volledige stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Wat elke stap doet:

| Commando | Actie |
|---|---|
| `make cluster-up` | Maakt kind cluster `dpd-local`, schakelt kubectl naar `kind-dpd-local` |
| `make seed-demo` | Bouwt demo-shop images, laadt ze in kind, past `demo/demo-shop/kubernetes` toe |
| `make docker-up` | Bouwt en start Postgres, API en web (nginx op poort uit `WEB_PORT`) |

Stoppen of resetten:

```bash
make docker-down          # stop Compose stack
make cluster-down         # verwijder kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wis Postgres volume
```

## Lokale URL's

Standaardpoort is **18480** (`WEB_PORT` in `.env`).

| URL | Wat |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus-metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort in kind, na `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (hosttoegang, uit `.env`) |

Standaard dev-gebruikers (alleen seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokale ontwikkeling (zonder Docker UI)

API en web draaien op de host. Postgres kan in Docker blijven.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Wat |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Handige commando's

```bash
make docker-logs          # volg API / web / Postgres logs
make lint                 # TypeScript lint (alle packages)
make test                 # unit tests
make test-integration     # API + kind (API op :3000, Postgres vereist)
make test-e2e             # Playwright (web op :5173)
make helm-lint            # lint Helm chart
make helm-install         # installeer chart in kind (alternatief voor docker-up)
make cluster-down         # verwijder kind cluster
```

Rebuild na codewijzigingen:

```bash
make docker-up
```

## Production

Zie [docs/deploy.md](../deploy.md) voor Helm, migraties en `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Voorbeelden

| Pad | Wat het is |
|---|---|
| `demo/demo-shop` | Postgres + API + web, geseed in kind |
| `demo/weather-station` | Kleine compose stack om import te oefenen |
| `demo/todo-board` | Minimale frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Laag | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (gebruikers, rollen) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architectuur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

De frontend roept het cluster nooit rechtstreeks aan. De API handhaaft JWT auth met rechten per sectie. De Kubernetes ServiceAccount gebruikt least-privilege RBAC (zie `examples/kubernetes/rbac.yaml`).

Details: [docs/architecture.md](../architecture.md) en [ADRs](../adr/)

## Documentatie

| Doc | Onderwerp |
|---|---|
| [Architecture](../architecture.md) | Ontwerp en fasen |
| [Deploy](../deploy.md) | Helm, migraties, eerste admin |
| [Repository layout](../repository-structure.md) | Mapconventies |
| [Security](../../SECURITY.md) | Meld een kwetsbaarheid |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Licentie

[MIT](../../LICENSE). Je mag dit project gebruiken, kopiëren, aanpassen en verspreiden voor elk doel, inclusief commercieel gebruik, zolang de licentiemelding behouden blijft.
