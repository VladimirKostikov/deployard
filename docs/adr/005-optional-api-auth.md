# ADR 005: JWT session authentication

## Status

Accepted (supersedes optional static-token design)

## Context

The API must authenticate every request except explicitly public routes (health, login, deploy webhook). Local development should still work with seeded users; production needs migrations and `create-admin`.

## Decision

- **Mandatory JWT auth** on protected routes via global `JwtAuthGuard` and `PermissionsGuard`
- **httpOnly cookie** (`access_token`) — not localStorage
- **PostgreSQL** stores users, roles, and section permissions (`view` / `operate` / `manage`)
- **Token revocation** persisted in `revoked_tokens` (logout invalidates `jti`)
- **Section-based RBAC** aligned with `@dpd/shared` `AppSection` / `AccessLevel`
- **Deploy webhook** remains `@Public()` but requires `X-Deploy-Secret` header

Health endpoints stay public. Metrics require admin JWT unless `METRICS_PUBLIC=true`.

## Consequences

- CI and production must provide `DATABASE_URL` and run migrations (`DB_MIGRATE=true`)
- Dev seed users via `DB_SEED=true` (`admin@dpd.local`, `user@dpd.local`)
- Multi-replica logout works because revocation is stored in Postgres
- Frontend never calls the Kubernetes API directly
