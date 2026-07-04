# ADR 003: kind for local and CI clusters

## Status

Accepted

## Context

Portfolio reviewers need reproducible Kubernetes without cloud cost.

## Decision

Use kind with checked-in cluster config and demo deployment manifest. CI creates the same cluster for integration and E2E jobs.

## Consequences

- Fast feedback in GitHub Actions
- TLS and networking quirks handled via `K8S_SKIP_TLS_VERIFY`
- Requires Docker on developer machines
