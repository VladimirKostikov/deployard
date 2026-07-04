<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Stjórnunarlagi fyrir Kubernetes deployment</strong>
</p>

<p align="center">
  Búið til í <strong>menntaskyni og fyrir portfolio</strong>.<br/>
  Frjálst að nota, breyta og deila samkvæmt <a href="../../LICENSE">MIT leyfinu</a>.
</p>

<p align="center">
  <sub>
    Skoðaðu deployment, rollback, stöðu pod og logg í vefviðmóti með tegundum<br/>
    í stað þess að hoppa á milli kubectl, Compose og einnota skrifta.
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
  <strong>Íslenska</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard deployment mælaborð" width="720" />
</p>

## Um verkefnið

Deployard er stjórnunarlagi fyrir deployment í Kubernetes. Vefviðmótið og API með tegundum standa fyrir framan klasa: vafrar og skriftur ná aldrei beint í API server.

### Vandamálið

Vinna við klasa þýðir oft að hoppa á milli verkfæra. `kubectl` fyrir rollout og stöðu pod. Docker Compose fyrir staðbundna byggingu. Shell skriftur til að hlaða myndum inn í kind. Aðskildir flipar fyrir logg og port-forward. Hvert verkfæri hefur sitt eigið auðkenningu, úttaksform og bilunarmynstur. Litlar teymi finna það fljótt. Stærri teymi laga það með innri mælaborðum sem eru oft aðeins til lestrar eða bundin við eitt umhverfi.

Deployard einbeitir sér að lífsferli deployment: hvað er í gangi, hvaða útgáfa er virk, heilsa pod, rollback, log tail og að koma Compose verkefni inn í klasa án handvirkrar gátlisti.

### Hvað þú færð

| Svæði | Hvað Deployard gerir |
|---|---|
| Deployments | Listi, smáatriði, útgáfuferill, skölun, óvirkjun, endurræsing, rollout undo |
| Pods | Lifandi staða (watch), log tail yfir SSE, exec stjórnborð, skráavafri |
| Import | Greina Compose, forskoða K8s manifest, byggja myndir, hlaða inn í kind, apply |
| Network | Services, endpoints, ingress, aðgangur í vafra með stýrðum port-forward |
| Admin | Notendur, hlutverk, heimildir eftir hlutum (view / operate / manage) |
| Ops | Health og readiness probes, Prometheus mælingar, skipulögð skráning |

Frontend kallar aldrei á Kubernetes API. NestJS backend heldur kubeconfig, keyrir JWT lotur með afturköllun tokena í PostgreSQL og birtir aðeins leyfðar aðgerðir. Sama mynstur og á bak við innra platform API.

### Hvernig það er byggt

pnpm monorepo: React og Vite á frontend, NestJS með `@kubernetes/client-node` á backend, sameiginleg DTO í `@dpd/shared`, OpenAPI úr controllers.

Staðbundin þróun er sett upp eins og lítið raunverulegt umhverfi:

- **kind** keyrir demo álag (`demo-shop`) í klasanum
- **Docker Compose** keyrir Postgres, API og UI þjónað af nginx á einum porti
- **Helm chart** (`deploy/helm/dpd`) fyrir production uppsetningar

Samþættingarpróf hitta lifandi API gegnum kind. Playwright nær yfir innskráningu og deployments flæði. Hönnunarglósur eru í [ADRs](../adr/).

### Fyrir hvern

Verkefnið er til náms og portfolio. Það sýnir Kubernetes umfram `kubectl apply`: rollout, RBAC, streymi, observability og afhendingu stafks með Docker, CI og Helm. MIT leyfi. Forkaðu, stækkaðu eða endurnýttu hluta í þínu eigin UI.

Lens eða Kubernetes Dashboard nægja ef þú þarft aðeins almennt klasa könnunartól. Deployard fer dýpra í deployment, aðgerðir og leiðina frá Compose í klasa.

## Eiginleikar

- Deployment listi, útgáfuferill, rollout undo
- Pod staða með lifandi uppfærslum, log tail (SSE), exec stjórnborð
- Docker Compose innflutningur, endurbygging, kind mynd innsending
- Services, endpoints, ingress, port-forward úr UI
- Hlutverk og aðgangur eftir hlutum (view / operate / manage)
- Prometheus mælingar fyrir API ferli
- 28 tungumál í UI (i18next)

## Forsendur

- Docker Desktop (í gangi)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Athuga verkfæri:

```bash
make install-tools
make doctor
```

## Staðbundin uppsetning

Fullur stafkur: **kind klasi** (demo álag) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Hvað hvert skref gerir:

| Skipun | Aðgerð |
|---|---|
| `make cluster-up` | Býr til kind klasa `dpd-local`, skiptir kubectl yfir í `kind-dpd-local` |
| `make seed-demo` | Byggir demo-shop myndir, hleður inn í kind, setur `demo/demo-shop/kubernetes` í gildi |
| `make docker-up` | Byggir og ræsir Postgres, API og web (nginx á porti úr `WEB_PORT`) |

Stöðva eða endurstilla:

```bash
make docker-down          # stöðva Compose stafk
make cluster-down         # eyða kind klasa
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # hreinsa Postgres geymslu
```

## Staðbundnar slóðir

Sjálfgefinn portur er **18480** (`WEB_PORT` í `.env`).

| Slóð | Hvað |
|---|---|
| http://localhost:18480 | Web UI (innskráning) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus mælingar (API) |
| http://localhost:30081 | demo-shop web (NodePort í kind, eftir `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (aðgangur frá host, úr `.env`) |

Sjálfgefnir dev notendur (aðeins seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Staðbundin þróun (án Docker UI)

API og web keyra á host. Postgres getur verið í Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| Slóð | Hvað |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Gagnlegar skipanir

```bash
make docker-logs          # fylgja API / web / Postgres loggum
make lint                 # TypeScript lint (öll pakkar)
make test                 # einingapróf
make test-integration     # API + kind (API á :3000, Postgres nauðsynlegt)
make test-e2e             # Playwright (web á :5173)
make helm-lint            # lint Helm chart
make helm-install         # setja chart upp í kind (valkostur við docker-up)
make cluster-down         # fjarlægja kind klasa
```

Endurbyggja eftir breytingar á kóða:

```bash
make docker-up
```

## Production

Sjá [docs/deploy.md](../deploy.md) um Helm, flutninga og `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Dæmi

| Slóð | Hvað það er |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed í kind |
| `demo/weather-station` | Lítill compose stafkur til æfingar í innflutningi |
| `demo/todo-board` | Lágmarks frontend + API dæmi |
| `examples/kubernetes/` | kind config, RBAC dæmi |

```bash
make demo-load
make seed-demo
```

## Stafkur

| Lag | Tækni |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (notendur, hlutverk) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkitektúr

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend kallar aldrei beint á klasa. API framfylgir JWT auðkenningu með heimildum eftir hlutum. Kubernetes ServiceAccount notar least-privilege RBAC (sjá `examples/kubernetes/rbac.yaml`).

Nánar: [docs/architecture.md](../architecture.md) og [ADRs](../adr/)

## Skjöl

| Skjal | Efni |
|---|---|
| [Architecture](../architecture.md) | Hönnun og þrep |
| [Deploy](../deploy.md) | Helm, flutningar, fyrsti admin |
| [Repository layout](../repository-structure.md) | Möppusnið |
| [Security](../../SECURITY.md) | Tilkynna öryggisgalla |
| [Changelog](../../CHANGELOG.md) | Útgáfuglósur |

## Leyfi

[MIT](../../LICENSE). Þú mátt nota, afrita, breyta og dreifa þessu verkefni í hvaða tilgangi sem er, þar með talið í viðskiptalegum tilgangi, svo framarlega sem leyfistextinn er varðveittur.
