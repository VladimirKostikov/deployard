<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Panel sterowania wdrożeniami Kubernetes</strong>
</p>

<p align="center">
  Stworzony w <strong>celach edukacyjnych i portfolio</strong>.<br/>
  Wolne użycie, modyfikacja i udostępnianie na licencji <a href="../../LICENSE">MIT</a>.
</p>

<p align="center">
  <sub>
    Wdrożenia, rollbacki, status podów i logi w typowanym web UI<br/>
    zamiast ciągłego przełączania kubectl, Compose i pojedynczych skryptów.
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
  <strong>Polski</strong> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Panel wdrożeń Deployard" width="720" />
</p>

## O projekcie

Deployard to panel sterowania wdrożeniami dla Kubernetes. Web UI i typowane API stoją przed klastrem, więc przeglądarki i skrypty nigdy nie trafiają bezpośrednio do API server.

### Problem

Praca z klastrem zwykle rozproszona jest między narzędzia. `kubectl` do rollout i statusu podów. Docker Compose do lokalnych buildów. Skrypty shell, żeby załadować obrazy do kind. Osobne zakładki na logi i port-forward. Każde narzędzie ma własną autentykację, format wyjścia i typowe błędy. Małe zespoły czują to szybko. Większe łatają luki wewnętrznymi dashboardami, często tylko do odczytu lub przypiętymi do jednego środowiska.

Deployard skupia się na cyklu życia wdrożenia: co działa, która rewizja jest aktywna, zdrowie podów, rollbacki, tail logów i przeniesienie projektu Compose do klastra bez ręcznej checklisty.

### Co dostajesz

| Obszar | Co robi Deployard |
|---|---|
| Deployments | Lista, szczegóły, historia rewizji, skalowanie, wyłączenie, restart, rollout undo |
| Pods | Status na żywo (watch), tail logów przez SSE, konsola exec, przeglądarka plików |
| Import | Parsowanie Compose, podgląd manifestów K8s, build obrazów, ładowanie do kind, apply |
| Network | Services, endpoints, ingress, dostęp z przeglądarki przez kontrolowany port-forward |
| Admin | Użytkownicy, role, uprawnienia według sekcji (view / operate / manage) |
| Ops | Health i readiness probes, metryki Prometheus, logowanie strukturalne |

Frontend nigdy nie wywołuje Kubernetes API. Backend NestJS trzyma kubeconfig, prowadzi sesje JWT z unieważnianiem tokenów w PostgreSQL i udostępnia tylko dozwolone operacje. Ten sam wzorzec co za wewnętrznym platform API.

### Jak to zbudowane

pnpm monorepo: React i Vite na frontendzie, NestJS z `@kubernetes/client-node` na backendzie, wspólne DTO w `@dpd/shared`, OpenAPI z controllerów.

Lokalny development ustawiony jak małe prawdziwe środowisko:

- **kind** uruchamia obciążenia demo (`demo-shop`) w klastrze
- **Docker Compose** uruchamia Postgres, API i UI serwowane przez nginx na jednym porcie
- **Helm chart** (`deploy/helm/dpd`) do instalacji w stylu production

Testy integracyjne trafiają w żywe API przez kind. Playwright obejmuje logowanie i flow deployments. Notatki projektowe w [ADR](../adr/).

### Dla kogo

Projekt do nauki i portfolio. Pokazuje Kubernetes szerzej niż `kubectl apply`: rollout, RBAC, streaming, observability i dostarczanie stacku przez Docker, CI i Helm. Licencja MIT. Możesz forkować, rozbudowywać lub użyć części we własnym UI.

Lens lub Kubernetes Dashboard wystarczą, jeśli potrzebujesz tylko ogólnego eksploratora klastra. Deployard idzie głębiej w wdrożenia, operacje i ścieżkę od Compose do klastra.

## Funkcje

- Lista wdrożeń, historia rewizji, rollout undo
- Status podów z live aktualizacjami, tail logów (SSE), konsola exec
- Import Docker Compose, rebuild, ładowanie obrazów do kind
- Services, endpoints, ingress, port-forward z UI
- Role i dostęp według sekcji (view / operate / manage)
- Metryki Prometheus dla procesu API
- 28 języków UI (i18next)

## Wymagania

- Docker Desktop (uruchomiony)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Sprawdzenie narzędzi:

```bash
make install-tools
make doctor
```

## Lokalna konfiguracja

Pełny stack: **klaster kind** (obciążenia demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Co robi każda komenda:

| Komenda | Działanie |
|---|---|
| `make cluster-up` | Tworzy klaster kind `dpd-local`, przełącza kubectl na `kind-dpd-local` |
| `make seed-demo` | Buduje obrazy demo-shop, ładuje do kind, stosuje `demo/demo-shop/kubernetes` |
| `make docker-up` | Buduje i uruchamia Postgres, API i web (nginx na porcie z `WEB_PORT`) |

Zatrzymanie lub reset:

```bash
make docker-down          # zatrzymaj stack Compose
make cluster-down         # usuń klaster kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wyczyść wolumen Postgres
```

## Lokalne URL

Domyślny port to **18480** (`WEB_PORT` w `.env`).

| URL | Opis |
|---|---|
| http://localhost:18480 | Web UI (logowanie) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Metryki Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort w kind, po `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (dostęp z hosta, z `.env`) |

Domyślni użytkownicy dev (tylko seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokalny development (bez Docker UI)

API i web działają na hoście. Postgres może zostać w Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Opis |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Przydatne komendy

```bash
make docker-logs          # logi API / web / Postgres
make lint                 # TypeScript lint (wszystkie pakiety)
make test                 # testy jednostkowe
make test-integration     # API + kind (API na :3000, wymagany Postgres)
make test-e2e             # Playwright (web na :5173)
make helm-lint            # lint Helm chart
make helm-install         # instalacja chart w kind (alternatywa dla docker-up)
make cluster-down         # usuń klaster kind
```

Rebuild po zmianach w kodzie:

```bash
make docker-up
```

## Production

Zobacz [docs/deploy.md](../deploy.md) o Helm, migracjach i `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Przykłady

| Ścieżka | Co to jest |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed do kind |
| `demo/weather-station` | Mały stack compose do ćwiczenia importu |
| `demo/todo-board` | Minimalny przykład frontend + API |
| `examples/kubernetes/` | kind config, przykłady RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Warstwa | Technologie |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (użytkownicy, role) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nigdy nie trafia bezpośrednio do klastra. API wymusza JWT auth z uprawnieniami według sekcji. Kubernetes ServiceAccount używa least-privilege RBAC (zobacz `examples/kubernetes/rbac.yaml`).

Szczegóły: [docs/architecture.md](../architecture.md) i [ADR](../adr/)

## Dokumentacja

| Dokument | Temat |
|---|---|
| [Architecture](../architecture.md) | Projekt i fazy |
| [Deploy](../deploy.md) | Helm, migracje, pierwszy admin |
| [Repository layout](../repository-structure.md) | Konwencje folderów |
| [Security](../../SECURITY.md) | Zgłoś podatność |
| [Changelog](../../CHANGELOG.md) | Notatki do wydań |

## Licencja

[MIT](../../LICENSE). Możesz używać, kopiować, modyfikować i rozpowszechniać ten projekt w dowolnym celu, także komercyjnym, o ile zachowasz informację o licencji.
