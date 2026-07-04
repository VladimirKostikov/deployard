<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Riadiaca rovina pre Kubernetes deploymenty</strong>
</p>

<p align="center">
  Vytvorené na <strong>vzdelávacie a portfólio účely</strong>.<br/>
  Voľne použiteľné, upraviteľné a zdieľateľné pod <a href="../../LICENSE">licenciou MIT</a>.
</p>

<p align="center">
  <sub>
    Prehliadajte deploymenty, rollbacky, stav podov a logy cez typované webové UI<br/>
    namiesto neustáleho prepínania medzi kubectl, Compose a jednorazovými skriptmi.
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
  <strong>Slovenčina</strong> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Deployard dashboard deploymentov" width="720" />
</p>

## O projekte

Deployard je riadiaca rovina pre deploymenty v Kubernetes. Webové UI a typované API stoja pred clusterom, takže prehliadače a skripty nikdy nevolajú API server priamo.

### Problém

Práca s clusterom zvyčajne znamená skákanie medzi nástrojmi. `kubectl` na rollouty a stav podov. Docker Compose na lokálne buildy. Shell skripty na načítanie obrazov do kind. Samostatné záložky na logy a port-forward. Každý nástroj má vlastnú autentifikáciu, formát výstupu a typické zlyhania. Malé tímy to pocítia rýchlo. Väčšie to riešia internými dashboardmi, ktoré sú často len na čítanie alebo viazané na jedno prostredie.

Deployard sa zameriava na životný cyklus deploymentu: čo beží, ktorá revízia je aktívna, zdravie podov, rollbacky, tail logov a dostať Compose projekt do clusteru bez manuálneho checklistu.

### Čo získate

| Oblasť | Čo robí Deployard |
|---|---|
| Deployments | Zoznam, detail, história revízií, škálovanie, vypnutie, reštart, rollout undo |
| Pods | Stav naživo (watch), tail logov cez SSE, exec konzola, prehliadač súborov |
| Import | Parsovanie Compose, náhľad K8s manifestov, build obrazov, načítanie do kind, apply |
| Network | Services, endpoints, ingress, prístup z prehliadača cez kontrolovaný port-forward |
| Admin | Používatelia, roly, oprávnenia podľa sekcií (view / operate / manage) |
| Ops | Health a readiness probes, metriky Prometheus, štruktúrované logovanie |

Frontend nikdy nevolá Kubernetes API. NestJS backend drží kubeconfig, spúšťa JWT relácie s odvolaním tokenov v PostgreSQL a vystavuje len povolené operácie. Rovnaký vzor ako za interným platform API.

### Ako je postavený

pnpm monorepo: React a Vite na frontende, NestJS s `@kubernetes/client-node` na backende, zdieľané DTO v `@dpd/shared`, OpenAPI z controllerov.

Lokálny vývoj je nastavený ako malé reálne prostredie:

- **kind** spúšťa demo workloady (`demo-shop`) v clustri
- **Docker Compose** spúšťa Postgres, API a UI cez nginx na jednom porte
- **Helm chart** (`deploy/helm/dpd`) pre production inštalácie

Integračné testy volajú živé API cez kind. Playwright pokrýva login a flow deploymentov. Dizajnové poznámky sú v [ADR](../adr/).

### Pre koho je

Projekt je na učenie a portfólio. Ukazuje Kubernetes nad rámec `kubectl apply`: rollouty, RBAC, streaming, observability a dodanie stacku cez Docker, CI a Helm. Licencia MIT. Môžete forknúť, rozšíriť alebo znova použiť časti vo vlastnom UI.

Lens alebo Kubernetes Dashboard stačia, ak potrebujete len generický prieskumník clusteru. Deployard ide hlbšie do deploymentov, operácií a cesty z Compose do clusteru.

## Funkcie

- Zoznam deploymentov, história revízií, rollout undo
- Stav podov s live aktualizáciami, tail logov (SSE), exec konzola
- Import Docker Compose, rebuild, načítanie obrazov do kind
- Services, endpoints, ingress, port-forward z UI
- Roly a prístup podľa sekcií (view / operate / manage)
- Metriky Prometheus pre API proces
- 28 jazykov UI (i18next)

## Požiadavky

- Docker Desktop (beží)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Kontrola nástrojov:

```bash
make install-tools
make doctor
```

## Lokálne nastavenie

Celý stack: **kind cluster** (demo workloady) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Čo robí každý krok:

| Príkaz | Akcia |
|---|---|
| `make cluster-up` | Vytvorí kind cluster `dpd-local`, prepne kubectl na `kind-dpd-local` |
| `make seed-demo` | Zostaví obrazy demo-shop, načíta ich do kind, aplikuje `demo/demo-shop/kubernetes` |
| `make docker-up` | Zostaví a spustí Postgres, API a web (nginx na porte z `WEB_PORT`) |

Zastavenie alebo reset:

```bash
make docker-down          # zastaví Compose stack
make cluster-down         # zmaže kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # vymaže Postgres volume
```

## Lokálne URL

Predvolený port je **18480** (`WEB_PORT` v `.env`).

| URL | Čo to je |
|---|---|
| http://localhost:18480 | Web UI (prihlásenie) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Metriky Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort v kind, po `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (prístup z hosta, z `.env`) |

Predvolení dev používatelia (len seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokálny vývoj (bez Docker UI)

API a web bežia na hoste. Postgres môže zostať v Dockeri.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Čo to je |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Užitočné príkazy

```bash
make docker-logs          # sleduj logy API / web / Postgres
make lint                 # TypeScript lint (všetky balíčky)
make test                 # unit testy
make test-integration     # API + kind (API na :3000, potrebný Postgres)
make test-e2e             # Playwright (web na :5173)
make helm-lint            # lint Helm chart
make helm-install         # nainštaluje chart do kind (alternatíva k docker-up)
make cluster-down         # odstráni kind cluster
```

Rebuild po zmene kódu:

```bash
make docker-up
```

## Production

Pozri [docs/deploy.md](../deploy.md) pre Helm, migrácie a `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Príklady

| Cesta | Čo to je |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed do kind |
| `demo/weather-station` | Malý compose stack na cvičenie importu |
| `demo/todo-board` | Minimálna ukážka frontend + API |
| `examples/kubernetes/` | kind config, RBAC vzorky |

```bash
make demo-load
make seed-demo
```

## Stack

| Vrstva | Technológia |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (používatelia, roly) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektúra

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nikdy nevolá cluster priamo. API vynucuje JWT autentifikáciu s oprávneniami podľa sekcií. Kubernetes ServiceAccount používa RBAC s minimálnymi právami (pozri `examples/kubernetes/rbac.yaml`).

Podrobnosti: [docs/architecture.md](../architecture.md) a [ADR](../adr/)

## Dokumentácia

| Dokument | Téma |
|---|---|
| [Architecture](../architecture.md) | Dizajn a fázy |
| [Deploy](../deploy.md) | Helm, migrácie, prvý admin |
| [Repository layout](../repository-structure.md) | Konvencie priečinkov |
| [Security](../../SECURITY.md) | Nahlásiť zraniteľnosť |
| [Changelog](../../CHANGELOG.md) | Poznámky k vydaniam |

## Licencia

[MIT](../../LICENSE). Môžete používať, kopírovať, upravovať a distribuovať tento projekt na akýkoľvek účel vrátane komerčného, pokiaľ je zachovaná licenčná poznámka.
