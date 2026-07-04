# ADR 001: Backend as controlled K8s proxy

## Status

Accepted

## Context

The UI needs deployment operations without exposing cluster credentials to the browser.

## Decision

All Kubernetes access goes through NestJS repositories with whitelisted verbs. The frontend uses REST, SSE, and WebSocket against the API only.

## Consequences

- Easier RBAC and audit boundaries
- Extra network hop vs in-cluster operators
- Backend must map K8s errors to stable API codes
