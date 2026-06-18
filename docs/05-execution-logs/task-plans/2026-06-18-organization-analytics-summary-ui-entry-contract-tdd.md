# organization-analytics-summary-ui-entry-contract-tdd Plan

## Scope

Add the local admin UI entry for organization analytics summary under `/content/organization-analytics`, with focused unit evidence and list-only e2e discovery. This task closes the UI entry gap for `UC-ADV-ORG-ANALYTICS-SUMMARY`; it does not execute runtime Browser/Playwright validation.

## Approval Boundary

- Allowed: `src/app/(admin)/content/organization-analytics/page.tsx`, `src/features/admin/organization-analytics/**`, `tests/unit/organization-analytics-admin-entry-surface.test.ts`, `e2e/organization-analytics-local-flow.spec.ts`, local experience coverage matrix, project state, task queue, plan/evidence/audit.
- Blocked: `.env*`, package/lockfile/dependency, schema/drizzle/migration, scripts, provider/model, release, staging/prod/cloud/deploy, payment, external-service, PR, force-push, dev server, Browser/Playwright runtime, full e2e runtime, and Cost Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `superpowers:test-driven-development`

## TDD Plan

1. RED: add `organization-analytics-admin-entry-surface.test.ts` to assert the admin route imports and renders a concrete analytics summary UI entry with stable headings, status states, and links/controls expected by local admin navigation.
2. GREEN: add the route page and minimal admin feature component using existing admin content runtime helpers and design tokens.
3. Add or update the list-only e2e spec surface so `npm.cmd run test:e2e -- --list` discovers the organization analytics local flow without running it.
4. Update local experience coverage matrix to point the UI entry to the implemented route and evidence.
5. Run focused unit command, `npm.cmd run test:e2e -- --list`, lint, typecheck, diff check, and Module Run v2 readiness gates.

## Risk Controls

- Do not start dev server or run Browser/Playwright runtime validation.
- Keep UI implementation local and deterministic; no provider/model calls and no database/schema work.
- Use existing admin styling/runtime patterns and avoid new dependencies.
