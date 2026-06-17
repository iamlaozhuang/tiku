# Advanced organization analytics post employee runtime alignment readonly recheck seeding plan

## Scope

- Task: `advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding`
- Branch: `codex/organization-analytics-post-runtime-alignment-recheck-seeding`
- Approved action: docs/state-only queue seeding, local validation, local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, fetch prune, and next-work recommendation.
- Seed exactly one pending task: `advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck`.

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
- Latest employee runtime alignment evidence and audit.

## Local State Check

- Baseline branch: `master`
- Baseline `HEAD`, `master`, and `origin/master`: `dd2a56efed4a3a2500a001989dbc19871ca369f0`
- Local/remote `codex/*` refs before branch creation: none.
- Queue pending count before this seeding task: `0`.

## Implementation Plan

1. Add this task plan before durable state edits.
2. Update `project-state.yaml` with the current docs/state seeding task, accepted ancestor repository SHA, progress map entry, and handoff to the seeded readonly recheck task.
3. Append one closed seeding task and one pending readonly recheck task to `task-queue.yaml`.
4. Write evidence and audit files for this seeding task.
5. Run the validation commands declared by the seeding task.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the merged short branch, fetch prune, and verify final repository state.

## Risk Controls

- No product source, tests, service, repository, mapper, validator, route, App Router, UI, schema, migration, drizzle, package, lockfile, dependency, provider/model, browser/e2e/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost, or Cost Calibration Gate work.
- No real database connection or row/private data access.
- The seeded readonly recheck must stay inspection-only and may only record findings or seed a future scoped follow-up after approval.
- Evidence must stay summary-only and must not include public identifier inventories or private source data.

## Validation Commands

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding","status: closed","advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck","status: pending","readonly_recheck","src/server/services/organization-analytics-route.test.ts"`
- `powershell.exe -NoProfile -Command "if ((Select-String -Path 'docs/04-agent-system/state/task-queue.yaml' -Pattern '^    status: pending$' | Measure-Object).Count -ne 1) { throw 'Expected exactly one pending task' }"`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding.md docs/05-execution-logs/evidence/2026-06-17-advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding.md docs/05-execution-logs/audits-reviews/2026-06-17-advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding.md`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck-seeding`
