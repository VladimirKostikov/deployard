# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.x     | Yes       |

## Reporting a vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Send a private report with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Scope

In scope:

- `@dpd/api` Kubernetes API proxy and RBAC boundaries
- Authentication and authorization (JWT sessions, section RBAC, deploy webhook)
- Log streaming, deployment rollback, and pod exec endpoints
- Compose import path allowlist and file discovery roots

Out of scope:

- Vulnerabilities in third-party dependencies (report upstream)
- Misconfigured cluster RBAC outside this application
