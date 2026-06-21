# Mistake Book Cookie Session Auto Seed Plan

## Scope

Register the student mistake_book cookie session repair as a task-scoped Module Run v2 queue item before touching
business code or tests.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Plan

1. Add one queue task for the scoped mistake_book session repair.
2. Point `project-state.yaml currentTask` to that task.
3. Limit allowed files to the specific student page, focused unit test, state files, and task evidence documents.
4. Record seed evidence and audit review with redacted command summaries only.
5. Validate and commit this seed separately from the repair implementation.

## Boundaries

- No browser runtime, dev server, e2e runtime, database access, schema, migration, dependency, env, provider, payment,
  deploy, PR, or force-push work.
- Cost Calibration Gate remains blocked.
