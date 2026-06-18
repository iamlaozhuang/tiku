# organization-portal-admin-local-entry-readiness-audit Plan

## Scope

Audit whether `UC-ADV-ORG-PORTAL-ADMIN` can advance from `partial` to `local_experience_ready`, based on current local source, matrix evidence, governance records, and allowed list-only test discovery.

## Approval Boundary

- User requested serial execution of recommended items 1-2-3 in the current 2026-06-18 prompt.
- This task is docs/state/readiness audit only.
- Allowed edits: coverage matrix row metadata, project state, task queue, and this task's plan/evidence/audit.
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
- `docs/05-execution-logs/evidence/2026-06-14-unified-advanced-auth-org-training-blocked-planning.md`

## Plan

1. Inspect the organization portal matrix row and current source/test surfaces.
2. Run focused unit validation for existing organization lifecycle, organization training UI, and organization analytics route evidence.
3. Run e2e list-only discovery without Browser/Playwright runtime execution.
4. Decide whether the row can advance to `local_experience_ready`.
5. If not ready, keep the row `partial`, record exact blockers, and seed the next local portal shell task behind the analytics UI task.
6. Run scoped formatting, diff, and Module Run v2 readiness gates.

## Risk Controls

- Do not claim local experience readiness without a real organization portal admin shell entry and e2e evidence.
- Do not run Browser/Playwright runtime.
- Do not alter provider, release, staging/prod, payment, external-service, schema, migration, package, lockfile, source, or `.env*` surfaces.
