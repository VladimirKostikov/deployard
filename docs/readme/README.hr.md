<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kontrolna ravn za Kubernetes deploymente</strong>
</p>

<p align="center">
  Napravljen u <strong>obrazovne svrhe i za portfolio</strong>.<br/>
  Slobodno za korištenje, izmjenu i dijeljenje pod <a href="../../LICENSE">MIT licencom</a>.
</p>

<p align="center">
  <sub>
    Pregledajte deploymente, rollbackove, status podova i logove kroz tipizirani web UI<br/>
    umjesto skakanja između kubectl, Compose i jednokratnih skripti.
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
  <strong>Hrvatski</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployard nadzorna ploča deploymenta" width="720" />
</p>

## O projektu

Deployard je kontrolna ravn za deploymente u Kubernetesu. Web UI i tipizirani API stoje ispred klastera, pa preglednici i skripte nikad ne pogađaju API server izravno.

### Problem

Rad na klasteru obično znači skakanje između alata. `kubectl` za rolloute i status podova. Docker Compose za lokalne buildove. Shell skripte za učitavanje slika u kind. Zasebni tabovi za logove i port-forwarde. Svaki alat ima svoju autentikaciju, format izlaza i načine pada. Male timove to brzo pogodi. Veći timovi to zakrpe internim nadzornim pločama koje su često samo za čitanje ili vezane uz jedno okruženje.

Deployard je fokusiran na životni ciklus deploymenta: što radi, koja je revizija aktivna, zdravlje podova, rollbackovi, tail logova i unos Compose projekta u klaster bez ručne kontrolne liste.

### Što dobivate

| Područje | Što Deployard radi |
|---|---|
| Deployments | Popis, detalji, povijest revizija, skaliranje, onemogućavanje, restart, rollout undo |
| Pods | Status uživo (watch), tail logova preko SSE, exec konzola, preglednik datoteka |
| Import | Parsiranje Compose, pregled K8s manifesta, build slika, učitavanje u kind, apply |
| Network | Services, endpoints, ingress, pristup iz preglednika putem kontroliranog port-forwarda |
| Admin | Korisnici, uloge, dozvole po sekcijama (view / operate / manage) |
| Ops | Health i readiness probe, Prometheus metrike, strukturirano logiranje |

Frontend nikad ne zove Kubernetes API. NestJS backend drži kubeconfig, vodi JWT sesije s opozivom tokena u PostgreSQLu i izlaže samo dopuštene operacije. Isti obrazac kao iza internog platform API-ja.

### Kako je izgrađen

pnpm monorepo: React i Vite na frontendu, NestJS s `@kubernetes/client-node` na backendu, zajednički DTO-ovi u `@dpd/shared`, OpenAPI iz controllera.

Lokalni razvoj postavljen je kao malo stvarno okruženje:

- **kind** pokreće demo opterećenja (`demo-shop`) u klasteru
- **Docker Compose** pokreće Postgres, API i UI preko nginx-a na jednom portu
- **Helm chart** (`deploy/helm/dpd`) za production instalacije

Integracijski testovi pogađaju live API preko kind-a. Playwright pokriva prijavu i deployments tok. Dizajnerske bilješke su u [ADR-ovima](../adr/).

### Za koga je ovo

Projekt je za učenje i portfolio. Pokazuje Kubernetes izvan `kubectl apply`: rolloute, RBAC, streaming, observability i isporuku stacka preko Dockera, CI-ja i Helma. MIT licenca. Forkajte, proširujte ili ponovno iskoristite dijelove u vlastitom UI-ju.

Lens ili Kubernetes Dashboard dovoljni su ako trebate samo generički preglednik klastera. Deployard ide dublje u deploymente, operacije i put od Compose do klastera.

## Značajke

- Popis deploymenta, povijest revizija, rollout undo
- Status podova s live ažuriranjima, tail logova (SSE), exec konzola
- Docker Compose import, rebuild, učitavanje slika u kind
- Services, endpoints, ingress, port-forward iz UI-ja
- Uloge i pristup po sekcijama (view / operate / manage)
- Prometheus metrike za API proces
- 28 jezika UI-ja (i18next)

## Preduvjeti

- Docker Desktop (pokrenut)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Provjera alata:

```bash
make install-tools
make doctor
```

## Lokalno postavljanje

Cijeli stack: **kind klaster** (demo opterećenja) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Što radi svaki korak:

| Naredba | Radnja |
|---|---|
| `make cluster-up` | Stvara kind klaster `dpd-local`, prebacuje kubectl na `kind-dpd-local` |
| `make seed-demo` | Gradi demo-shop slike, učitava ih u kind, primjenjuje `demo/demo-shop/kubernetes` |
| `make docker-up` | Gradi i pokreće Postgres, API i web (nginx na portu iz `WEB_PORT`) |

Zaustavljanje ili reset:

```bash
make docker-down          # zaustavi Compose stack
make cluster-down         # obriši kind klaster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # obriši Postgres volumen
```

## Lokalni URL-ovi

Zadani port je **18480** (`WEB_PORT` u `.env`).

| URL | Što |
|---|---|
| http://localhost:18480 | Web UI (prijava) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrike (API) |
| http://localhost:30081 | demo-shop web (NodePort u kind-u, nakon `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (pristup s hosta, iz `.env`) |

Zadani dev korisnici (samo seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Lokalni razvoj (bez Docker UI-ja)

API i web rade na hostu. Postgres može ostati u Dockeru.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Što |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Korisne naredbe

```bash
make docker-logs          # prati logove API / web / Postgres
make lint                 # TypeScript lint (svi paketi)
make test                 # unit testovi
make test-integration     # API + kind (API na :3000, Postgres potreban)
make test-e2e             # Playwright (web na :5173)
make helm-lint            # lint Helm charta
make helm-install         # instaliraj chart u kind (alternativa docker-up)
make cluster-down         # ukloni kind klaster
```

Rebuild nakon promjena koda:

```bash
make docker-up
```

## Produkcija

Pogledajte [docs/deploy.md](../deploy.md) za Helm, migracije i `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Primjeri

| Putanja | Što je |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed u kind |
| `demo/weather-station` | Mali compose stack za vježbu importa |
| `demo/todo-board` | Minimalni frontend + API primjer |
| `examples/kubernetes/` | kind config, RBAC uzorci |

```bash
make demo-load
make seed-demo
```

## Stack

| Sloj | Tehnologija |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (korisnici, uloge) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arhitektura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend nikad ne zove klaster izravno. API provodi JWT auth s dozvolama po sekcijama. Kubernetes ServiceAccount koristi least-privilege RBAC (pogledajte `examples/kubernetes/rbac.yaml`).

Detalji: [docs/architecture.md](../architecture.md) i [ADR-ovi](../adr/)

## Dokumentacija

| Dokument | Tema |
|---|---|
| [Architecture](../architecture.md) | Dizajn i faze |
| [Deploy](../deploy.md) | Helm, migracije, prvi admin |
| [Repository layout](../repository-structure.md) | Konvencije mapa |
| [Security](../../SECURITY.md) | Prijavi ranjivost |
| [Changelog](../../CHANGELOG.md) | Bilješke o izdanjima |

## Licenca

[MIT](../../LICENSE). Možete koristiti, kopirati, mijenjati i distribuirati ovaj projekt u bilo koju svrhu, uključujući komercijalnu, uz zadržavanje obavijesti o licenci.
