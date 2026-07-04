<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Панель керування деплоями в Kubernetes</strong>
</p>

<p align="center">
  Створено для <strong>навчання та портфоліо</strong>.<br/>
  Вільне використання, змінення та поширення за <a href="../../LICENSE">ліцензією MIT</a>.
</p>

<p align="center">
  <sub>
    Деплої, відкати, стан pod і логи у веб-інтерфейсі<br/>
    замість постійного kubectl, Compose і розрізнених скриптів.
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
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <strong>Українська</strong>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Панель деплоїв Deployard" width="720" />
</p>

## Про проєкт

Deployard — панель керування деплоями для Kubernetes. Веб-інтерфейс і типізований API стоять перед кластером: браузери та скрипти не звертаються до API server напряму.

### Проблема

Робота з кластером зазвичай розкидана між різними інструментами. `kubectl` — для rollout і стану pod. Docker Compose — для локальних збірок. Shell-скрипти — щоб завантажити образи в kind. Окремі вкладки — для логів і port-forward. У кожного інструмента своя автентифікація, формат виводу й типові збої. Малі команди відчувають це швидко. Великі закривають прогалини внутрішніми дашбордами, які часто лише для читання або прив'язані до одного середовища.

Deployard зосереджений на життєвому циклі деплою: що запущено, яка ревізія активна, здоров'я pod, відкати, tail логів і перенесення Compose-проєкту в кластер без ручного чекліста.

### Що ви отримуєте

| Область | Можливості Deployard |
|---|---|
| Deployments | Список, деталі, історія ревізій, масштабування, вимкнення, перезапуск, rollout undo |
| Pods | Стан у реальному часі (watch), tail логів через SSE, exec-консоль, файловий браузер |
| Import | Розбір Compose, прев'ю K8s-маніфестів, збірка образів, завантаження в kind, apply |
| Network | Services, endpoints, ingress, доступ із браузера через контрольований port-forward |
| Admin | Користувачі, ролі, права за розділами (view / operate / manage) |
| Ops | Health і readiness probes, метрики Prometheus, структуроване логування |

Frontend не викликає Kubernetes API. NestJS backend зберігає kubeconfig, JWT-сесії з відкликанням токенів у PostgreSQL і віддає лише дозволені операції. Той самий підхід, що й у внутрішнього platform API.

### Як це влаштовано

pnpm monorepo: React і Vite на frontend, NestJS з `@kubernetes/client-node` на backend, спільні DTO в `@dpd/shared`, OpenAPI з контролерів.

Локальна розробка налаштована як невелике реальне середовище:

- **kind** запускає демо-навантаження (`demo-shop`) в кластері
- **Docker Compose** піднімає Postgres, API і UI через nginx на одному порту
- **Helm chart** (`deploy/helm/dpd`) для production-установки

Інтеграційні тести б'ють у живий API через kind. Playwright покриває вхід і сценарій deployments. Архітектурні рішення — у [ADR](../adr/).

### Для кого

Проєкт для навчання та портфоліо. Показує Kubernetes ширше, ніж `kubectl apply`: rollout, RBAC, стрімінг, observability і доставку стеку через Docker, CI та Helm. Ліцензія MIT. Можна форкнути, розширити або взяти частини в свій UI.

Lens або Kubernetes Dashboard достатньо, якщо потрібен лише загальний огляд кластера. Deployard глибше закриває деплої, операції та шлях від Compose до кластера.

## Можливості

- Список deployments, історія ревізій, rollout undo
- Стан pod з live-оновленнями, tail логів (SSE), exec-консоль
- Імпорт Docker Compose, перезбірка, завантаження образів у kind
- Services, endpoints, ingress, port-forward з UI
- Ролі та доступ за розділами (view / operate / manage)
- Метрики Prometheus для процесу API
- 28 мов інтерфейсу (i18next)

## Вимоги

- Docker Desktop (запущений)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Перевірка середовища:

```bash
make install-tools
make doctor
```

## Локальний запуск

Повний стек: **kind-кластер** (демо-навантаження) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Що робить кожна команда:

| Команда | Дія |
|---|---|
| `make cluster-up` | Створює kind-кластер `dpd-local`, перемикає kubectl на `kind-dpd-local` |
| `make seed-demo` | Збирає образи demo-shop, завантажує в kind, застосовує `demo/demo-shop/kubernetes` |
| `make docker-up` | Збирає й запускає Postgres, API і web (nginx на порту з `WEB_PORT`) |

Зупинка та скидання:

```bash
make docker-down          # зупинити Compose-стек
make cluster-down         # видалити kind-кластер
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # очистити том Postgres
```

## Локальні URL

Порт за замовчуванням — **18480** (`WEB_PORT` у `.env`).

| URL | Призначення |
|---|---|
| http://localhost:18480 | Web UI (вхід) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Метрики Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort у kind, після `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (доступ з хоста, з `.env`) |

Користувачі за замовчуванням (лише seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Локальна розробка (без Docker UI)

API і web на хості. Postgres може залишатися в Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Призначення |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Корисні команди

```bash
make docker-logs          # логи API / web / Postgres
make lint                 # TypeScript lint (усі пакети)
make test                 # unit-тести
make test-integration     # API + kind (API на :3000, потрібен Postgres)
make test-e2e             # Playwright (web на :5173)
make helm-lint            # lint Helm chart
make helm-install         # установка chart у kind (альтернатива docker-up)
make cluster-down         # видалити kind-кластер
```

Перезбірка після змін коду:

```bash
make docker-up
```

## Production

Див. [docs/deploy.md](../deploy.md) — Helm, міграції та `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Приклади

| Шлях | Опис |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed у kind |
| `demo/weather-station` | Невеликий compose-стек для практики імпорту |
| `demo/todo-board` | Мінімальний frontend + API |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Стек

| Шар | Технології |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (користувачі, ролі) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Архітектура

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend не звертається до кластера напряму. API перевіряє JWT і права за розділами. ServiceAccount Kubernetes з RBAC за принципом least privilege (див. `examples/kubernetes/rbac.yaml`).

Докладніше: [docs/architecture.md](../architecture.md) і [ADR](../adr/)

## Документація

| Документ | Тема |
|---|---|
| [Architecture](../architecture.md) | Дизайн і етапи |
| [Deploy](../deploy.md) | Helm, міграції, перший admin |
| [Repository layout](../repository-structure.md) | Структура репозиторію |
| [Security](../../SECURITY.md) | Повідомити про вразливість |
| [Changelog](../../CHANGELOG.md) | Нотатки до релізів |

## Ліцензія

[MIT](../../LICENSE). Можна використовувати, копіювати, змінювати та поширювати проєкт у будь-яких цілях, включно з комерційними, за збереження тексту ліцензії.
