# organization-portal-admin-shell-entry-contract-tdd Plan

## Scope

Add the local admin organization portal shell entry under `/content/organization-portal`. The shell should link only to locally supported organization destinations and provide focused unit evidence plus list-only e2e discovery for `UC-ADV-ORG-PORTAL-ADMIN`.

## Approval Boundary

- Allowed: `src/app/(admin)/content/organization-portal/page.tsx`, `src/features/admin/organization-portal/**`, `tests/unit/organization-portal-admin-entry-surface.test.ts`, `e2e/organization-portal-local-flow.spec.ts`, local experience coverage matrix, project state, task queue, plan/evidence/audit.
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

1. RED: add `tests/unit/organization-portal-admin-entry-surface.test.ts` to assert route wiring, admin-session guard behavior, and shell links to locally supported organization destinations.
2. GREEN: add the route page and minimal admin portal feature component using existing admin content runtime helpers and design tokens.
3. Add `e2e/organization-portal-local-flow.spec.ts` for list-only discovery.
4. Update the local experience coverage matrix for `UC-ADV-ORG-PORTAL-ADMIN` without claiming `experience_closed`.
5. Run focused unit, `npm.cmd run test:e2e -- --list`, lint, typecheck, `git diff --check`, scoped Prettier, and Module Run v2 readiness gates.

## Risk Controls

- Do not start dev server or run Browser/Playwright runtime validation.
- Do not introduce unsupported portal destinations; links must stay within locally supported organization pages.
- Do not add dependencies, provider calls, schema/migration changes, scripts, or environment changes.
