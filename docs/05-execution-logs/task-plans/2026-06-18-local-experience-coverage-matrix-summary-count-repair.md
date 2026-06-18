# local-experience-coverage-matrix-summary-count-repair

## Scope

Repair the local experience coverage matrix summary counts so the top-level current fact summary matches the actual matrix rows after the organization-training experience closure.

## Approval Boundary

- User requested serial execution of the recommended 1-2-3 sequence in the current 2026-06-18 prompt.
- This task is docs/state-only and low risk.
- Allowed edits: coverage matrix summary, project state, task queue, and this task's plan/evidence/audit.
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

1. Recount actual matrix row statuses from `matrix[*].status`.
2. Update `currentFactRefresh.statusSummary` to match actual row counts.
3. Record evidence and audit with no release-readiness claim.
4. Run scoped formatting, diff, and Module Run v2 readiness gates.

## Risk Controls

- Do not alter use-case row semantics.
- Do not mark any additional use case `experience_closed`.
- Keep release and high-risk gates blocked.
