# ADR 006: Multi-cluster via kubeconfig contexts

## Status

Accepted

## Context

Some operators manage multiple clusters from one kubeconfig file.

## Decision

Load all allowed contexts at startup into a client pool. API consumers pass `?cluster=<context>` or `X-K8s-Cluster`. Web UI shows a selector when more than one context is available.

`K8S_ALLOWED_CONTEXTS` optionally restricts which contexts are exposed.

## Consequences

- No separate kubeconfig files per request
- Context switching is explicit per HTTP request / WebSocket subscription
- True multi-cluster federation is out of scope
