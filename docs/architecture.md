# Architecture — Deployard

## What & Why

A **control-plane UI** for Kubernetes deployments — not a generic K8s dashboard. The focus is the **deployment lifecycle**:

| Capability | K8s API | Value for interviews |
|---|---|---|
| Deployment list & detail | `apps/v1/Deployment` | Resource modeling |
| Revision history | `ReplicaSet` annotations | Rollout strategy understanding |
| Rollback | rollout undo (template patch) | Write operations + RBAC |
| Pod status | `v1/Pod`, live watch | Scheduling, probes, OOMKilled |
| Log streaming | `Pod/logs` subresource | Streaming, backpressure |
| Health checks | probe fields on Pod spec | readiness vs liveness |

## High-Level Architecture

```
┌─────────────┐   REST + SSE + WS   ┌──────────────┐    K8s API     ┌───────────────┐
│  React Web  │ ───────────────────▶│  NestJS API  │ ──────────────▶│  K8s Cluster  │
│  (apps/web) │                     │  (apps/api)  │  SA + RBAC     │  (kind/Helm)  │
└─────────────┘                     └──────────────┘                └───────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  Prometheus  │
                                    │  /api/metrics│
                                    └──────────────┘
```

**Key decision**: Frontend never talks to K8s directly. Backend acts as a **controlled proxy** with whitelisted operations.

## Module Breakdown (Backend)

```
apps/api/src/modules/
├── deployments/     GET list, GET :name, GET :name/history, POST :name/rollback
├── pods/            GET by deployment, GET :name/logs (SSE), WS /api/ws (pod watch)
├── clusters/        GET list (kubeconfig contexts)
├── namespaces/      GET list
├── health/          GET /health, GET /health/ready
├── metrics/         GET /metrics (Prometheus)
└── auth/            JWT cookie sessions, section RBAC, logout revocation
```

## Implementation Phases

### Phase 0 — Scaffold ✅
Monorepo, NestJS + React, Cursor rules, README.

### Phase 1 — MVP Core ✅
K8s client, deployment list, pod status, namespace selector, Helm + kind.

### Phase 2 — Operations ✅
Revision history, rollout undo rollback, log streaming (SSE), integration tests.

### Phase 3 — Portfolio Polish ✅
Prometheus metrics + Grafana dashboard JSON, CI (unit + integration + E2E), ADRs, README screenshot.

### Phase 4 — Advanced ✅
JWT session auth with PostgreSQL, section RBAC, deploy webhook, multi-cluster context switching, WebSocket pod watch.

## ADRs

| ADR | Topic |
|---|---|
| [001](adr/001-backend-k8s-proxy.md) | Backend K8s proxy |
| [002](adr/002-sse-log-streaming.md) | SSE for logs |
| [003](adr/003-kind-local-cluster.md) | kind for local dev |
| [004](adr/004-rollout-undo-rollback.md) | Rollout undo rollback |
| [005](adr/005-optional-api-auth.md) | JWT session auth |
| [006](adr/006-multi-cluster-contexts.md) | Multi-cluster contexts |

## What Interviewers Look For

1. **K8s domain knowledge** — rollout strategies, ReplicaSet ↔ Deployment relationship
2. **Security** — RBAC least privilege, JWT sessions, section permissions, no arbitrary API proxy
3. **Production readiness** — health checks, metrics, graceful SSE shutdown, CI
4. **DevEx** — one-command local setup, documented architecture, E2E tests
5. **API design** — RESTful, OpenAPI, structured error codes
