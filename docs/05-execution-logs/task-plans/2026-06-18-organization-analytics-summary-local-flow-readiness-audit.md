# organization-analytics-summary-local-flow-readiness-audit

## Scope

Audit whether `UC-ADV-ORG-ANALYTICS-SUMMARY` can advance from `partial` to `local_experience_ready`, based on current local source, tests, matrix evidence, and governance rules.

## Approval Boundary

- User requested serial execution of recommended items 1-2-3 in the current 2026-06-18 prompt.
- This task is primarily docs/state/readiness audit.
- Allowed edits: coverage matrix row metadata, project state, task queue, this task's plan/evidence/audit, and test-only fixture nullability repair if focused validation reveals stale contract fixtures.
- Blocked: product source changes, `.env*`, schema/drizzle/migration, package/lockfile/dependency, provider/model, release, staging/prod, payment, external-service, PR, force-push, Browser/Playwright runtime, full e2e runtime, and Cost Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Plan

1. Inspect the organization analytics matrix row and current source/test surfaces.
2. Run focused unit validation for organization analytics contracts, validators, mappers, models, repositories, services, and route handlers.
3. If focused validation exposes stale test fixtures that omit API-standard nullable fields, repair only those tests and rerun the same command.
4. Run e2e list-only discovery without Browser/Playwright runtime execution.
5. Decide whether the row can advance to `local_experience_ready`.
6. If not ready, keep the row `partial`, record exact blockers, and seed the next implementation task.
7. Run scoped formatting, diff, and Module Run v2 readiness gates.

## Risk Controls

- Do not claim local experience closure without UI entry and e2e evidence.
- Do not run Browser/Playwright runtime.
- Do not alter provider, release, staging/prod, payment, external-service, schema, migration, package, lockfile, or `.env*` surfaces.
