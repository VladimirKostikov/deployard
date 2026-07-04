<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Kubernetes-deploymenttien hallintataso</strong>
</p>

<p align="center">
  Luotu <strong>opetus- ja portfolio-käyttöön</strong>.<br/>
  Vapaa käyttää, muokata ja jakaa <a href="../../LICENSE">MIT-lisenssin</a> alaisuudessa.
</p>

<p align="center">
  <sub>
    Tutki deploymentteja, rollbackkeja, pod-tilaa ja lokeja tyypitetyn web-käyttöliittymän kautta<br/>
    sen sijaan, että hyppelisit kubectl:n, Composen ja kertaluonteisten skriptien välillä.
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
  <strong>Suomi</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deployardin deployment-kojelauta" width="720" />
</p>

## Tietoa

Deployard on deployment-hallintataso Kubernetesille. Web-käyttöliittymä ja tyypitetty API ovat klusterin edessä, joten selaimet ja skriptit eivät koskaan käytä API serveria suoraan.

### Ongelma

Klusterityö tarkoittaa yleensä hyppimistä työkalujen välillä. `kubectl` rolloutteihin ja pod-tilaan. Docker Compose paikallisiin buildauksiin. Shell-skriptit kuvien lataamiseen kindiin. Erilliset välilehdet lokeille ja port-forwardeille. Jokaisella työkalulla on oma autentikointi, tulostemuoto ja virhetilanteet. Pienet tiimit huomaavat sen nopeasti. Suuremmat paikkaavat sen sisäisillä kojelaudoilla, jotka ovat usein vain luku -tilassa tai sidottu yhteen ympäristöön.

Deployard keskittyy deploymentin elinkaareen: mitä on käynnissä, mikä revisio on aktiivinen, podien kunto, rollbackit, lokien tailaus ja Compose-projektin vieminen klusteriin ilman manuaalista tarkistuslistaa.

### Mitä saat

| Alue | Mitä Deployard tekee |
|---|---|
| Deployments | Lista, tiedot, revisiohistoria, skaalaus, poisto käytöstä, uudelleenkäynnistys, rollout undo |
| Pods | Live-tila (watch), lokien tailaus SSE:n kautta, exec-konsoli, tiedostoselain |
| Import | Composen jäsentäminen, K8s-manifestien esikatselu, kuvien buildaus, lataus kindiin, apply |
| Network | Services, endpoints, ingress, selaimen kautta hallittu port-forward |
| Admin | Käyttäjät, roolit, osioihin perustuvat oikeudet (view / operate / manage) |
| Ops | Health- ja readiness-probet, Prometheus-metriikat, strukturoitu lokitus |

Frontend ei koskaan kutsu Kubernetes API:a. NestJS-backend pitää kubeconfigin, ajaa JWT-istuntoja tokenin mitätöinnillä PostgreSQL:ssä ja tarjoaa vain sallitut operaatiot. Sama malli kuin sisäisen platform API:n takana.

### Miten se on rakennettu

pnpm monorepo: React ja Vite frontendissä, NestJS `@kubernetes/client-node`:lla backendissä, jaetut DTO:t `@dpd/shared`:ssa, OpenAPI kontrollereista.

Paikallinen kehitys on asetettu kuin pieni oikea ympäristö:

- **kind** ajaa demo-kuormia (`demo-shop`) klusterissa
- **Docker Compose** ajaa Postgresin, API:n ja nginx-palveltavan UI:n yhdellä portilla
- **Helm chart** (`deploy/helm/dpd`) production-tyylisiin asennuksiin

Integraatiotestit osuvat live-API:in kindin kautta. Playwright kattaa kirjautumisen ja deployments-virran. Suunnittelumuistiinpanot ovat [ADRs](../adr/):ssa.

### Kenelle tämä on

Projekti on oppimiseen ja portfolioon. Se näyttää Kubernetesin `kubectl apply`:n ulkopuolella: rolloutit, RBAC, striimaus, observability ja pinon toimitus Dockerin, CI:n ja Helmin kautta. MIT-lisenssi. Forkkaa, laajenna tai käytä osia omassa UI:ssa.

Lens tai Kubernetes Dashboard riittää, jos tarvitset vain yleisen klusteriselaimen. Deployard menee syvemmälle deploymenteihin, operaatioihin ja polkuun Composelta klusteriin.

## Ominaisuudet

- Deployment-lista, revisiohistoria, rollout undo
- Pod-tila live-päivityksillä, lokien tailaus (SSE), exec-konsoli
- Docker Compose -tuonti, uudelleenbuildaus, kind-kuvan lataus
- Services, endpoints, ingress, port-forward UI:sta
- Roolit ja osioihin perustuva pääsy (view / operate / manage)
- Prometheus-metriikat API-prosessille
- 28 UI-kieltä (i18next)

## Edellytykset

- Docker Desktop (käynnissä)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Tarkista työkalut:

```bash
make install-tools
make doctor
```

## Paikallinen asennus

Koko pino: **kind-klusteri** (demo-kuormat) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Mitä kukin vaihe tekee:

| Komento | Toiminto |
|---|---|
| `make cluster-up` | Luo kind-klusterin `dpd-local`, vaihtaa kubectl:n kontekstiin `kind-dpd-local` |
| `make seed-demo` | Buildaa demo-shop-kuvat, lataa ne kindiin, soveltaa `demo/demo-shop/kubernetes` |
| `make docker-up` | Buildaa ja käynnistää Postgresin, API:n ja webin (nginx portissa `WEB_PORT`) |

Pysäytys tai nollaus:

```bash
make docker-down          # pysäytä Compose-pino
make cluster-down         # poista kind-klusteri
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # tyhjennä Postgres-volyymi
```

## Paikalliset URL:t

Oletusportti on **18480** (`WEB_PORT` tiedostossa `.env`).

| URL | Mitä |
|---|---|
| http://localhost:18480 | Web UI (kirjautuminen) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus-metriikat (API) |
| http://localhost:30081 | demo-shop web (NodePort kindissä, `make seed-demo` jälkeen) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (pääsy hostilta, tiedostosta `.env`) |

Oletuskehityskäyttäjät (vain seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Paikallinen kehitys (ilman Docker UI:ta)

API ja web ajetaan hostilla. Postgres voi pysyä Dockerissa.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Mitä |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Hyödylliset komennot

```bash
make docker-logs          # seuraa API / web / Postgres -lokeja
make lint                 # TypeScript lint (kaikki paketit)
make test                 # yksikkötestit
make test-integration     # API + kind (API :3000, Postgres vaaditaan)
make test-e2e             # Playwright (web :5173)
make helm-lint            # lint Helm chart
make helm-install         # asenna chart kindiin (vaihtoehto docker-up:lle)
make cluster-down         # poista kind-klusteri
```

Uudelleenbuildaus koodimuutosten jälkeen:

```bash
make docker-up
```

## Production

Katso [docs/deploy.md](../deploy.md) Helmistä, migraatioista ja `create-admin`:sta.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Esimerkit

| Polku | Mitä se on |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seedattu kindiin |
| `demo/weather-station` | Pieni compose-pino tuontiharjoitteluun |
| `demo/todo-board` | Minimaalinen frontend + API -esimerkki |
| `examples/kubernetes/` | kind config, RBAC-esimerkit |

```bash
make demo-load
make seed-demo
```

## Pino

| Kerros | Teknologia |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (käyttäjät, roolit) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arkkitehtuuri

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Frontend ei koskaan kutsu klusteria suoraan. API pakottaa JWT-autentikoinnin osioihin perustuvilla oikeuksilla. Kubernetes ServiceAccount käyttää least-privilege RBAC:ia (katso `examples/kubernetes/rbac.yaml`).

Lisätietoja: [docs/architecture.md](../architecture.md) ja [ADRs](../adr/)

## Dokumentaatio

| Dokumentti | Aihe |
|---|---|
| [Architecture](../architecture.md) | Suunnittelu ja vaiheet |
| [Deploy](../deploy.md) | Helm, migraatiot, ensimmäinen admin |
| [Repository layout](../repository-structure.md) | Kansiorakenteen käytännöt |
| [Security](../../SECURITY.md) | Ilmoita haavoittuvuudesta |
| [Changelog](../../CHANGELOG.md) | Julkaisumuistiinpanot |

## Lisenssi

[MIT](../../LICENSE). Voit käyttää, kopioida, muokata ja jakaa tämän projektin mihin tahansa tarkoitukseen, myös kaupalliseen käyttöön, kunhan lisenssiteksti säilytetään.
