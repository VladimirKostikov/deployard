<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Pjan ta' kontroll tal-iskjerimenti Kubernetes</strong>
</p>

<p align="center">
  Maħluq għal <strong>skopijiet edukattivi u portfolio</strong>.<br/>
  Użu, modifika u qsim liberu taħt il-<a href="../../LICENSE">Liċenzja MIT</a>.
</p>

<p align="center">
  <sub>
    Esplora l-iskjerimenti, ir-rollback, l-istatus tal-pod u l-logs permezz ta' web UI tipizzat<br/>
    minflok li tqatta' bejn kubectl, Compose u skripti waħd u waħda.
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
  <strong>Malti</strong> ·
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
  <img src="../assets/screenshot.png" alt="Dashboard tal-iskjerimenti Deployard" width="720" />
</p>

## Dwar

Deployard huwa pjan ta' kontroll tal-iskjerimenti għal Kubernetes. Il-web UI u l-API tipizzat jinsabu quddiem il-cluster, għalhekk il-browsers u l-iskripti qatt ma jikkuntattjaw l-API server direttament.

### Il-problema

Ix-xogħol fuq il-cluster normalment ifisser li taqbeż bejn għodod differenti. `kubectl` għal rollouts u l-istatus tal-pod. Docker Compose għal builds lokali. Skripti shell biex tagħbija l-immaġini f'kind. Tabs separati għal logs u port-forwards. Kull għodda għandha l-awtentikazzjoni, il-format tal-output u l-modijiet ta' falliment tagħha. Timijiet żgħar jħossu dan malajr. Timijiet akbar jgħattu l-vojt b'dashboards interni li spiss huma read-only jew marbuta ma' ambjent wieħed biss.

Deployard jiffoka fuq il-lifecycle tal-iskjeriment: x'inhu qed jaħdem, liema reviżjoni hija live, is-saħħa tal-pod, ir-rollback, it-tail tal-logs, u li tdaħħal proġett Compose fil-cluster mingħajr checklist manwali.

### X'tikseb

| Żona | X'jagħmel Deployard |
|---|---|
| Deployments | Lista, dettall, storja tar-reviżjonijiet, skala, diżattivazzjoni, restart, rollout undo |
| Pods | Status live (watch), tail tal-logs permezz ta' SSE, konsola exec, browser tal-fajls |
| Import | Parse Compose, preview tal-manifests K8s, build tal-immaġini, tagħbija f'kind, apply |
| Network | Services, endpoints, ingress, aċċess mill-browser permezz ta' port-forward kontrollat |
| Admin | Utenti, rwoli, permessi skont is-sezzjonijiet (view / operate / manage) |
| Ops | Health u readiness probes, metriki Prometheus, logging strutturat |

Il-frontend qatt ma jsejjaħ lill-Kubernetes API. Il-backend NestJS iżomm il-kubeconfig, imexxi sessjonijiet JWT b'revoka tat-tokens f'PostgreSQL, u jesponi biss operazzjonijiet fil-whitelist. L-istess mudell ta' wara API ta' pjattaforma interna.

### Kif huwa mibni

pnpm monorepo: React u Vite fuq il-frontend, NestJS ma' `@kubernetes/client-node` fuq il-backend, DTOs kondiviżi f'`@dpd/shared`, OpenAPI mill-controllers.

L-iżvilupp lokali huwa stabbilit bħall-ambjent reali żgħir:

- **kind** imexxi workloads demo (`demo-shop`) fil-cluster
- **Docker Compose** imexxi Postgres, API, u UI servuta minn nginx fuq port wieħed
- **Helm chart** (`deploy/helm/dpd`) għal installs ta' stil production

It-testijiet ta' integrazzjoni jolqtu API live kontra kind. Playwright jkopri l-login u l-fluss tal-deployments. In-noti tad-disinn jinsabu f'[ADRs](../adr/).

### Għal min huwa

Il-proġett huwa għal tagħlim u portfolio. Juri Kubernetes lil hinn minn `kubectl apply`: rollouts, RBAC, streaming, observability, u kif tibgħat il-stack b'Docker, CI u Helm. Liċenzja MIT. Fork, estendi jew erġa' uża partijiet fil-UI tiegħek.

Lens jew Kubernetes Dashboard jkunu biżżejjed jekk għandek bżonn biss explorer ġeneriku tal-cluster. Deployard imur aktar fil-fond fuq l-iskjerimenti, l-operazzjonijiet, u t-triq minn Compose għall-cluster.

## Karatteristiċi

- Lista tal-deployments, storja tar-reviżjonijiet, rollout undo
- Status tal-pod b'aġġornamenti live, tail tal-logs (SSE), konsola exec
- Import ta' Docker Compose, rebuild, tagħbija tal-immaġini f'kind
- Services, endpoints, ingress, port-forward mill-UI
- Rwoli u aċċess skont is-sezzjonijiet (view / operate / manage)
- Metriki Prometheus għall-proċess tal-API
- 28 lingwa tal-UI (i18next)

## Rekwiżiti

- Docker Desktop (qed jaħdem)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Iċċekkja l-għodod:

```bash
make install-tools
make doctor
```

## Setup lokali

Stack sħiħ: **kind cluster** (workloads demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

X'tagħmel kull pass:

| Komanda | Azzjoni |
|---|---|
| `make cluster-up` | Joħloq kind cluster `dpd-local`, jibdel kubectl għal `kind-dpd-local` |
| `make seed-demo` | Jibni l-immaġini demo-shop, jgħabbihom f'kind, japplika `demo/demo-shop/kubernetes` |
| `make docker-up` | Jibni u jibda Postgres, API u web (nginx fuq il-port minn `WEB_PORT`) |

Waqqaf jew irrisettja:

```bash
make docker-down          # waqqaf il-Compose stack
make cluster-down         # ħassar il-kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # neħħi l-volum ta' Postgres
```

## URLs lokali

Il-port default huwa **18480** (`WEB_PORT` f'`.env`).

| URL | X'inhu |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness tal-API |
| http://localhost:18480/api/health/ready | Readiness tal-API + Kubernetes |
| http://localhost:18480/api/metrics | Metriki Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort f'kind, wara `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (aċċess mill-host, minn `.env`) |

Utenti dev default (seed biss): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Żvilupp lokali (mingħajr Docker UI)

L-API u l-web jaħdmu fuq il-host. Postgres jista' jibqa' f'Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | X'inhu |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Komandi utli

```bash
make docker-logs          # segwi l-logs tal-API / web / Postgres
make lint                 # TypeScript lint (il-pakketti kollha)
make test                 # unit tests
make test-integration     # API + kind (API fuq :3000, Postgres meħtieġ)
make test-e2e             # Playwright (web fuq :5173)
make helm-lint            # lint Helm chart
make helm-install         # installa chart f'kind (alternattiva għal docker-up)
make cluster-down         # neħħi l-kind cluster
```

Rebuild wara bidliet fil-kodiċi:

```bash
make docker-up
```

## Production

Ara [docs/deploy.md](../deploy.md) għal Helm, migrations u `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Eżempji

| Path | X'inhu |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seeded f'kind |
| `demo/weather-station` | Stack compose żgħir għal prattika tal-import |
| `demo/todo-board` | Kampjun minimali frontend + API |
| `examples/kubernetes/` | kind config, kampjuni RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Saff | Teknoloġija |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (utenti, rwoli) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkitettura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Il-frontend qatt ma jsejjaħ il-cluster direttament. L-API jinfurza JWT auth b'permessi skont is-sezzjonijiet. Il-Kubernetes ServiceAccount juża least-privilege RBAC (ara `examples/kubernetes/rbac.yaml`).

Dettalji: [docs/architecture.md](../architecture.md) u [ADRs](../adr/)

## Dokumentazzjoni

| Dokument | Suġġett |
|---|---|
| [Architecture](../architecture.md) | Disinn u fażijiet |
| [Deploy](../deploy.md) | Helm, migrations, l-ewwel admin |
| [Repository layout](../repository-structure.md) | Konvenzjonijiet tal-folder |
| [Security](../../SECURITY.md) | Irrapporta vulnerabbiltà |
| [Changelog](../../CHANGELOG.md) | Noti tar-rilaxx |

## Liċenzja

[MIT](../../LICENSE). Tista' tuża, tikkopja, timmodifika u tqassam dan il-proġett għal kwalunkwe skop, inkluż użu kummerċjali, sakemm tinżamm in-nota tal-liċenzja.
