# Advanced Organization Analytics Repository Factory Boundary TDD Seeding

## Scope

- Task id: `advanced-organization-analytics-repository-factory-boundary-tdd-seeding`
- Approved by: user prompt "批准执行" in this Codex thread.
- Task type: docs/state-only seeding.
- Goal: seed one pending TDD implementation task for the organization analytics Postgres repository factory boundary.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Plan

1. Confirm repository readiness on `master`, clean state, matching `HEAD/master/origin/master`, and no `codex/*` refs.
2. Create a short-lived branch for docs/state-only seeding.
3. Update `project-state.yaml` to record the seeding closeout and next recommended pending task.
4. Append a closed seeding task and a new pending implementation task to `task-queue.yaml`.
5. Write evidence and audit files for the seeding task.
6. Run the declared validation commands and close out through local commit, fast-forward merge, push, and branch cleanup if gates pass.

## Boundaries

- No source implementation.
- No `.env*` access, output, summary, or modification.
- No package, lockfile, schema, migration, Drizzle, dependency, provider, model, DB, e2e, Browser, dev-server, staging, prod, cloud, deploy, payment, external-service, PR, force push, or Cost Calibration Gate work.
- The seeded implementation task must require TDD and remain scoped to repository factory boundary contract and unit tests.
