<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Plan de control pentru deployment-uri Kubernetes</strong>
</p>

<p align="center">
  Creat în <strong>scop educațional și pentru portofoliu</strong>.<br/>
  Liber de folosit, modificat și distribuit sub <a href="../../LICENSE">licența MIT</a>.
</p>

<p align="center">
  <sub>
    Explorează deployment-uri, rollback-uri, starea pod-urilor și logurile printr-o interfață web tipizată<br/>
    în loc să jonglezi cu kubectl, Compose și scripturi ad-hoc.
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
  <strong>Română</strong> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Panoul de deployment-uri Deployard" width="720" />
</p>

## Despre

Deployard este un plan de control pentru deployment-uri în Kubernetes. Interfața web și API-ul tipizat stau în fața clusterului, astfel încât browserele și scripturile nu accesează direct API server-ul.

### Problema

Lucrul cu clusterul înseamnă de obicei să sari între instrumente. `kubectl` pentru rollout-uri și starea pod-urilor. Docker Compose pentru build-uri locale. Scripturi shell pentru a încărca imagini în kind. Tab-uri separate pentru loguri și port-forward. Fiecare instrument are propria autentificare, format de ieșire și moduri de eșec. Echipele mici simt asta rapid. Cele mari o rezolvă cu dashboard-uri interne, adesea doar în citire sau legate de un singur mediu.

Deployard se concentrează pe ciclul de viață al deployment-ului: ce rulează, ce revizie este activă, sănătatea pod-urilor, rollback-uri, tail la loguri și aducerea unui proiect Compose în cluster fără o listă manuală de pași.

### Ce primești

| Zonă | Ce face Deployard |
|---|---|
| Deployments | Listă, detalii, istoric revizii, scalare, dezactivare, repornire, rollout undo |
| Pods | Stare live (watch), tail loguri prin SSE, consolă exec, browser de fișiere |
| Import | Parsare Compose, previzualizare manifeste K8s, build imagini, încărcare în kind, apply |
| Network | Services, endpoints, ingress, acces din browser prin port-forward controlat |
| Admin | Utilizatori, roluri, permisiuni pe secțiuni (view / operate / manage) |
| Ops | Health și readiness probes, metrici Prometheus, logging structurat |

Frontend-ul nu apelează niciodată Kubernetes API. Backend-ul NestJS deține kubeconfig-ul, rulează sesiuni JWT cu revocare token în PostgreSQL și expune doar operațiuni permise. Același model ca în spatele unui API de platformă intern.

### Cum este construit

Monorepo pnpm: React și Vite pe frontend, NestJS cu `@kubernetes/client-node` pe backend, DTO-uri partajate în `@dpd/shared`, OpenAPI din controllere.

Dezvoltarea locală este configurată ca un mediu real la scară mică:

- **kind** rulează workload-uri demo (`demo-shop`) în cluster
- **Docker Compose** rulează Postgres, API și UI servit prin nginx pe un singur port
- **Helm chart** (`deploy/helm/dpd`) pentru instalări în stil production

Testele de integrare lovesc un API live prin kind. Playwright acoperă login-ul și fluxul de deployments. Notele de design sunt în [ADR](../adr/).

### Pentru cine este

Proiectul este pentru învățare și portofoliu. Arată Kubernetes dincolo de `kubectl apply`: rollout-uri, RBAC, streaming, observability și livrarea stack-ului cu Docker, CI și Helm. Licență MIT. Poți face fork, extinde sau reutiliza părți în propriul UI.

Lens sau Kubernetes Dashboard sunt suficiente dacă ai nevoie doar de un explorator generic de cluster. Deployard merge mai adânc pe deployment-uri, operațiuni și calea de la Compose la cluster.

## Funcționalități

- Listă deployment-uri, istoric revizii, rollout undo
- Stare pod cu actualizări live, tail loguri (SSE), consolă exec
- Import Docker Compose, rebuild, încărcare imagini în kind
- Services, endpoints, ingress, port-forward din UI
- Roluri și acces pe secțiuni (view / operate / manage)
- Metrici Prometheus pentru procesul API
- 28 de limbi în UI (i18next)

## Cerințe prealabile

- Docker Desktop (pornit)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Verifică instrumentele:

```bash
make install-tools
make doctor
```

## Configurare locală

Stack complet: **cluster kind** (workload-uri demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Ce face fiecare pas:

| Comandă | Acțiune |
|---|---|
| `make cluster-up` | Creează clusterul kind `dpd-local`, comută kubectl pe `kind-dpd-local` |
| `make seed-demo` | Construiește imaginile demo-shop, le încarcă în kind, aplică `demo/demo-shop/kubernetes` |
| `make docker-up` | Construiește și pornește Postgres, API și web (nginx pe portul din `WEB_PORT`) |

Oprire sau resetare:

```bash
make docker-down          # oprește stack-ul Compose
make cluster-down         # șterge clusterul kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # șterge volumul Postgres
```

## URL-uri locale

Portul implicit este **18480** (`WEB_PORT` în `.env`).

| URL | Ce este |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Metrici Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort în kind, după `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (acces de pe host, din `.env`) |

Utilizatori dev impliciți (doar seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Dezvoltare locală (fără Docker UI)

API și web rulează pe host. Postgres poate rămâne în Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Ce este |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Comenzi utile

```bash
make docker-logs          # urmărește logurile API / web / Postgres
make lint                 # TypeScript lint (toate pachetele)
make test                 # teste unitare
make test-integration     # API + kind (API pe :3000, Postgres necesar)
make test-e2e             # Playwright (web pe :5173)
make helm-lint            # lint Helm chart
make helm-install         # instalează chart în kind (alternativă la docker-up)
make cluster-down         # elimină clusterul kind
```

Reconstruire după modificări de cod:

```bash
make docker-up
```

## Production

Vezi [docs/deploy.md](../deploy.md) pentru Helm, migrări și `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Exemple

| Cale | Ce este |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed în kind |
| `demo/weather-station` | Stack compose mic pentru practică de import |
| `demo/todo-board` | Exemplu minimal frontend + API |
| `examples/kubernetes/` | kind config, mostre RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Strat | Tehnologie |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (utilizatori, roluri) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arhitectură

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend-ul nu apelează niciodată clusterul direct. API-ul aplică autentificare JWT cu permisiuni pe secțiuni. ServiceAccount-ul Kubernetes folosește RBAC cu privilegii minime (vezi `examples/kubernetes/rbac.yaml`).

Detalii: [docs/architecture.md](../architecture.md) și [ADR](../adr/)

## Documentație

| Document | Subiect |
|---|---|
| [Architecture](../architecture.md) | Design și faze |
| [Deploy](../deploy.md) | Helm, migrări, primul admin |
| [Repository layout](../repository-structure.md) | Convenții de foldere |
| [Security](../../SECURITY.md) | Raportează o vulnerabilitate |
| [Changelog](../../CHANGELOG.md) | Note de lansare |

## Licență

[MIT](../../LICENSE). Poți folosi, copia, modifica și distribui acest proiect în orice scop, inclusiv comercial, atâta timp cât mențiunea de licență este păstrată.
