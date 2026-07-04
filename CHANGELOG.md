# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Monorepo scaffold: `apps/api`, `apps/web`, `packages/shared`
- NestJS Kubernetes proxy API with Swagger, Repository/Factory/Mapper patterns
- React dashboard with i18n (ru, en, de), light/dark/system theme
- Deployment revision history and rollback confirmation dialog
- Pod log viewer via SSE
- Docker deployment via `deploy/docker/compose.yml`
- `pnpm build` rebuilds Docker images on every build
- Local kind cluster workflow and demo deployment
- Repository community files and CI scaffold
