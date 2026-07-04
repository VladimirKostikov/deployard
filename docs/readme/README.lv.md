<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes izvietošanas vadības plakne</strong>
</p>

<p align="center">
  Izveidots <strong>mācību un portfolio mērķiem</strong>.<br/>
  Brīvi lietojams, maināms un izplatāms saskaņā ar <a href="../../LICENSE">MIT licenci</a>.
</p>

<p align="center">
  <sub>
    Izvietojumi, atcelšana, pod statuss un žurnāli tipizētā web UI<br/>
    nevis pastāvīga kubectl, Compose un atsevišķu skriptu kombinēšana.
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
  <strong>Latviešu</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard izvietojumu panelis" width="720" />
</p>

## Par projektu

Deployard ir Kubernetes izvietošanas vadības plakne. Web UI un tipizēts API stāv pirms klastera, tāpēc pārlūki un skripti nekad nesazinās ar API serveri tieši.

### Problēma

Darbs ar klasteri parasti ir sadalīts starp rīkiem. `kubectl` rollout un pod statusam. Docker Compose lokālām build operācijām. Shell skripti, lai ielādētu attēlus kind. Atsevišķas cilnes žurnāliem un port-forward. Katram rīkam ir sava autentifikācija, izvades formāts un tipiskās kļūdas. Mazas komandas to jūt ātri. Lielākas aizpilda robus ar iekšējiem paneļiem, kas bieži ir tikai lasāmi vai piesaistīti vienai videi.

Deployard fokusējas uz izvietošanas dzīves ciklu: kas darbojas, kura revīzija ir aktīva, pod veselība, atcelšana, žurnālu tail un Compose projekta ievietošana klasterī bez manuāla kontrolsaraksta.

### Ko jūs iegūstat

| Joma | Ko dara Deployard |
|---|---|
| Deployments | Saraksts, detaļas, revīziju vēsture, mērogošana, atslēgšana, restart, rollout undo |
| Pods | Statuss reāllaikā (watch), žurnālu tail caur SSE, exec konsole, failu pārlūks |
| Import | Compose parsēšana, K8s manifestu priekšskatījums, attēlu build, ielāde kind, apply |
| Network | Services, endpoints, ingress, piekļuve pārlūkā caur kontrolētu port-forward |
| Admin | Lietotāji, lomas, tiesības pa sadaļām (view / operate / manage) |
| Ops | Health un readiness probes, Prometheus metrikas, strukturēta žurnalēšana |

Frontend nekad neizsauc Kubernetes API. NestJS backend glabā kubeconfig, vada JWT sesijas ar tokenu atsaukšanu PostgreSQL un atgriež tikai atļautās operācijas. Tas pats modelis kā iekšējā platform API.

### Kā tas ir uzbūvēts

pnpm monorepo: React un Vite frontendā, NestJS ar `@kubernetes/client-node` backendā, kopīgi DTO `@dpd/shared`, OpenAPI no controlleriem.

Lokālā izstrāde ir iestatīta kā maza reāla vide:

- **kind** palaiž demo slodzes (`demo-shop`) klasterī
- **Docker Compose** palaiž Postgres, API un nginx apkalpotu UI vienā portā
- **Helm chart** (`deploy/helm/dpd`) production stila instalācijai

Integrācijas testi sit uz dzīvu API caur kind. Playwright aptver pieteikšanos un deployments plūsmu. Dizaina piezīmes [ADR](../adr/).

### Kam tas ir domāts

Projekts ir mācībām un portfolio. Parāda Kubernetes plašāk nekā `kubectl apply`: rollout, RBAC, straumēšanu, observability un stack piegādi ar Docker, CI un Helm. MIT licence. Varat forkot, paplašināt vai izmantot daļas savā UI.

Lens vai Kubernetes Dashboard pietiek, ja vajag tikai vispārīgu klastera pārlūku. Deployard iet dziļāk izvietojumos, operācijās un ceļā no Compose uz klasteri.

## Funkcijas

- Izvietojumu saraksts, revīziju vēsture, rollout undo
- Pod statuss ar live atjauninājumiem, žurnālu tail (SSE), exec konsole
- Docker Compose imports, pārbūve, kind attēlu ielāde
- Services, endpoints, ingress, port-forward no UI
- Lomas un piekļuve pa sadaļām (view / operate / manage)
- Prometheus metrikas API procesam
- 28 UI valodas (i18next)

## Priekšnosacījumi

- Docker Desktop (darbojas)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Rīku pārbaude:

```bash
make install-tools
make doctor
```

## Lokālā iestatīšana

Pilns stack: **kind klasteris** (demo slodzes) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Ko dara katra komanda:

| Komanda | Darbība |
|---|---|
| `make cluster-up` | Izveido kind klasteri `dpd-local`, pārslēdz kubectl uz `kind-dpd-local` |
| `make seed-demo` | Būvē demo-shop attēlus, ielādē kind, piemēro `demo/demo-shop/kubernetes` |
| `make docker-up` | Būvē un palaiž Postgres, API un web (nginx portā no `WEB_PORT`) |

Apturēšana vai atiestatīšana:

```bash
make docker-down          # apturēt Compose stack
make cluster-down         # dzēst kind klasteri
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # notīrīt Postgres tomu
```

## Lokālie URL

Noklusējuma ports ir **18480** (`WEB_PORT` failā `.env`).

| URL | Mērķis |
|---|---|
| http://localhost:18480 | Web UI (pieteikšanās) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrikas (API) |
| http://localhost:30081 | demo-shop web (NodePort kind, pēc `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (piekļuve no host, no `.env`) |

Noklusējuma dev lietotāji (tikai seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokālā izstrāde (bez Docker UI)

API un web darbojas uz host. Postgres var palikt Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Mērķis |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Noderīgas komandas

```bash
make docker-logs          # API / web / Postgres žurnāli
make lint                 # TypeScript lint (visi pakotnes)
make test                 # unit testi
make test-integration     # API + kind (API :3000, vajag Postgres)
make test-e2e             # Playwright (web :5173)
make helm-lint            # lint Helm chart
make helm-install         # chart instalācija kind (alternatīva docker-up)
make cluster-down         # noņemt kind klasteri
```

Pārbūve pēc koda izmaiņām:

```bash
make docker-up
```

## Production

Skat. [docs/deploy.md](../deploy.md) par Helm, migrācijām un `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Piemēri

| Ceļš | Kas tas ir |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed kind |
| `demo/weather-station` | Mazs compose stack importa praksei |
| `demo/todo-board` | Minimāls frontend + API paraugs |
| `examples/kubernetes/` | kind config, RBAC paraugi |

```bash
make demo-load
make seed-demo
```

## Stack

| Slānis | Tehnoloģijas |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (lietotāji, lomas) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arhitektūra

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nekad nesazinās ar klasteri tieši. API piemēro JWT autentifikāciju ar tiesībām pa sadaļām. Kubernetes ServiceAccount izmanto least-privilege RBAC (skat. `examples/kubernetes/rbac.yaml`).

Sīkāk: [docs/architecture.md](../architecture.md) un [ADR](../adr/)

## Dokumentācija

| Dokuments | Tēma |
|---|---|
| [Architecture](../architecture.md) | Dizains un fāzes |
| [Deploy](../deploy.md) | Helm, migrācijas, pirmais admin |
| [Repository layout](../repository-structure.md) | Mapju konvencijas |
| [Security](../../SECURITY.md) | Ziņot par ievainojamību |
| [Changelog](../../CHANGELOG.md) | Release piezīmes |

## Licence

[MIT](../../LICENSE). Varat lietot, kopēt, mainīt un izplatīt projektu jebkuram mērķim, arī komerciālam, ja tiek saglabāts licences teksts.
