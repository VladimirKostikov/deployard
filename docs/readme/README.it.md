<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Piano di controllo dei deployment Kubernetes</strong>
</p>

<p align="center">
  Creato per <strong>scopi didattici e portfolio</strong>.<br/>
  Libero da usare, modificare e condividere sotto la <a href="../../LICENSE">licenza MIT</a>.
</p>

<p align="center">
  <sub>
    Esplora deployment, rollback, stato dei pod e log tramite una web UI tipizzata<br/>
    invece di destreggiarti tra kubectl, Compose e script una tantum.
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
  <strong>Italiano</strong> ·
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
  <img src="../assets/screenshot.png" alt="Dashboard deployment Deployard" width="720" />
</p>

## Informazioni

Deployard è un piano di controllo dei deployment per Kubernetes. La web UI e l'API tipizzata stanno davanti al cluster: browser e script non raggiungono mai direttamente l'API server.

### Il problema

Lavorare sul cluster di solito significa saltare tra strumenti. `kubectl` per rollout e stato dei pod. Docker Compose per build locali. Script shell per caricare immagini in kind. Tab separati per log e port-forward. Ogni strumento ha la propria autenticazione, formato di output e modalità di errore. I team piccoli lo sentono subito. Quelli grandi lo rattoppano con dashboard interne spesso in sola lettura o legate a un solo ambiente.

Deployard si concentra sul ciclo di vita del deployment: cosa è in esecuzione, quale revisione è attiva, salute dei pod, rollback, tail dei log e portare un progetto Compose nel cluster senza checklist manuale.

### Cosa ottieni

| Area | Cosa fa Deployard |
|---|---|
| Deployments | Elenco, dettaglio, cronologia revisioni, scale, disabilitazione, restart, rollout undo |
| Pods | Stato live (watch), tail log via SSE, console exec, file browser |
| Import | Parsing Compose, anteprima manifest K8s, build immagini, caricamento in kind, apply |
| Network | Services, endpoints, ingress, accesso dal browser via port-forward controllato |
| Admin | Utenti, ruoli, permessi per sezione (view / operate / manage) |
| Ops | Health e readiness probe, metriche Prometheus, logging strutturato |

Il frontend non chiama mai l'API Kubernetes. Il backend NestJS tiene il kubeconfig, gestisce sessioni JWT con revoca token in PostgreSQL ed espone solo operazioni consentite. Stesso schema di un'API piattaforma interna.

### Come è costruito

Monorepo pnpm: React e Vite sul frontend, NestJS con `@kubernetes/client-node` sul backend, DTO condivisi in `@dpd/shared`, OpenAPI dai controller.

Lo sviluppo locale è impostato come un piccolo ambiente reale:

- **kind** esegue carichi demo (`demo-shop`) nel cluster
- **Docker Compose** avvia Postgres, API e UI servita da nginx su una porta
- **Helm chart** (`deploy/helm/dpd`) per installazioni in stile production

I test di integrazione colpiscono un'API live tramite kind. Playwright copre login e flusso deployments. Le note di design sono negli [ADR](../adr/).

### Per chi è

Il progetto è per apprendimento e portfolio. Mostra Kubernetes oltre `kubectl apply`: rollout, RBAC, streaming, observability e consegna dello stack con Docker, CI e Helm. Licenza MIT. Fai fork, estendi o riusa parti nella tua UI.

Lens o Kubernetes Dashboard bastano se ti serve solo un esploratore generico del cluster. Deployard va più a fondo su deployment, operazioni e il percorso da Compose al cluster.

## Funzionalità

- Elenco deployment, cronologia revisioni, rollout undo
- Stato pod con aggiornamenti live, tail log (SSE), console exec
- Import Docker Compose, rebuild, caricamento immagini in kind
- Services, endpoints, ingress, port-forward dall'UI
- Ruoli e accesso per sezione (view / operate / manage)
- Metriche Prometheus per il processo API
- 28 lingue UI (i18next)

## Prerequisiti

- Docker Desktop (in esecuzione)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Verifica strumenti:

```bash
make install-tools
make doctor
```

## Setup locale

Stack completo: **cluster kind** (carichi demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Cosa fa ogni passo:

| Comando | Azione |
|---|---|
| `make cluster-up` | Crea il cluster kind `dpd-local`, passa kubectl a `kind-dpd-local` |
| `make seed-demo` | Builda immagini demo-shop, le carica in kind, applica `demo/demo-shop/kubernetes` |
| `make docker-up` | Builda e avvia Postgres, API e web (nginx sulla porta da `WEB_PORT`) |

Stop o reset:

```bash
make docker-down          # ferma lo stack Compose
make cluster-down         # elimina il cluster kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # cancella volume Postgres
```

## URL locali

La porta predefinita è **18480** (`WEB_PORT` in `.env`).

| URL | Cosa |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Metriche Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort in kind, dopo `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (accesso host, da `.env`) |

Utenti dev predefiniti (solo seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Sviluppo locale (senza Docker UI)

API e web girano sull'host. Postgres può restare in Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Cosa |
|---|---|
| http://localhost:5173 | Web UI (server dev Vite) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Comandi utili

```bash
make docker-logs          # segui log API / web / Postgres
make lint                 # lint TypeScript (tutti i package)
make test                 # test unitari
make test-integration     # API + kind (API su :3000, Postgres richiesto)
make test-e2e             # Playwright (web su :5173)
make helm-lint            # lint chart Helm
make helm-install         # installa chart in kind (alternativa a docker-up)
make cluster-down         # rimuovi cluster kind
```

Rebuild dopo modifiche al codice:

```bash
make docker-up
```

## Production

Vedi [docs/deploy.md](../deploy.md) per Helm, migrazioni e `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Esempi

| Percorso | Cosa è |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed in kind |
| `demo/weather-station` | Piccolo stack compose per esercitarsi all'import |
| `demo/todo-board` | Esempio minimale frontend + API |
| `examples/kubernetes/` | Config kind, campioni RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Livello | Tecnologia |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (utenti, ruoli) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architettura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Il frontend non chiama mai il cluster direttamente. L'API applica auth JWT con permessi per sezione. Il ServiceAccount Kubernetes usa RBAC least-privilege (vedi `examples/kubernetes/rbac.yaml`).

Dettagli: [docs/architecture.md](../architecture.md) e [ADR](../adr/)

## Documentazione

| Documento | Argomento |
|---|---|
| [Architecture](../architecture.md) | Design e fasi |
| [Deploy](../deploy.md) | Helm, migrazioni, primo admin |
| [Repository layout](../repository-structure.md) | Convenzioni cartelle |
| [Security](../../SECURITY.md) | Segnala una vulnerabilità |
| [Changelog](../../CHANGELOG.md) | Note di rilascio |

## Licenza

[MIT](../../LICENSE). Puoi usare, copiare, modificare e distribuire questo progetto per qualsiasi scopo, incluso l'uso commerciale, purché si conservi l'avviso di licenza.
