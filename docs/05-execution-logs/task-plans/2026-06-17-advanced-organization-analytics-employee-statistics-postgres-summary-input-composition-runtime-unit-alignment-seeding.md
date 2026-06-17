# Advanced organization analytics employee statistics Postgres summary input composition runtime unit alignment seeding plan

## Scope

- Task: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding`
- Branch: `codex/organization-analytics-employee-summary-recheck-seeding`
- Approved action: docs/state-only seeding, local validation, local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, fetch prune, and next-work recommendation.
- Seed exactly one pending task: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-tdd`.

## Read Before Edit

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
- Latest employee statistics Postgres runtime wiring evidence and audit.
- Latest employee statistics Postgres summary input composition TDD evidence and audit.
- Focused route unit diagnostic output from this branch.
- Relevant repository/service focused tests and runtime entrypoint, read-only.

## Local State Check

- Baseline branch: `master`
- Baseline `HEAD`, `master`, and `origin/master`: `e58ee1282c0039396c485b43a37808c0e29e5dbf`
- Local/remote `codex/*` refs before branch creation: none.
- Queue pending count before this seeding task: `0`.

## Implementation Plan

1. Add this task plan before durable state edits.
2. Update `project-state.yaml` with the current docs/state seeding task, current accepted ancestor repository SHA, progress map entries, and handoff to the seeded runtime unit alignment TDD task.
3. Append one closed seeding task and one pending runtime unit alignment TDD task to `task-queue.yaml`.
4. Write evidence and audit files for the seeding task.
5. Run the validation commands declared by the seeding task.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the merged short branch, fetch prune, and verify final repository state.

## Risk Controls

- No product source or test implementation changes.
- No App Router runtime wiring changes.
- No service, repository, mapper, validator, route, UI, schema, migration, drizzle, package, lockfile, dependency, provider/model, browser/e2e/dev-server, deployment, payment, external-service, PR, force push, quota/cost, or Cost Calibration Gate work.
- No real database connection or row/private data access.
- Evidence must stay summary-only and must not include public identifier inventories or private source data.

## Validation Commands

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding","status: closed","advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-tdd","status: pending","src/server/repositories/organization-analytics-repository.ts","src/server/services/organization-analytics-route.test.ts"`
- `powershell.exe -NoProfile -Command "if ((Select-String -Path 'docs/04-agent-system/state/task-queue.yaml' -Pattern '^    status: pending$' | Measure-Object).Count -ne 1) { throw 'Expected exactly one pending task' }"`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding.md docs/05-execution-logs/evidence/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding.md docs/05-execution-logs/audits-reviews/2026-06-17-advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding.md`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-runtime-unit-alignment-seeding`
