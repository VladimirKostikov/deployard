<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Plan de contrôle des déploiements Kubernetes</strong>
</p>

<p align="center">
  Créé à des fins <strong>pédagogiques et portfolio</strong>.<br/>
  Libre d'utilisation, de modification et de partage sous la <a href="../../LICENSE">licence MIT</a>.
</p>

<p align="center">
  <sub>
    Explorez les déploiements, rollbacks, statut des pods et logs via une interface web typée<br/>
    au lieu de jongler entre kubectl, Compose et des scripts ponctuels.
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
  <strong>Français</strong> ·
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
  <img src="../assets/screenshot.png" alt="Tableau de bord des déploiements Deployard" width="720" />
</p>

## À propos

Deployard est un plan de contrôle des déploiements pour Kubernetes. L'interface web et l'API typée se placent devant le cluster : navigateurs et scripts n'accèdent jamais directement à l'API server.

### Le problème

Travailler sur un cluster, c'est souvent enchaîner les outils. `kubectl` pour les rollouts et le statut des pods. Docker Compose pour les builds locaux. Des scripts shell pour charger les images dans kind. Des onglets séparés pour les logs et les port-forwards. Chaque outil a sa propre authentification, son format de sortie et ses modes de panne. Les petites équipes le ressentent vite. Les plus grandes bricolent des tableaux de bord internes, souvent en lecture seule ou verrouillés sur un seul environnement.

Deployard se concentre sur le cycle de vie du déploiement : ce qui tourne, quelle révision est active, la santé des pods, les rollbacks, le tail des logs et l'import d'un projet Compose dans le cluster sans checklist manuelle.

### Ce que vous obtenez

| Domaine | Ce que fait Deployard |
|---|---|
| Deployments | Liste, détail, historique des révisions, scale, désactivation, redémarrage, rollout undo |
| Pods | Statut en direct (watch), tail des logs via SSE, console exec, explorateur de fichiers |
| Import | Analyse Compose, aperçu des manifests K8s, build des images, chargement dans kind, apply |
| Network | Services, endpoints, ingress, accès navigateur via port-forward contrôlé |
| Admin | Utilisateurs, rôles, permissions par section (view / operate / manage) |
| Ops | Health et readiness probes, métriques Prometheus, logging structuré |

Le frontend n'appelle jamais l'API Kubernetes. Le backend NestJS détient le kubeconfig, gère des sessions JWT avec révocation des tokens dans PostgreSQL et n'expose que les opérations autorisées. Même schéma qu'avec une API plateforme interne.

### Comment c'est construit

Monorepo pnpm : React et Vite côté frontend, NestJS avec `@kubernetes/client-node` côté backend, DTO partagés dans `@dpd/shared`, OpenAPI généré depuis les controllers.

Le dev local reproduit un petit environnement réel :

- **kind** exécute les charges de démo (`demo-shop`) dans le cluster
- **Docker Compose** lance Postgres, l'API et l'UI servie par nginx sur un seul port
- **Helm chart** (`deploy/helm/dpd`) pour des installs de type production

Les tests d'intégration frappent une API live via kind. Playwright couvre la connexion et le flux deployments. Les notes de conception sont dans les [ADRs](../adr/).

### Pour qui

Le projet vise l'apprentissage et le portfolio. Il montre Kubernetes au-delà de `kubectl apply` : rollouts, RBAC, streaming, observability et livraison de la stack via Docker, CI et Helm. Licence MIT. Forkez, étendez ou réutilisez des morceaux dans votre propre UI.

Lens ou Kubernetes Dashboard suffisent si vous voulez juste un explorateur de cluster générique. Deployard va plus loin sur les déploiements, les opérations et le chemin de Compose vers le cluster.

## Fonctionnalités

- Liste des deployments, historique des révisions, rollout undo
- Statut des pods avec mises à jour live, tail des logs (SSE), console exec
- Import Docker Compose, rebuild, chargement d'images dans kind
- Services, endpoints, ingress, port-forward depuis l'UI
- Rôles et accès par section (view / operate / manage)
- Métriques Prometheus pour le processus API
- 28 langues d'interface (i18next)

## Prérequis

- Docker Desktop (en cours d'exécution)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Vérifier les outils :

```bash
make install-tools
make doctor
```

## Installation locale

Stack complète : **cluster kind** (charges de démo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

Rôle de chaque étape :

| Commande | Action |
|---|---|
| `make cluster-up` | Crée le cluster kind `dpd-local`, bascule kubectl sur `kind-dpd-local` |
| `make seed-demo` | Build les images demo-shop, les charge dans kind, applique `demo/demo-shop/kubernetes` |
| `make docker-up` | Build et démarre Postgres, API et web (nginx sur le port de `WEB_PORT`) |

Arrêt ou réinitialisation :

```bash
make docker-down          # arrêter la stack Compose
make cluster-down         # supprimer le cluster kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # effacer le volume Postgres
```

## URLs locales

Le port par défaut est **18480** (`WEB_PORT` dans `.env`).

| URL | Quoi |
|---|---|
| http://localhost:18480 | Web UI (connexion) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Métriques Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort dans kind, après `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (accès hôte, depuis `.env`) |

Utilisateurs dev par défaut (seed uniquement) : `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Développement local (sans Docker UI)

API et web tournent sur l'hôte. Postgres peut rester dans Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | Quoi |
|---|---|
| http://localhost:5173 | Web UI (serveur dev Vite) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Commandes utiles

```bash
make docker-logs          # suivre les logs API / web / Postgres
make lint                 # lint TypeScript (tous les packages)
make test                 # tests unitaires
make test-integration     # API + kind (API sur :3000, Postgres requis)
make test-e2e             # Playwright (web sur :5173)
make helm-lint            # lint du chart Helm
make helm-install         # installer le chart dans kind (alternative à docker-up)
make cluster-down         # supprimer le cluster kind
```

Rebuild après modification du code :

```bash
make docker-up
```

## Production

Voir [docs/deploy.md](../deploy.md) pour Helm, les migrations et `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Exemples

| Chemin | Description |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seedé dans kind |
| `demo/weather-station` | Petite stack compose pour s'entraîner à l'import |
| `demo/todo-board` | Exemple minimal frontend + API |
| `examples/kubernetes/` | Config kind, échantillons RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Couche | Technologie |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (utilisateurs, rôles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Architecture

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

Le frontend n'appelle jamais le cluster directement. L'API impose l'auth JWT avec permissions par section. Le ServiceAccount Kubernetes utilise un RBAC least-privilege (voir `examples/kubernetes/rbac.yaml`).

Détails : [docs/architecture.md](../architecture.md) et [ADRs](../adr/)

## Documentation

| Document | Sujet |
|---|---|
| [Architecture](../architecture.md) | Conception et phases |
| [Deploy](../deploy.md) | Helm, migrations, premier admin |
| [Repository layout](../repository-structure.md) | Conventions de dossiers |
| [Security](../../SECURITY.md) | Signaler une vulnérabilité |
| [Changelog](../../CHANGELOG.md) | Notes de version |

## Licence

[MIT](../../LICENSE). Vous pouvez utiliser, copier, modifier et distribuer ce projet à toute fin, y compris commerciale, tant que l'avis de licence est conservé.
