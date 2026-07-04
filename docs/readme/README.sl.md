<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kontrolna ravn za Kubernetes deploymente</strong>
</p>

<p align="center">
  Ustvarjeno za <strong>izobraževalne namene in portfelj</strong>.<br/>
  Prosto za uporabo, spreminjanje in deljenje pod <a href="../../LICENSE">licenco MIT</a>.
</p>

<p align="center">
  <sub>
    Pregledujte deploymente, rollbacke, stanje podov in dnevnike prek tipiziranega spletnega vmesnika<br/>
    namesto neprestanega preklapljanja med kubectl, Compose in enkratnimi skripti.
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
  <strong>Slovenščina</strong> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Deployard nadzorna plošča deploymentov" width="720" />
</p>

## O projektu

Deployard je kontrolna ravn za deploymente v Kubernetesu. Spletni vmesnik in tipiziran API stojita pred clusterjem, zato brskalniki in skripte ne kličejo API strežnika neposredno.

### Težava

Delo s clusterjem običajno pomeni skakanje med orodji. `kubectl` za rolloute in stanje podov. Docker Compose za lokalne build-e. Shell skripte za nalaganje slik v kind. Ločeni zavihki za dnevnike in port-forward. Vsako orodje ima svojo avtentikacijo, format izhoda in načine odpovedi. Majhne ekipe to hitro občutijo. Večje to zapolnijo z notranjimi nadzornimi ploščami, ki so pogosto samo za branje ali vezane na eno okolje.

Deployard se osredotoča na življenjski cikel deploymenta: kaj teče, katera revizija je aktivna, zdravje podov, rollbacki, tail dnevnikov in prenos Compose projekta v cluster brez ročnega checklista.

### Kaj dobite

| Področje | Kaj naredi Deployard |
|---|---|
| Deployments | Seznam, podrobnosti, zgodovina revizij, skaliranje, onemogočanje, ponovni zagon, rollout undo |
| Pods | Stanje v živo (watch), tail dnevnikov prek SSE, exec konzola, brskalnik datotek |
| Import | Razčlenitev Compose, predogled K8s manifestov, gradnja slik, nalaganje v kind, apply |
| Network | Services, endpoints, ingress, dostop iz brskalnika prek nadzorovanega port-forward |
| Admin | Uporabniki, vloge, dovoljenja po sekcijah (view / operate / manage) |
| Ops | Health in readiness probes, metrike Prometheus, strukturirano beleženje |

Frontend nikoli ne kliče Kubernetes API. NestJS backend hrani kubeconfig, izvaja JWT seje z razveljavitvijo žetonov v PostgreSQL in izpostavlja samo dovoljene operacije. Enak vzorec kot za notranji platform API.

### Kako je zgrajen

pnpm monorepo: React in Vite na frontendu, NestJS z `@kubernetes/client-node` na backendu, skupni DTO v `@dpd/shared`, OpenAPI iz controllerjev.

Lokalni razvoj je nastavljen kot majhno resnično okolje:

- **kind** zaganja demo workload-e (`demo-shop`) v clusterju
- **Docker Compose** zaganja Postgres, API in UI prek nginx na enem portu
- **Helm chart** (`deploy/helm/dpd`) za production namestitve

Integracijski testi kličejo živ API prek kind. Playwright pokriva prijavo in tok deploymentov. Dizajnerske opombe so v [ADR](../adr/).

### Za koga je

Projekt je za učenje in portfelj. Pokaže Kubernetes onkraj `kubectl apply`: rolloute, RBAC, streaming, observability in dostavo stacka z Docker, CI in Helm. Licenca MIT. Lahko forkate, razširite ali ponovno uporabite dele v lastnem UI.

Lens ali Kubernetes Dashboard zadostujeta, če potrebujete le splošni raziskovalec clusterja. Deployard gre globlje v deploymente, operacije in pot od Compose do clusterja.

## Funkcije

- Seznam deploymentov, zgodovina revizij, rollout undo
- Stanje podov z live posodobitvami, tail dnevnikov (SSE), exec konzola
- Uvoz Docker Compose, rebuild, nalaganje slik v kind
- Services, endpoints, ingress, port-forward iz UI
- Vloge in dostop po sekcijah (view / operate / manage)
- Metrike Prometheus za API proces
- 28 jezikov UI (i18next)

## Predpogoji

- Docker Desktop (zagnan)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Preverite orodja:

```bash
make install-tools
make doctor
```

## Lokalna nastavitev

Celoten stack: **kind cluster** (demo workload-i) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Kaj naredi vsak korak:

| Ukaz | Dejanje |
|---|---|
| `make cluster-up` | Ustvari kind cluster `dpd-local`, preklopi kubectl na `kind-dpd-local` |
| `make seed-demo` | Zgradi slike demo-shop, jih naloži v kind, uporabi `demo/demo-shop/kubernetes` |
| `make docker-up` | Zgradi in zažene Postgres, API in web (nginx na portu iz `WEB_PORT`) |

Ustavitev ali ponastavitev:

```bash
make docker-down          # ustavi Compose stack
make cluster-down         # izbriše kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # izbriše Postgres volume
```

## Lokalni URL-ji

Privzeti port je **18480** (`WEB_PORT` v `.env`).

| URL | Kaj je |
|---|---|
| http://localhost:18480 | Web UI (prijava) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Metrike Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort v kind, po `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (dostop z hosta, iz `.env`) |

Privzeti dev uporabniki (samo seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokalni razvoj (brez Docker UI)

API in web tečeta na hostu. Postgres lahko ostane v Dockerju.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Kaj je |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Uporabni ukazi

```bash
make docker-logs          # spremljaj dnevnike API / web / Postgres
make lint                 # TypeScript lint (vsi paketi)
make test                 # unit testi
make test-integration     # API + kind (API na :3000, potreben Postgres)
make test-e2e             # Playwright (web na :5173)
make helm-lint            # lint Helm chart
make helm-install         # namesti chart v kind (alternativa docker-up)
make cluster-down         # odstrani kind cluster
```

Ponovna gradnja po spremembah kode:

```bash
make docker-up
```

## Production

Glej [docs/deploy.md](../deploy.md) za Helm, migracije in `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Primeri

| Pot | Kaj je |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed v kind |
| `demo/weather-station` | Majhen compose stack za vajo uvoza |
| `demo/todo-board` | Minimalni vzorec frontend + API |
| `examples/kubernetes/` | kind config, RBAC vzorci |

```bash
make demo-load
make seed-demo
```

## Stack

| Plast | Tehnologija |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (uporabniki, vloge) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arhitektura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nikoli ne kliče clusterja neposredno. API izvaja JWT avtentikacijo z dovoljenji po sekcijah. Kubernetes ServiceAccount uporablja RBAC z najmanjšimi pravicami (glej `examples/kubernetes/rbac.yaml`).

Podrobnosti: [docs/architecture.md](../architecture.md) in [ADR](../adr/)

## Dokumentacija

| Dokument | Tema |
|---|---|
| [Architecture](../architecture.md) | Dizajn in faze |
| [Deploy](../deploy.md) | Helm, migracije, prvi admin |
| [Repository layout](../repository-structure.md) | Konvencije map |
| [Security](../../SECURITY.md) | Prijavi ranljivost |
| [Changelog](../../CHANGELOG.md) | Opombe ob izdajah |

## Licenca

[MIT](../../LICENSE). Projekt lahko uporabljate, kopirate, spreminjate in distribuirate za katerikoli namen, vključno s komercialno uporabo, če ohranite obvestilo o licenci.
