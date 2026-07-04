<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Control plane για Kubernetes deployment</strong>
</p>

<p align="center">
  Δημιουργήθηκε για <strong>εκπαιδευτικούς σκοπούς και portfolio</strong>.<br/>
  Ελεύθερη χρήση, τροποποίηση και διανομή υπό την <a href="../../LICENSE">MIT License</a>.
</p>

<p align="center">
  <sub>
    Deployments, rollbacks, κατάσταση pod και logs μέσα από typed web UI<br/>
    αντί να αλλάζετε συνεχώς kubectl, Compose και one-off scripts.
  </sub>
</p>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.bg.md">Български</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.da.md">Dansk</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <strong>Ελληνικά</strong> ·
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
  <img src="../assets/screenshot.png" alt="Dashboard deployments του Deployard" width="720" />
</p>

## Σχετικά

Το Deployard είναι control plane για deployment στο Kubernetes. Το web UI και το typed API βρίσκονται μπροστά από το cluster, ώστε browsers και scripts να μην χτυπούν τον API server απευθείας.

### Το πρόβλημα

Η δουλειά με cluster συνήθως σημαίνει άλματα ανάμεσα σε εργαλεία. `kubectl` για rollouts και κατάσταση pod. Docker Compose για local builds. Shell scripts για load εικόνων στο kind. Ξεχωριστά tabs για logs και port-forward. Κάθε εργαλείο έχει δικό του auth, μορφή εξόδου και τρόπους αποτυχίας. Μικρές ομάδες το νιώθουν γρήγορα. Μεγαλύτερες το καλύπτουν με εσωτερικά dashboards, συχνά read-only ή δεμένα σε ένα περιβάλλον.

Το Deployard εστιάζει στον κύκλο ζωής του deployment: τι τρέχει, ποια revision είναι live, υγεία pod, rollbacks, log tailing και μεταφορά Compose project στο cluster χωρίς manual checklist.

### Τι παίρνετε

| Τομέας | Τι κάνει το Deployard |
|---|---|
| Deployments | Λίστα, λεπτομέρειες, ιστορικό revisions, scale, disable, restart, rollout undo |
| Pods | Live status (watch), log tail μέσω SSE, exec console, file browser |
| Import | Parse Compose, preview K8s manifests, build εικόνων, load στο kind, apply |
| Network | Services, endpoints, ingress, πρόσβαση από browser μέσω controlled port-forward |
| Admin | Χρήστες, ρόλοι, δικαιώματα ανά section (view / operate / manage) |
| Ops | Health και readiness probes, Prometheus metrics, structured logging |

Το frontend δεν καλεί ποτέ το Kubernetes API. Το NestJS backend κρατά το kubeconfig, JWT sessions με token revocation στο PostgreSQL και εκθέτει μόνο whitelisted operations. Ίδιο μοτίβο με internal platform API.

### Πώς είναι φτιαγμένο

pnpm monorepo: React και Vite στο frontend, NestJS με `@kubernetes/client-node` στο backend, κοινά DTOs στο `@dpd/shared`, OpenAPI από controllers.

Η τοπική ανάπτυξη ρυθμίζεται σαν μικρό πραγματικό περιβάλλον:

- **kind** τρέχει demo workloads (`demo-shop`) στο cluster
- **Docker Compose** τρέχει Postgres, API και UI μέσω nginx σε ένα port
- **Helm chart** (`deploy/helm/dpd`) για production installs

Integration tests χτυπούν live API απέναντι στο kind. Το Playwright καλύπτει login και deployments flow. Σημειώσεις σχεδιασμού στο [ADRs](../adr/).

### Για ποιον είναι

Το project είναι για μάθηση και portfolio. Δείχνει Kubernetes πέρα από `kubectl apply`: rollouts, RBAC, streaming, observability και shipping του stack με Docker, CI και Helm. MIT license. Fork, επέκταση ή επαναχρησιμοποίηση τμημάτων στο δικό σας UI.

Το Lens ή το Kubernetes Dashboard αρκούν αν θέλετε μόνο generic cluster explorer. Το Deployard πάει βαθύτερα σε deployments, operations και τη διαδρομή από Compose σε cluster.

## Δυνατότητες

- Λίστα deployments, ιστορικό revisions, rollout undo
- Κατάσταση pod με live updates, log tail (SSE), exec console
- Docker Compose import, rebuild, kind image load
- Services, endpoints, ingress, port-forward από το UI
- Ρόλοι και πρόσβαση ανά section (view / operate / manage)
- Prometheus metrics για τη διαδικασία API
- 28 γλώσσες UI (i18next)

## Προαπαιτούμενα

- Docker Desktop (τρέχει)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Έλεγχος εργαλείων:

```bash
make install-tools
make doctor
```

## Τοπική εγκατάσταση

Πλήρες stack: **kind cluster** (demo workloads) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Τι κάνει κάθε βήμα:

| Εντολή | Ενέργεια |
|---|---|
| `make cluster-up` | Δημιουργεί kind cluster `dpd-local`, αλλάζει kubectl σε `kind-dpd-local` |
| `make seed-demo` | Κάνει build demo-shop images, load στο kind, apply `demo/demo-shop/kubernetes` |
| `make docker-up` | Κάνει build και ξεκινά Postgres, API και web (nginx στο port από `WEB_PORT`) |

Διακοπή ή reset:

```bash
make docker-down          # stop Compose stack
make cluster-down         # delete kind cluster
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # wipe Postgres volume
```

## Τοπικά URL

Προεπιλεγμένο port **18480** (`WEB_PORT` στο `.env`).

| URL | Τι |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | API liveness |
| http://localhost:18480/api/health/ready | API + Kubernetes readiness |
| http://localhost:18480/api/metrics | Prometheus metrics (API) |
| http://localhost:30081 | demo-shop web (NodePort στο kind, μετά το `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (host access, από `.env`) |

Προεπιλεγμένοι dev users (μόνο seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Τοπική ανάπτυξη (χωρίς Docker UI)

API και web τρέχουν στο host. Το Postgres μπορεί να μείνει στο Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Τι |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Χρήσιμες εντολές

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

Rebuild μετά από αλλαγές κώδικα:

```bash
make docker-up
```

## Production

Δείτε [docs/deploy.md](../deploy.md) για Helm, migrations και `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Παραδείγματα

| Διαδρομή | Τι είναι |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed στο kind |
| `demo/weather-station` | Μικρό compose stack για εξάσκηση import |
| `demo/todo-board` | Minimal frontend + API sample |
| `examples/kubernetes/` | kind config, RBAC samples |

```bash
make demo-load
make seed-demo
```

## Stack

| Επίπεδο | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (users, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Αρχιτεκτονική

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Το frontend δεν καλεί ποτέ το cluster απευθείας. Το API επιβάλλει JWT auth με δικαιώματα ανά section. Το Kubernetes ServiceAccount χρησιμοποιεί least-privilege RBAC (δείτε `examples/kubernetes/rbac.yaml`).

Λεπτομέρειες: [docs/architecture.md](../architecture.md) και [ADRs](../adr/)

## Τεκμηρίωση

| Doc | Θέμα |
|---|---|
| [Architecture](../architecture.md) | Design και φάσεις |
| [Deploy](../deploy.md) | Helm, migrations, first admin |
| [Repository layout](../repository-structure.md) | Folder conventions |
| [Security](../../SECURITY.md) | Report a vulnerability |
| [Changelog](../../CHANGELOG.md) | Release notes |

## Άδεια

[MIT](../../LICENSE). Μπορείτε να χρησιμοποιείτε, αντιγράφετε, τροποποιείτε και διανέμετε το project για οποιονδήποτε σκοπό, συμπεριλαμβανομένης εμπορικής χρήσης, εφόσον διατηρείται η ειδοποίηση άδειας.
