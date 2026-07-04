<h1 align="center">Deployard</h1>

<p align="center">
  <strong>Plano de controlo de deployments Kubernetes</strong>
</p>

<p align="center">
  Criado para <strong>fins educativos e de portfolio</strong>.<br/>
  Uso, modificação e partilha livres sob a <a href="../../LICENSE">licença MIT</a>.
</p>

<p align="center">
  <sub>
    Explore deployments, rollbacks, estado dos pods e logs numa web UI tipada<br/>
    em vez de alternar entre kubectl, Compose e scripts avulsos.
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
  <strong>Português</strong> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.sk.md">Slovenčina</a> ·
  <a href="README.sl.md">Slovenščina</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.uk.md">Українська</a>
</p>

<p align="center">
  <img src="../assets/screenshot.png" alt="Painel de deployments Deployard" width="720" />
</p>

## Sobre

Deployard é um plano de controlo de deployments para Kubernetes. A web UI e a API tipada ficam à frente do cluster, para que browsers e scripts nunca acedam diretamente ao API server.

### O problema

O trabalho no cluster costuma significar saltar entre ferramentas. `kubectl` para rollouts e estado dos pods. Docker Compose para builds locais. Scripts shell para carregar imagens no kind. Separadores à parte para logs e port-forwards. Cada ferramenta tem a sua autenticação, formato de saída e modos de falha. Equipas pequenas sentem isso depressa. Equipas maiores tapam o buraco com dashboards internos, muitas vezes só de leitura ou presos a um ambiente.

Deployard foca-se no ciclo de vida do deployment: o que está a correr, qual revisão está ativa, saúde dos pods, rollbacks, tail de logs e levar um projeto Compose para o cluster sem checklist manual.

### O que obtém

| Área | O que o Deployard faz |
|---|---|
| Deployments | Lista, detalhe, histórico de revisões, escala, desativar, reiniciar, rollout undo |
| Pods | Estado em tempo real (watch), tail de logs via SSE, consola exec, browser de ficheiros |
| Import | Parse Compose, pré-visualização de manifests K8s, build de imagens, carga no kind, apply |
| Network | Services, endpoints, ingress, acesso no browser via port-forward controlado |
| Admin | Utilizadores, roles, permissões por secção (view / operate / manage) |
| Ops | Health e readiness probes, métricas Prometheus, logging estruturado |

O frontend nunca chama a Kubernetes API. O backend NestJS guarda o kubeconfig, gere sessões JWT com revogação de tokens em PostgreSQL e expõe apenas operações na whitelist. O mesmo padrão que por detrás de uma API de plataforma interna.

### Como está construído

pnpm monorepo: React e Vite no frontend, NestJS com `@kubernetes/client-node` no backend, DTOs partilhados em `@dpd/shared`, OpenAPI a partir dos controllers.

O desenvolvimento local está configurado como um ambiente real em pequena escala:

- **kind** corre workloads demo (`demo-shop`) no cluster
- **Docker Compose** corre Postgres, API e UI servida por nginx numa porta
- **Helm chart** (`deploy/helm/dpd`) para instalações em estilo production

Testes de integração batem numa API live contra kind. Playwright cobre login e o fluxo de deployments. Notas de design em [ADRs](../adr/).

### Para quem é

O projeto é para aprendizagem e portfolio. Mostra Kubernetes para além de `kubectl apply`: rollouts, RBAC, streaming, observability e entrega do stack com Docker, CI e Helm. Licença MIT. Faça fork, estenda ou reutilize partes na sua UI.

Lens ou Kubernetes Dashboard chegam se só precisa de um explorador genérico do cluster. O Deployard vai mais fundo em deployments, operações e o caminho de Compose para cluster.

## Funcionalidades

- Lista de deployments, histórico de revisões, rollout undo
- Estado dos pods com atualizações live, tail de logs (SSE), consola exec
- Import Docker Compose, rebuild, carga de imagens no kind
- Services, endpoints, ingress, port-forward a partir da UI
- Roles e acesso por secção (view / operate / manage)
- Métricas Prometheus para o processo da API
- 28 idiomas de UI (i18next)

## Pré-requisitos

- Docker Desktop (a correr)
- [kind](https://kind.sigs.k8s.io/), `kubectl`
- Node.js 20+, [pnpm](https://pnpm.io/) 9

Verificar ferramentas:

```bash
make install-tools
make doctor
```

## Configuração local

Stack completo: **cluster kind** (workloads demo) + **Docker Compose** (Postgres, API, web UI).

```bash
cp .env.example .env
make cluster-up
make seed-demo
make docker-up
```

O que cada passo faz:

| Comando | Ação |
|---|---|
| `make cluster-up` | Cria cluster kind `dpd-local`, muda kubectl para `kind-dpd-local` |
| `make seed-demo` | Constrói imagens demo-shop, carrega-as no kind, aplica `demo/demo-shop/kubernetes` |
| `make docker-up` | Constrói e inicia Postgres, API e web (nginx na porta de `WEB_PORT`) |

Parar ou repor:

```bash
make docker-down          # parar stack Compose
make cluster-down         # apagar cluster kind
docker compose --env-file .env -f deploy/docker/compose.yml down -v   # limpar volume Postgres
```

## URLs locais

A porta por omissão é **18480** (`WEB_PORT` em `.env`).

| URL | O quê |
|---|---|
| http://localhost:18480 | Web UI (login) |
| http://localhost:18480/api/docs | OpenAPI (Swagger) |
| http://localhost:18480/api/health | Liveness da API |
| http://localhost:18480/api/health/ready | Readiness API + Kubernetes |
| http://localhost:18480/api/metrics | Métricas Prometheus (API) |
| http://localhost:30081 | demo-shop web (NodePort no kind, após `make seed-demo`) |
| postgresql://dpd:dpd@localhost:5432/dpd | Postgres (acesso a partir do host, de `.env`) |

Utilizadores dev por omissão (só seed): `admin@dpd.local` / `Admin123!`, `user@dpd.local` / `User123!`

## Desenvolvimento local (sem Docker UI)

API e web correm no host. Postgres pode ficar no Docker.

```bash
pnpm install
cp .env.example .env
make cluster-up
make seed-demo
make docker-postgres-up
pnpm dev
```

| URL | O quê |
|---|---|
| http://localhost:5173 | Web UI (Vite dev server) |
| http://localhost:3000/api | API |
| http://localhost:3000/api/docs | OpenAPI |

## Comandos úteis

```bash
make docker-logs          # seguir logs API / web / Postgres
make lint                 # TypeScript lint (todos os pacotes)
make test                 # testes unitários
make test-integration     # API + kind (API em :3000, Postgres necessário)
make test-e2e             # Playwright (web em :5173)
make helm-lint            # lint Helm chart
make helm-install         # instalar chart no kind (alternativa a docker-up)
make cluster-down         # remover cluster kind
```

Rebuild após alterações de código:

```bash
make docker-up
```

## Production

Ver [docs/deploy.md](../deploy.md) para Helm, migrações e `create-admin`.

```bash
pnpm --filter @dpd/api create-admin admin@example.com 'YourPassword'
```

## Exemplos

| Caminho | O que é |
|---|---|
| `demo/demo-shop` | Postgres + API + web, seed no kind |
| `demo/weather-station` | Stack compose pequeno para praticar import |
| `demo/todo-board` | Amostra mínima frontend + API |
| `examples/kubernetes/` | kind config, amostras RBAC |

```bash
make demo-load
make seed-demo
```

## Stack

| Camada | Tech |
|---|---|
| Backend | NestJS, `@kubernetes/client-node`, Socket.IO, TypeORM |
| Frontend | React, Vite, TanStack Query, i18next |
| Data | PostgreSQL (utilizadores, roles) |
| Infra | Docker, kind, Helm, Prometheus |
| Monorepo | pnpm workspaces (`@dpd/api`, `@dpd/web`, `@dpd/shared`) |

## Arquitetura

```
React UI  →  NestJS API  →  Kubernetes API
                ↓
           PostgreSQL
```

O frontend nunca chama o cluster diretamente. A API impõe JWT auth com permissões por secção. O Kubernetes ServiceAccount usa least-privilege RBAC (ver `examples/kubernetes/rbac.yaml`).

Detalhes: [docs/architecture.md](../architecture.md) e [ADRs](../adr/)

## Documentação

| Doc | Tópico |
|---|---|
| [Architecture](../architecture.md) | Design e fases |
| [Deploy](../deploy.md) | Helm, migrações, primeiro admin |
| [Repository layout](../repository-structure.md) | Convenções de pastas |
| [Security](../../SECURITY.md) | Reportar vulnerabilidade |
| [Changelog](../../CHANGELOG.md) | Notas de release |

## Licença

[MIT](../../LICENSE). Pode usar, copiar, modificar e distribuir este projeto para qualquer fim, incluindo uso comercial, desde que preserve o aviso de licença.
