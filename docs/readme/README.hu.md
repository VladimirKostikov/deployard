<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes deployment vezérlősík</strong>
</p>

<p align="center">
  <strong>Oktatási és portfólió</strong> célokra készült.<br/>
  Szabadon használható, módosítható és megosztható az <a href="../../LICENSE">MIT licenc</a> alatt.
</p>

<p align="center">
  <sub>
    Deploymentek, rollbackok, pod állapot és logok egy tipizált webes felületen<br/>
    kubectl, Compose és egyszeri szkriptek helyett.
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
  <strong>Magyar</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deployment irányítópult" width="720" />
</p>

## A projektről

A Deployard egy deployment vezérlősík Kuberneteshez. A webes felület és a tipizált API a klaszter előtt áll: a böngészők és szkriptek soha nem érik el közvetlenül az API servert.

### A probléma

A klaszteren való munka általában eszközök közötti ugrálást jelent. `kubectl` rolloutokhoz és pod állapothoz. Docker Compose helyi buildhez. Shell szkriptek képek kind-ba töltéséhez. Külön lapok logokhoz és port-forwardokhoz. Minden eszköznek saját authja, kimeneti formátuma és hibamódja van. A kis csapatok gyorsan érzik. A nagyobbak belső irányítópultokkal foltozzák, amelyek gyakran csak olvashatók vagy egy környezethez kötöttek.

A Deployard a deployment életciklusára fókuszál: mi fut, melyik revízió aktív, pod egészség, rollbackok, log tail és Compose projekt klaszterbe vitele manuális checklist nélkül.

### Mit kapsz

| Terület | Mit csinál a Deployard |
|---|---|
| Deployments | Lista, részletek, revíziótörténet, skálázás, letiltás, újraindítás, rollout undo |
| Pods | Élő állapot (watch), log tail SSE-n, exec konzol, fájlböngésző |
| Import | Compose feldolgozás, K8s manifest előnézet, kép build, kind-ba töltés, apply |
| Network | Services, endpoints, ingress, böngészős hozzáférés kontrollált port-forwardon |
| Admin | Felhasználók, szerepkörök, szekció alapú jogosultságok (view / operate / manage) |
| Ops | Health és readiness probe, Prometheus metrikák, strukturált naplózás |

A frontend soha nem hívja a Kubernetes API-t. A NestJS backend tartja a kubeconfigot, JWT sessionöket futtat token visszavonással PostgreSQL-ben, és csak engedélyezett műveleteket ad ki. Ugyanaz a minta, mint egy belső platform API mögött.

### Hogyan épül fel

pnpm monorepo: React és Vite a frontenden, NestJS `@kubernetes/client-node`-dal a backenden, közös DTO-k `@dpd/shared`-ben, OpenAPI a controllerekből.

A helyi fejlesztés egy kis valós környezetként van beállítva:

- **kind** futtatja a demo terheléseket (`demo-shop`) a klaszterben
- **Docker Compose** Postgreset, API-t és nginx-en szolgált UI-t egy porton
- **Helm chart** (`deploy/helm/dpd`) production stílusú telepítéshez

Az integrációs tesztek élő API-t érnek el kind-on keresztül. A Playwright a bejelentkezést és a deployments folyamatot fedi. A tervezési jegyzetek az [ADR-ekben](../adr/) vannak.

### Kinek szól

A projekt tanuláshoz és portfólióhoz készült. Kubernetes `kubectl apply` felett: rolloutok, RBAC, streaming, observability és a stack szállítása Dockerrel, CI-vel és Helmmel. MIT licenc. Forkold, bővítsd vagy használd újra részeket a saját UI-dban.

A Lens vagy a Kubernetes Dashboard elég, ha csak általános klaszterböngésző kell. A Deployard mélyebben megy a deploymentekben, műveletekben és a Compose-ból klaszterbe vezető úton.

## Funkciók

- Deployment lista, revíziótörténet, rollout undo
- Pod állapot élő frissítéssel, log tail (SSE), exec konzol
- Docker Compose import, rebuild, kind kép betöltés
- Services, endpoints, ingress, port-forward a UI-ból
- Szerepkörök és szekció alapú hozzáférés (view / operate / manage)
- Prometheus metrikák az API folyamathoz
- 28 UI nyelv (i18next)

## Előfeltételek

- Docker Desktop (fut)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Eszközök ellenőrzése:

```bash
make install-tools
make doctor
```

## Helyi telepítés

Teljes stack: **kind klaszter** (demo terhelések) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Mit csinál minden lépés:

| Parancs | Művelet |
|---|---|
| `make cluster-up` | Létrehozza a `dpd-local` kind klasztert, kubectl kontextust `kind-dpd-local`-ra vált |
| `make seed-demo` | Buildeli a demo-shop képeket, kind-ba tölti, alkalmazza a `demo/demo-shop/kubernetes`-t |
| `make docker-up` | Buildeli és elindítja a Postgreset, API-t és webet (nginx a `WEB_PORT` porton) |

Leállítás vagy reset:

```bash
make docker-down          # Compose stack leállítása
make cluster-down         # kind klaszter törlése
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # Postgres volume törlése
```

## Helyi URL-ek

Az alapértelmezett port **18480** (`WEB_PORT` a `.env`-ben).

| URL | Mi |
|---|---|
| http://localhost:18480 | Web UI (bejelentkezés) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrikák (API) |
| http://localhost:30081 | demo-shop web (NodePort kind-ban, `make seed-demo` után) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host hozzáférés, a `.env`-ből) |

Alapértelmezett dev felhasználók (csak seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Helyi fejlesztés (Docker UI nélkül)

API és web a hoston fut. A Postgres maradhat Dockerben.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Mi |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Hasznos parancsok

```bash
make docker-logs          # API / web / Postgres logok követése
make lint                 # TypeScript lint (minden csomag)
make test                 # unit tesztek
make test-integration     # API + kind (API :3000, Postgres kell)
make test-e2e             # Playwright (web :5173)
make helm-lint            # Helm chart lint
make helm-install         # chart telepítése kind-ba (docker-up alternatíva)
make cluster-down         # kind klaszter eltávolítása
```

Újraépítés kódváltozás után:

```bash
make docker-up
```

## Production

Lásd [docs/deploy.md](../deploy.md) a Helm, migrációk és `create-admin` témában.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Példák

| Útvonal | Mi ez |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed kind-ba |
| `demo/weather-station` | Kis compose stack import gyakorláshoz |
| `demo/todo-board` | Minimális frontend + API minta |
| `examples/kubernetes/` | kind config, RBAC minták |

```bash
make demo-load
make seed-demo
```

## Stack

| Réteg | Technológia |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (felhasználók, szerepkörök) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architektúra

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

A frontend soha nem hívja közvetlenül a klasztert. Az API JWT authot és szekció alapú jogosultságokat érvényesít. A Kubernetes ServiceAccount least-privilege RBAC-ot használ (lásd `examples/kubernetes/rbac.yaml`).

Részletek: [docs/architecture.md](../architecture.md) és [ADR-ek](../adr/)

## Dokumentáció

| Dokumentum | Téma |
|---|---|
| [Architecture](../architecture.md) | Tervezés és fázisok |
| [Deploy](../deploy.md) | Helm, migrációk, első admin |
| [Repository layout](../repository-structure.md) | Mappa konvenciók |
| [Security](../../SECURITY.md) | Sebezhetőség jelentése |
| [Changelog](../../CHANGELOG.md) | Kiadási jegyzetek |

## Licenc

[MIT](../../LICENSE). A projektet bármilyen célra használhatod, másolhatod, módosíthatod és terjesztheted, beleértve a kereskedelmi használatot is, ha megőrzöd a licenc szövegét.
