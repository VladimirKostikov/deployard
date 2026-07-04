<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes diegimo valdymo plokštuma</strong>
</p>

<p align="center">
  Sukurta <strong>mokymo ir portfelio tikslais</strong>.<br/>
  Laisvai naudokite, keiskite ir dalinkitės pagal <a href="../../LICENSE">MIT licenciją</a>.
</p>

<p align="center">
  <sub>
    Diegimus, atšaukimus, pod būseną ir žurnalus per tipizuotą web UI<br/>
    vietoj nuolatinio kubectl, Compose ir atskirų skriptų derinimo.
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
  <strong>Lietuvių</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard diegimų skydelis" width="720" />
</p>

## Apie

Deployard yra Kubernetes diegimo valdymo plokštuma. Web UI ir tipizuotas API stovi prieš klasterį, todėl naršyklės ir skriptai niekada tiesiogiai nebekreipiasi į API serverį.

### Problema

Darbas su klasteriu dažniausiai išsibarstęs per įrankius. `kubectl` rollout ir pod būsenai. Docker Compose vietinėms build operacijoms. Shell skriptai, kad įkeltumėte vaizdus į kind. Atskiri skirtukai žurnalams ir port-forward. Kiekvienas įrankis turi savo autentifikaciją, išvesties formatą ir tipines klaidas. Mažos komandos tai pajunta greitai. Didesnės uždengia spragas vidiniais skydeliais, kurie dažnai tik skaitymui ar pririšti prie vienos aplinkos.

Deployard sutelkia dėmesį į diegimo gyvavimo ciklą: kas veikia, kuri revizija aktyvi, pod sveikata, atšaukimai, žurnalų tail ir Compose projekto perkėlimas į klasterį be rankinio kontrolinio sąrašo.

### Ką gaunate

| Sritis | Ką daro Deployard |
|---|---|
| Deployments | Sąrašas, detalės, revizijų istorija, mastelis, išjungimas, perkrovimas, rollout undo |
| Pods | Būsena realiu laiku (watch), žurnalų tail per SSE, exec konsolė, failų naršyklė |
| Import | Compose analizė, K8s manifestų peržiūra, vaizdų build, įkėlimas į kind, apply |
| Network | Services, endpoints, ingress, prieiga naršyklėje per kontroliuojamą port-forward |
| Admin | Vartotojai, rolės, teisės pagal sekcijas (view / operate / manage) |
| Ops | Health ir readiness probes, Prometheus metrikos, struktūruotas žurnalavimas |

Frontend niekada nebekreipiasi į Kubernetes API. NestJS backend laiko kubeconfig, vykdo JWT sesijas su tokenų atšaukimu PostgreSQL ir atiduoda tik leidžiamas operacijas. Tas pats modelis kaip vidiniame platform API.

### Kaip sukurta

pnpm monorepo: React ir Vite frontend'e, NestJS su `@kubernetes/client-node` backend'e, bendri DTO `@dpd/shared`, OpenAPI iš controller'ių.

Vietinė kūrimo aplinka paruošta kaip maža reali aplinka:

- **kind** paleidžia demo apkrovas (`demo-shop`) klasteryje
- **Docker Compose** paleidžia Postgres, API ir nginx aptarnaujamą UI viename porte
- **Helm chart** (`deploy/helm/dpd`) production stiliaus diegimui

Integraciniai testai kreipiasi į gyvą API per kind. Playwright apima prisijungimą ir deployments srautą. Dizaino sprendimai [ADR](../adr/).

### Kam skirta

Projektas skirtas mokymuisi ir portfeliui. Rodo Kubernetes plačiau nei `kubectl apply`: rollout, RBAC, srautinį perdavimą, observability ir stack pristatymą per Docker, CI ir Helm. MIT licencija. Galite fork'inti, plėsti ar panaudoti dalis savo UI.

Lens ar Kubernetes Dashboard pakanka, jei reikia tik bendro klasterio naršymo. Deployard eina giliau į diegimus, operacijas ir kelią nuo Compose iki klasterio.

## Funkcijos

- Diegimų sąrašas, revizijų istorija, rollout undo
- Pod būsena su live atnaujinimais, žurnalų tail (SSE), exec konsolė
- Docker Compose importas, perbuild, kind vaizdų įkėlimas
- Services, endpoints, ingress, port-forward iš UI
- Rolės ir prieiga pagal sekcijas (view / operate / manage)
- Prometheus metrikos API procesui
- 28 UI kalbos (i18next)

## Reikalavimai

- Docker Desktop (veikiantis)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Įrankių patikra:

```bash
make install-tools
make doctor
```

## Vietinis paleidimas

Pilnas stack: **kind klasteris** (demo apkrovos) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Ką daro kiekviena komanda:

| Komanda | Veiksmas |
|---|---|
| `make cluster-up` | Sukuria kind klasterį `dpd-local`, perjungia kubectl į `kind-dpd-local` |
| `make seed-demo` | Surenka demo-shop vaizdus, įkelia į kind, pritaiko `demo/demo-shop/kubernetes` |
| `make docker-up` | Surenka ir paleidžia Postgres, API ir web (nginx porte iš `WEB_PORT`) |

Sustabdymas ar atstatymas:

```bash
make docker-down          # sustabdyti Compose stack
make cluster-down         # ištrinti kind klasterį
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # išvalyti Postgres tomą
```

## Vietiniai URL

Numatytasis portas **18480** (`WEB_PORT` faile `.env`).

| URL | Paskirtis |
|---|---|
| http://localhost:18480 | Web UI (prisijungimas) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrikos (API) |
| http://localhost:30081 | demo-shop web (NodePort kind, po `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (prieiga iš host, iš `.env`) |

Numatyti dev vartotojai (tik seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Vietinis kūrimas (be Docker UI)

API ir web veikia host'e. Postgres gali likti Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Paskirtis |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Naudingos komandos

```bash
make docker-logs          # API / web / Postgres žurnalai
make lint                 # TypeScript lint (visi paketai)
make test                 # unit testai
make test-integration     # API + kind (API :3000, reikia Postgres)
make test-e2e             # Playwright (web :5173)
make helm-lint            # lint Helm chart
make helm-install         # chart diegimas į kind (alternatyva docker-up)
make cluster-down         # pašalinti kind klasterį
```

Perbuild po kodo pakeitimų:

```bash
make docker-up
```

## Production

Žr. [docs/deploy.md](../deploy.md) dėl Helm, migracijų ir `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Pavyzdžiai

| Kelias | Kas tai |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed į kind |
| `demo/weather-station` | Mažas compose stack importo praktikai |
| `demo/todo-board` | Minimalus frontend + API pavyzdys |
| `examples/kubernetes/` | kind config, RBAC pavyzdžiai |

```bash
make demo-load
make seed-demo
```

## Stack

| Sluoksnis | Technologijos |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (vartotojai, rolės) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektūra

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend niekada tiesiogiai nebekreipiasi į klasterį. API vykdo JWT autentifikaciją su teisėmis pagal sekcijas. Kubernetes ServiceAccount naudoja least-privilege RBAC (žr. `examples/kubernetes/rbac.yaml`).

Daugiau: [docs/architecture.md](../architecture.md) ir [ADR](../adr/)

## Dokumentacija

| Dokumentas | Tema |
|---|---|
| [Architecture](../architecture.md) | Dizainas ir etapai |
| [Deploy](../deploy.md) | Helm, migracijos, pirmas admin |
| [Repository layout](../repository-structure.md) | Aplanko konvencijos |
| [Security](../../SECURITY.md) | Pranešti apie pažeidžiamumą |
| [Changelog](../../CHANGELOG.md) | Release pastabos |

## Licencija

[MIT](../../LICENSE). Galite naudoti, kopijuoti, keisti ir platinti projektą bet kokiam tikslui, įskaitant komercinį, jei išsaugomas licencijos tekstas.
