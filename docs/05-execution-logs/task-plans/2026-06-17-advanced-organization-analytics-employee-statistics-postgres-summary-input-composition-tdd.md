# Advanced organization analytics employee statistics Postgres summary input composition TDD plan

## Task

- Task id: `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`
- Branch: `codex/organization-analytics-employee-summary-input-composition`
- Task kind: `local_repository_tdd`
- Fresh approval: user approved execution, validation, local commit, fast-forward merge to `master`, push to `origin/master`, cleanup, and next-work recommendation in this thread on 2026-06-17.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Task queue entry for `advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`

## Scope

- Implement only repository-level employee statistics Postgres summary input composition for `readEmployeeTrainingSummaryInputs`.
- Allowed product files:
  - `src/server/repositories/organization-analytics-repository.ts`
  - `src/server/repositories/organization-analytics-repository.test.ts`
- Allowed governance files:
  - this task plan
  - this task evidence
  - this task audit review
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Blocked Gates

- No route/runtime/service/UI changes.
- No schema, migration, drizzle command, package, lockfile, dependency, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, quota/cost, PR, or force push work.
- No real database connection execution.
- No row/private data, public identifier inventory, employee answer detail, question text, standard answer, analysis, item-level correctness, mistake detail, prompt text, provider payload, raw prompt, raw answer, or raw model output in evidence.

## TDD Plan

1. Read the existing repository implementation and focused repository test.
2. Add failing tests first for composing summary inputs from typed Postgres gateway/source-reader data.
3. Verify RED with `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`.
4. Implement minimal repository composition code without expanding scope.
5. Verify GREEN with the focused unit test.
6. Refactor only if needed while keeping tests green.
7. Write redacted evidence and audit review.
8. Run all task-declared validation commands before commit.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-employee-statistics-postgres-summary-input-composition-tdd`
