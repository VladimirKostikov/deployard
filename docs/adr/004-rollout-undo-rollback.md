# ADR 004: Rollout undo for deployment rollback

## Status

Accepted

## Context

`spec.rollbackTo` was removed from modern Kubernetes APIs.

## Decision

Rollback finds the target ReplicaSet by `deployment.kubernetes.io/revision` and patches the Deployment pod template to match that ReplicaSet (equivalent to `kubectl rollout undo --to-revision`).

## Consequences

- Works on current kind/K8s versions
- Requires list/watch/patch on deployments and replicasets
- Rollback is a write operation guarded by RBAC and optional API auth
