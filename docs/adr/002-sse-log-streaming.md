# ADR 002: SSE for pod log streaming

## Status

Accepted

## Context

Log viewer needs near real-time tail behavior from the browser.

## Decision

Use Server-Sent Events from `GET /pods/:name/logs` with JSON payloads per line.

## Consequences

- Simpler than WebSocket for one-way streams
- Works through nginx with buffering disabled
- Active streams are closed on graceful API shutdown
