<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Панель управления деплоями в Kubernetes</strong>
</p>

<p align="center">
  Проект создан в <strong>образовательных целях</strong> и для портфолио.<br/>
  Свободное использование, изменение и распространение по <a href="../../LICENSE">лицензии MIT</a>.
</p>

<p align="center">
  <sub>
    Деплои, откаты, статус pod и логи в веб-интерфейсе<br/>
    вместо постоянных kubectl, Compose и разрозненных скриптов.
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
  <a href="README.ro.md">Română</a> ·
  <strong>Русский</strong> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Панель деплоев Deployard" width="720" />
</p>

## О проекте

Deployard — панель управления деплоями для Kubernetes. Веб-интерфейс и типизированный API стоят перед кластером: браузеры и скрипты не обращаются к API server напрямую.

### Проблема

Работа с кластером обычно размазана по разным инструментам. `kubectl` — для rollout и статуса pod. Docker Compose — для локальных сборок. Shell-скрипты — чтобы загрузить образы в kind. Отдельные вкладки — для логов и port-forward. У каждого инструмента своя аутентификация, формат вывода и типичные сбои. Маленькие команды чувствуют это быстро. Крупные закрывают дыры внутренними дашбордами, которые часто только для чтения или привязаны к одному окружению.

Deployard сфокусирован на жизненном цикле деплоя: что запущено, какая ревизия активна, здоровье pod, откаты, tail логов и перенос Compose-проекта в кластер без ручного чеклиста.

### Что вы получаете

| Область | Возможности Deployard |
|---|---|
| Deployments | Список, детали, история ревизий, масштабирование, отключение, перезапуск, rollout undo |
| Pods | Статус в реальном времени (watch), tail логов по SSE, exec-консоль, файловый браузер |
| Import | Разбор Compose, превью K8s-манифестов, сборка образов, загрузка в kind, apply |
| Network | Services, endpoints, ingress, доступ из браузера через контролируемый port-forward |
| Admin | Пользователи, роли, права по разделам (view / operate / manage) |
| Ops | Health и readiness probes, метрики Prometheus, структурированное логирование |

Frontend не вызывает Kubernetes API. NestJS backend держит kubeconfig, JWT-сессии с отзывом токенов в PostgreSQL и отдаёт только разрешённые операции. Тот же паттерн, что у внутреннего platform API.

### Как устроено

pnpm monorepo: React и Vite на frontend, NestJS с `@kubernetes/client-node` на backend, общие DTO в `@dpd/shared`, OpenAPI из контроллеров.

Локальная разработка настроена как небольшое реальное окружение:

- **kind** запускает демо-нагрузки (`demo-shop`) в кластере
- **Docker Compose** поднимает Postgres, API и UI через nginx на одном порту
- **Helm chart** (`deploy/helm/dpd`) для production-установки

Интеграционные тесты бьют в живой API через kind. Playwright покрывает логин и сценарий deployments. Архитектурные решения — в [ADR](../adr/).

### Для кого

Проект для обучения и портфолио. Показывает Kubernetes шире, чем `kubectl apply`: rollout, RBAC, стриминг, observability и доставку стека через Docker, CI и Helm. Лицензия MIT. Можно форкнуть, расширить или взять части в свой UI.

Lens или Kubernetes Dashboard достаточно, если нужен только общий обзор кластера. Deployard глубже закрывает деплои, операции и путь от Compose к кластеру.

## Возможности

- Список deployments, история ревизий, rollout undo
- Статус pod с live-обновлениями, tail логов (SSE), exec-консоль
- Импорт Docker Compose, пересборка, загрузка образов в kind
- Services, endpoints, ingress, port-forward из UI
- Роли и доступ по разделам (view / operate / manage)
- Метрики Prometheus для процесса API
- 28 языков интерфейса (i18next)

## Требования

- Docker Desktop (запущен)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Проверка окружения:

```bash
make install-tools
make doctor
```

## Локальный запуск

Полный стек: **kind-кластер** (демо-нагрузки) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Что делает каждая команда:

| Команда | Действие |
|---|---|
| `make cluster-up` | Создаёт kind-кластер `dpd-local`, переключает kubectl на `kind-dpd-local` |
| `make seed-demo` | Собирает образы demo-shop, загружает в kind, применяет `demo/demo-shop/kubernetes` |
| `make docker-up` | Собирает и запускает Postgres, API и web (nginx на порту из `WEB_PORT`) |

Остановка и сброс:

```bash
make docker-down          # остановить Compose-стек
make cluster-down         # удалить kind-кластер
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # очистить том Postgres
```

## Локальные URL

Порт по умолчанию — **18480** (`WEB_PORT` в `.env`).

| URL | Назначение |
|---|---|
| http://localhost:18480 | Web UI (вход) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Метрики Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort в kind, после `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (доступ с хоста, из `.env`) |

Пользователи по умолчанию (только seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Локальная разработка (без Docker UI)

API и web на хосте. Postgres может оставаться в Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Назначение |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Полезные команды

```bash
make docker-logs          # логи API / web / Postgres
make lint                 # TypeScript lint (все пакеты)
make test                 # unit-тесты
make test-integration     # API + kind (API на :3000, нужен Postgres)
make test-e2e             # Playwright (web на :5173)
make helm-lint            # lint Helm chart
make helm-install         # установка chart в kind (альтернатива docker-up)
make cluster-down         # удалить kind-кластер
```

Пересборка после изменений кода:

```bash
make docker-up
```

## Production

См. [docs/deploy.md](../deploy.md) — Helm, миграции и `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Примеры

| Путь | Описание |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed в kind |
| `demo/weather-station` | Небольшой compose-стек для практики импорта |
| `demo/todo-board` | Минимальный frontend + API |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Стек

| Слой | Технологии |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (пользователи, роли) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Архитектура

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend не обращается к кластеру напрямую. API проверяет JWT и права по разделам. ServiceAccount Kubernetes с RBAC по принципу least privilege (см. `examples/kubernetes/rbac.yaml`).

Подробнее: [docs/architecture.md](../architecture.md) и [ADR](../adr/)

## Документация

| Документ | Тема |
|---|---|
| [Architecture](../architecture.md) | Дизайн и этапы |
| [Deploy](../deploy.md) | Helm, миграции, первый admin |
| [Repository layout](../repository-structure.md) | Структура репозитория |
| [Security](../../SECURITY.md) | Сообщить об уязвимости |
| [Changelog](../../CHANGELOG.md) | Заметки к релизам |

## Лицензия

[MIT](../../LICENSE). Можно использовать, копировать, изменять и распространять проект в любых целях, включая коммерческие, при сохранении текста лицензии.
