<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Plána rialaithe imscarthaí Kubernetes</strong>
</p>

<p align="center">
  Cruthaithe le haghaidh <strong>oideachais agus punann oibre</strong>.<br/>
  Saor le húsáid, le modhnú agus le roinnt faoin <a href="../../LICENSE">Ceadúnas MIT</a>.
</p>

<p align="center">
  <sub>
    Déan iniúchadh ar imscarthaí, rollbacks, stádas pod agus logaí trí chomhéadan gréasáin clóscríofa<br/>
    in ionad kubectl, Compose agus scripteanna aonuaire a mhalartú.
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
  <strong>Gaeilge</strong> ·
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
  <img src="../assets/screenshot.png" alt="Deais imscarthaí Deployard" width="720" />
</p>

## Faoi

Is plána rialaithe imscarthaí é Deployard do Kubernetes. Tá an comhéadan gréasáin agus an API clóscríofa os comhair an chláis: ní bhuaileann brabhsálaithe ná scripteanna leis an API server go díreach riamh.

### An fhadhb

Ciallaíonn obair ar an gclár de ghnáth léim idir uirlisí. `kubectl` le haghaidh rollouts agus stádas pod. Docker Compose le haghaidh tógálaí áitiúla. Scripteanna shell chun íomhánna a lódáil isteach i kind. Cluaisíní ar leith le haghaidh logaí agus port-forwards. Tá a fhíordheimhniú, a fhormáid aschuir agus a mhodhanna teipe féin ag gach uirlis. Braithíonn foirne bheaga é go tapa. Cuireann foirne níos mó deaisíní inmheánacha le chéile, is minic léite amháin nó faoi ghlas ar thimpeallacht amháin.

Díríonn Deployard ar shaolré an imscartha: cad atá ar siúl, cén leagan atá beo, sláinte pod, rollbacks, tail logaí, agus tionscadal Compose a thabhairt isteach sa chlár gan seicliosta láimhe.

### Cad a fhaigheann tú

| Réimse | Cad a dhéanann Deployard |
|---|---|
| Deployments | Liosta, sonraí, stair leaganacha, scála, díchumasú, atosú, rollout undo |
| Pods | Stádas beo (watch), tail logaí trí SSE, consól exec, brabhsálaí comhad |
| Import | Compos a pharsáil, réamhamharc ar mhanifests K8s, íomhánna a thógáil, lódáil isteach i kind, apply |
| Network | Services, endpoints, ingress, rochtain ón mbrabhsálaí trí port-forward rialaithe |
| Admin | Úsáideoirí, róil, ceadanna bunaithe ar rannáin (view / operate / manage) |
| Ops | Health agus readiness probes, méadracht Prometheus, logáil struchtúrtha |

Ní ghlaoann an frontend ar an API Kubernetes riamh. Coinníonn an backend NestJS an kubeconfig, ritheann sé seisiúin JWT le cúlú comharthaí i PostgreSQL, agus nochtann sé oibríochtaí ceadaithe amháin. An patrún céanna le API ardáin inmheánach.

### Conas atá sé tógtha

Monorepo pnpm: React agus Vite ar an frontend, NestJS le `@kubernetes/client-node` ar an backend, DTOanna comhroinnte i `@dpd/shared`, OpenAPI ó na controllers.

Tá forbairt áitiúil socraithe cosúil le timpeallacht bheag fhíor:

- Ritheann **kind** ualaí taispeána (`demo-shop`) sa chlár
- Ritheann **Docker Compose** Postgres, API agus UI faoi nginx ar phort amháin
- **Helm chart** (`deploy/helm/dpd`) le haghaidh suiteálacha stíl táirgeachta

Buailtear tástálacha comhtháthaithe le API beo trí kind. Clúdaíonn Playwright logáil isteach agus an sreabhadh deployments. Tá nótaí dearaidh sna [ADRs](../adr/).

### Cé dó é seo

Tá an tionscadal le haghaidh foghlama agus punann oibre. Taispeánann sé Kubernetes thar `kubectl apply`: rollouts, RBAC, sruthú, observability, agus an cruach a sheachadadh trí Docker, CI agus Helm. Ceadúnas MIT. Forkáil, leathnaigh nó athúsáid codanna i do chomhéadan féin.

Is leor Lens nó Kubernetes Dashboard má theastaíonn uait taiscéalaí cláir ghinearálta amháin. Téann Deployard níos doimhne ar imscarthaí, oibríochtaí agus an bealach ó Compose go dtí an clár.

## Gnéithe

- Liosta imscarthaí, stair leaganacha, rollout undo
- Stádas pod le nuashonruithe beo, tail logaí (SSE), consól exec
- Iompórtáil Docker Compose, atógáil, lódáil íomhá kind
- Services, endpoints, ingress, port-forward ón UI
- Róil agus rochtain bunaithe ar rannáin (view / operate / manage)
- Méadracht Prometheus don phróiseas API
- 28 teanga UI (i18next)

## Réamhriachtanais

- Docker Desktop (ag rith)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Seiceáil na huirlisí:

```bash
make install-tools
make doctor
```

## Socruithe áitiúil

Cruach iomlán: **clár kind** (ualach taispeána) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Cad a dhéanann gach céim:

| Ordú | Gníomh |
|---|---|
| `make cluster-up` | Cruthaíonn clár kind `dpd-local`, aistríonn kubectl go `kind-dpd-local` |
| `make seed-demo` | Tógann íomhánna demo-shop, lódálann isteach i kind, cuireann `demo/demo-shop/kubernetes` i bhfeidhm |
| `make docker-up` | Tógann agus tosaíonn Postgres, API agus web (nginx ar phort ó `WEB_PORT`) |

Stop nó athshocraigh:

```bash
make docker-down          # stop an cruach Compose
make cluster-down         # scrios an clár kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # glan toilleadh Postgres
```

## URLanna áitiúla

Is é **18480** an port réamhshocraithe (`WEB_PORT` i `.env`).

| URL | Cad é |
|---|---|
| http://localhost:18480 | Web UI (logáil isteach) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Méadracht Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort i kind, tar éis `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (rochtain ón óstach, ó `.env`) |

Úsáideoirí forbartha réamhshocraithe (seed amháin): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Forbairt áitiúil (gan Docker UI)

Ritheann API agus web ar an óstach. Is féidir Postgres a choinneáil i Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Cad é |
|---|---|
| http://localhost:5173 | Web UI (freastalaí dev Vite) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Orduithe úsáideacha

```bash
make docker-logs          # lean logaí API / web / Postgres
make lint                 # lint TypeScript (gach pacáiste)
make test                 # tástálacha aonad
make test-integration     # API + kind (API ar :3000, Postgres ag teastáil)
make test-e2e             # Playwright (web ar :5173)
make helm-lint            # lint chart Helm
make helm-install         # suiteáil chart i kind (malartach ar docker-up)
make cluster-down         # bain an clár kind
```

Atógáil tar éis athruithe cód:

```bash
make docker-up
```

## Táirgeadh

Féach [docs/deploy.md](../deploy.md) le haghaidh Helm, migráidí agus `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Samplaí

| Conair | Cad é |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed isteach i kind |
| `demo/weather-station` | Cruach compose bheag le haghaidh cleachtadh iompórtála |
| `demo/todo-board` | Sampla frontend + API íosta |
| `examples/kubernetes/` | Config kind, samplaí RBAC |

```bash
make demo-load
make seed-demo
```

## Cruach

| Sraith | Teicneolaíocht |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (úsáideoirí, róil) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Ailtireacht

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Ní ghlaoann an frontend ar an gclár go díreach riamh. Cuireann an API JWT auth i bhfeidhm le ceadanna bunaithe ar rannáin. Úsáideann an ServiceAccount Kubernetes RBAC least-privilege (féach `examples/kubernetes/rbac.yaml`).

Sonraí: [docs/architecture.md](../architecture.md) agus [ADRs](../adr/)

## Doiciméadú

| Doiciméad | Ábhar |
|---|---|
| [Architecture](../architecture.md) | Dearadh agus céimeanna |
| [Deploy](../deploy.md) | Helm, migráidí, admin céad |
| [Repository layout](../repository-structure.md) | Coinníollacha fillteán |
| [Security](../../SECURITY.md) | Tuairiscigh leochaileacht |
| [Changelog](../../CHANGELOG.md) | Nótaí eisiúna |

## Ceadúnas

[MIT](../../LICENSE). Féadfaidh tú an tionscadal seo a úsáid, a chóipeáil, a mhodhnú agus a dháileadh ar aon chuspóir, lena n-áirítear úsáid tráchtála, fad is a choinnítear an fógra ceadúnais.
