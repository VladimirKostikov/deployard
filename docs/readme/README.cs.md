<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control plane pro Kubernetes deployment</strong>
</p>

<p align="center">
  Vytvořeno pro <strong>vzdělávací účely a portfolio</strong>.<br/>
  Volné použití, úpravy a sdílení pod <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployment, rollback, stav pod a logy v typovaném webovém UI<br/>
    místo neustálého přepínání mezi kubectl, Compose a jednorázovými skripty.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <strong>Čeština</strong> ·
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
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Dashboard deploymentů Deployard" width="720" />
</p>

## O projektu

Deployard je control plane pro deployment v Kubernetes. Webové UI a typované API stojí před clusterem, takže prohlížeče a skripty nevolají API server přímo.

### Problém

Práce s clusterem obvykle znamená skákání mezi nástroji. `kubectl` pro rollout a stav pod. Docker Compose pro lokální build. Shell skripty pro načtení imagí do kind. Samostatné záložky pro logy a port-forward. Každý nástroj má vlastní autentizaci, formát výstupu a typické chyby. Malé týmy to pocítí rychle. Větší to řeší interními dashboardy, které jsou často jen pro čtení nebo vázané na jedno prostředí.

Deployard se soustředí na životní cyklus deploymentu: co běží, která revize je aktivní, zdraví pod, rollback, tail logů a dostat Compose projekt do clusteru bez ručního checklistu.

### Co získáte

| Oblast | Co Deployard umí |
|---|---|
| Deployments | Seznam, detail, historie revizí, scale, disable, restart, rollout undo |
| Pods | Stav v reálném čase (watch), tail logů přes SSE, exec konzole, file browser |
| Import | Parse Compose, náhled K8s manifestů, build imagí, load do kind, apply |
| Network | Services, endpoints, ingress, přístup z prohlížeče přes kontrolovaný port-forward |
| Admin | Uživatelé, role, oprávnění podle sekcí (view / operate / manage) |
| Ops | Health a readiness probes, metriky Prometheus, structured logging |

Frontend nikdy nevolá Kubernetes API. NestJS backend drží kubeconfig, JWT session s revokací tokenů v PostgreSQL a vystavuje jen povolené operace. Stejný vzor jako u interního platform API.

### Jak je to postavené

pnpm monorepo: React a Vite na frontendu, NestJS s `@kubernetes/client-node` na backendu, sdílené DTO v `@dpd/shared`, OpenAPI z controllerů.

Lokální vývoj je nastavený jako malé reálné prostředí:

- **kind** spouští demo workloads (`demo-shop`) v clusteru
- **Docker Compose** běží Postgres, API a UI přes nginx na jednom portu
- **Helm chart** (`deploy/helm/dpd`) pro production instalace

Integrační testy běží proti živému API na kind. Playwright pokrývá login a deployments flow. Design poznámky jsou v [ADRs](../adr/).

### Pro koho to je

Projekt je pro učení a portfolio. Ukazuje Kubernetes víc než `kubectl apply`: rollout, RBAC, streaming, observability a dodání stacku přes Docker, CI a Helm. MIT license. Fork, rozšíření nebo znovupoužití částí ve vlastním UI.

Lens nebo Kubernetes Dashboard stačí, pokud potřebujete jen obecný cluster explorer. Deployard jde hlouběji do deploymentů, operací a cesty z Compose do clusteru.

## Funkce

- Seznam deploymentů, historie revizí, rollout undo
- Stav pod s live aktualizacemi, tail logů (SSE), exec konzole
- Import Docker Compose, rebuild, kind image load
- Services, endpoints, ingress, port-forward z UI
- Role a přístup podle sekcí (view / operate / manage)
- Prometheus metriky pro API proces
- 28 jazyků UI (i18next)

## Požadavky

- Docker Desktop (běžící)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Kontrola nástrojů:

```bash
make install-tools
make doctor
```

## Lokální nastavení

Celý stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Co dělá každý krok:

| Příkaz | Akce |
|---|---|
| `make cluster-up` | Vytvoří kind cluster `dpd-local`, přepne kubectl na `kind-dpd-local` |
| `make seed-demo` | Sestaví demo-shop imagy, načte do kind, apply `demo/demo-shop/kubernetes` |
| `make docker-up` | Sestaví a spustí Postgres, API a web (nginx na portu z `WEB_PORT`) |

Zastavení nebo reset:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Lokální URL

Výchozí port je **18480** (`WEB_PORT` v `.env`).

| URL | Co |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort v kind, po `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host access, z `.env`) |

Výchozí dev uživatelé (jen seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokální vývoj (bez Docker UI)

API a web na hostu. Postgres může zůstat v Dockeru.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Co |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Užitečné příkazy

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

Rebuild po změnách kódu:

```bash
make docker-up
```

## Production

Viz [docs/deploy.md](../deploy.md) pro Helm, migrations a `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Příklady

| Cesta | Co to je |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed do kind |
| `demo/weather-station` | Malý compose stack pro procvičení importu |
| `demo/todo-board` | Minimální frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Vrstva | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nikdy nevolá cluster přímo. API vynucuje JWT auth s oprávněními podle sekcí. Kubernetes ServiceAccount používá least-privilege RBAC (viz `examples/kubernetes/rbac.yaml`).

Podrobnosti: [docs/architecture.md](../architecture.md) a [ADRs](../adr/)

## Dokumentace

| Doc | Téma |
|---|---|
| [Architecture](../architecture.md) | Design a fáze |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Licence

[MIT](../../LICENSE). Projekt můžete používat, kopírovat, upravovat a šířit pro jakýkoli účel včetně komerčního, pokud zachováte text licence.
