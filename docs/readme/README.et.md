<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes deployment control plane</strong>
</p>

<p align="center">
  Loodud <strong>hariduslikel eesmärgil ja portfoolio jaoks</strong>.<br/>
  Vaba kasutamine, muutmine ja jagamine <a href="../../LICENSE">MIT License</a> alusel.
</p>

<p align="center">
  <sub>
    Deployment, rollback, pod olek ja logid tüüpitud web UI kaudu<br/>
    kubectl, Compose ja ühekordsete skriptide vahel hüppamise asemel.
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
  <strong>Eesti</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deploymentide töölaud" width="720" />
</p>

## Projekti kohta

Deployard on Kubernetes deployment control plane. Web UI ja tüüpitud API on klastri ees, nii et brauserid ja skriptid ei pöördu API serveri poole otse.

### Probleem

Klastritöö tähendab tavaliselt hüppamist tööriistade vahel. `kubectl` rolloutide ja pod oleku jaoks. Docker Compose kohalike buildide jaoks. Shell skriptid piltide kindi laadimiseks. Eraldi vahelehed logide ja port-forward jaoks. Igal tööriistal on oma autentimine, väljundiformaat ja rikkeviisid. Väikesed tiimid tunnevad seda kiiresti. Suuremad lappavad seda sisemiste dashboardidega, mis on tihti ainult lugemiseks või seotud ühe keskkonnaga.

Deployard keskendub deployment elutsüklile: mis töötab, milline revision on live, pod tervis, rollback, log tailing ja Compose projekti klastrisse viimine ilma käsitsi checklistita.

### Mida saad

| Valdkond | Mida Deployard teeb |
|---|---|
| Deployments | Nimekiri, detailid, revisionide ajalugu, scale, disable, restart, rollout undo |
| Pods | Live olek (watch), log tail SSE kaudu, exec konsool, file browser |
| Import | Compose parse, K8s manifestide eelvaade, piltide build, load kindi, apply |
| Network | Services, endpoints, ingress, brauseri ligipääs kontrollitud port-forward kaudu |
| Admin | Kasutajad, rollid, sektsioonipõhised õigused (view / operate / manage) |
| Ops | Health ja readiness probes, Prometheus metrics, structured logging |

Frontend ei kutsu kunagi Kubernetes API-d. NestJS backend hoiab kubeconfigi, JWT sessioone tokenite tühistamisega PostgreSQL-is ja avaldab ainult lubatud operatsioone. Sama muster nagu sisemise platform API taga.

### Kuidas see on ehitatud

pnpm monorepo: React ja Vite frontendis, NestJS koos `@kubernetes/client-node` backendis, jagatud DTO-d `@dpd/shared`-is, OpenAPI controlleritest.

Kohalik arendus on seadistatud nagu väike päris keskkond:

- **kind** käivitab demo workloads (`demo-shop`) klastris
- **Docker Compose** käivitab Postgres, API ja UI nginx kaudu ühel pordil
- **Helm chart** (`deploy/helm/dpd`) production stiilis installide jaoks

Integratsioonitestid löövad live API vastu kindis. Playwright katab login ja deployments flow. Disainimärkmed on [ADRs](../adr/) all.

### Kellele see on

Projekt on õppimiseks ja portfoolio jaoks. Näitab Kubernetesi kaugemale `kubectl apply`-st: rollout, RBAC, streaming, observability ja stacki tarnimist Docker, CI ja Helm kaudu. MIT license. Fork, laienda või kasuta osi oma UI-s.

Lens või Kubernetes Dashboard piisab, kui vajad ainult üldist cluster explorerit. Deployard läheb sügavamale deploymentides, operatsioonides ja teel Compose-st klastrisse.

## Võimalused

- Deployment nimekiri, revisionide ajalugu, rollout undo
- Pod olek live uuendustega, log tail (SSE), exec konsool
- Docker Compose import, rebuild, kind image load
- Services, endpoints, ingress, port-forward UI-st
- Rollid ja sektsioonipõhine ligipääs (view / operate / manage)
- Prometheus metrics API protsessile
- 28 UI keelt (i18next)

## Eeldused

- Docker Desktop (töötab)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Tööriistade kontroll:

```bash
make install-tools
make doctor
```

## Kohalik seadistus

Täielik stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Mida iga samm teeb:

| Käsk | Tegevus |
|---|---|
| `make cluster-up` | Loob kind cluster `dpd-local`, lülitab kubectl `kind-dpd-local` peale |
| `make seed-demo` | Buildib demo-shop pildid, laadib kindi, apply `demo/demo-shop/kubernetes` |
| `make docker-up` | Buildib ja käivitab Postgres, API ja web (nginx pordil `WEB_PORT`) |

Peatamine või reset:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Kohalikud URL-id

Vaikimisi port on **18480** (`WEB_PORT` failis `.env`).

| URL | Mis |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort kindis, pärast `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host access, failist `.env`) |

Vaikimisi dev kasutajad (ainult seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Kohalik arendus (ilma Docker UI-ta)

API ja web jooksevad hostil. Postgres võib jääda Dockerisse.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Mis |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Kasulikud käsud

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

Rebuild pärast koodimuudatusi:

```bash
make docker-up
```

## Production

Vaata [docs/deploy.md](../deploy.md) Helm, migrations ja `create-admin` kohta.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Näited

| Tee | Mis see on |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed kindi |
| `demo/weather-station` | Väike compose stack import harjutamiseks |
| `demo/todo-board` | Minimaalne frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Kiht | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arhitektuur

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend ei pöördu klastri poole otse. API rakendab JWT auth sektsioonipõhiste õigustega. Kubernetes ServiceAccount kasutab least-privilege RBAC (vaata `examples/kubernetes/rbac.yaml`).

Detailid: [docs/architecture.md](../architecture.md) ja [ADRs](../adr/)

## Dokumentatsioon

| Doc | Teema |
|---|---|
| [Architecture](../architecture.md) | Design ja faasid |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Litsents

[MIT](../../LICENSE). Võid projekti kasutada, kopeerida, muuta ja levitada mis tahes eesmärgil, sealhulgas ärilisel otstarbel, kui litsentsiteade säilib.
