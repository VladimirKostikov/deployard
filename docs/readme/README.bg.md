<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control plane за Kubernetes deployment</strong>
</p>

<p align="center">
  Създаден за <strong>образователни цели и портфолио</strong>.<br/>
  Свободно използване, промяна и споделяне по <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployment, rollback, статус на pod и логове през типизиран web UI<br/>
    вместо постоянно превключване между kubectl, Compose и еднократни скриптове.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <strong>Български</strong> ·
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
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Табло за deployment на Deployard" width="720" />
</p>

## За проекта

Deployard е control plane за deployment в Kubernetes. Web UI и типизираният API стоят пред кластера, така че браузърите и скриптовете не достигат API server директно.

### Проблемът

Работата с кластера обикновено означава прескачане между инструменти. `kubectl` за rollout и статус на pod. Docker Compose за локални build. Shell скриптове за зареждане на образи в kind. Отделни табове за логове и port-forward. Всеки инструмент има собствена автентикация, формат на изхода и начини на отказ. Малките екипи го усещат бързо. По-големите го закърпват с вътрешни dashboard, често само за четене или вързани към една среда.

Deployard е фокусиран върху жизнения цикъл на deployment: какво работи, коя ревизия е активна, здравето на pod, rollback, tail на логове и вкарване на Compose проект в кластера без ръчен checklist.

### Какво получавате

| Област | Какво прави Deployard |
|---|---|
| Deployments | Списък, детайли, история на ревизии, scale, disable, restart, rollout undo |
| Pods | Статус на живо (watch), tail на логове през SSE, exec конзола, file browser |
| Import | Parse на Compose, преглед на K8s manifest, build на образи, load в kind, apply |
| Network | Services, endpoints, ingress, достъп от браузъра чрез контролиран port-forward |
| Admin | Потребители, роли, права по секции (view / operate / manage) |
| Ops | Health и readiness probes, метрики Prometheus, structured logging |

Frontend никога не извиква Kubernetes API. NestJS backend държи kubeconfig, JWT сесии с отнемане на токени в PostgreSQL и излага само разрешени операции. Същият модел като зад вътрешен platform API.

### Как е изграден

pnpm monorepo: React и Vite на frontend, NestJS с `@kubernetes/client-node` на backend, споделени DTO в `@dpd/shared`, OpenAPI от controllers.

Локалната разработка е настроена като малка реална среда:

- **kind** пуска demo workloads (`demo-shop`) в кластера
- **Docker Compose** пуска Postgres, API и UI през nginx на един порт
- **Helm chart** (`deploy/helm/dpd`) за production инсталации

Integration тестовете удрят жив API срещу kind. Playwright покрива login и deployments flow. Архитектурните бележки са в [ADRs](../adr/).

### За кого е

Проектът е за обучение и портфолио. Показва Kubernetes отвъд `kubectl apply`: rollout, RBAC, streaming, observability и доставка на стека с Docker, CI и Helm. MIT license. Fork, разширение или повторна употреба на части в собствен UI.

Lens или Kubernetes Dashboard стигат, ако ви трябва само общ cluster explorer. Deployard отива по-дълбоко в deployment, операции и пътя от Compose към кластера.

## Възможности

- Списък с deployment, история на ревизии, rollout undo
- Статус на pod с live обновления, tail на логове (SSE), exec конзола
- Импорт на Docker Compose, rebuild, kind image load
- Services, endpoints, ingress, port-forward от UI
- Роли и достъп по секции (view / operate / manage)
- Prometheus метрики за API процеса
- 28 UI езика (i18next)

## Изисквания

- Docker Desktop (работещ)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Проверка на инструментите:

```bash
make install-tools
make doctor
```

## Локална настройка

Пълен стек: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Какво прави всяка стъпка:

| Команда | Действие |
|---|---|
| `make cluster-up` | Създава kind cluster `dpd-local`, превключва kubectl към `kind-dpd-local` |
| `make seed-demo` | Build на demo-shop образи, load в kind, apply на `demo/demo-shop/kubernetes` |
| `make docker-up` | Build и старт на Postgres, API и web (nginx на порт от `WEB_PORT`) |

Спиране или reset:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Локални URL

Порт по подразбиране е **18480** (`WEB_PORT` в `.env`).

| URL | Какво |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort в kind, след `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host access, от `.env`) |

Dev потребители по подразбиране (само seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Локална разработка (без Docker UI)

API и web на host. Postgres може да остане в Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Какво |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Полезни команди

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

Rebuild след промени в кода:

```bash
make docker-up
```

## Production

Вижте [docs/deploy.md](../deploy.md) за Helm, migrations и `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Примери

| Път | Какво е |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed в kind |
| `demo/weather-station` | Малък compose stack за практика с import |
| `demo/todo-board` | Минимален frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Стек

| Слой | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Архитектура

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend никога не извиква кластера директно. API прилага JWT auth с права по секции. Kubernetes ServiceAccount използва least-privilege RBAC (вижте `examples/kubernetes/rbac.yaml`).

Подробности: [docs/architecture.md](../architecture.md) и [ADRs](../adr/)

## Документация

| Doc | Тема |
|---|---|
| [Architecture](../architecture.md) | Design и фази |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Лиценз

[MIT](../../LICENSE). Можете да използвате, копирате, променяте и разпространявате проекта за всякакви цели, включително комерсиални, стига да запазите текста на лиценза.
