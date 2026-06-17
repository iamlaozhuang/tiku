# Advanced Organization Analytics Postgres Gateway Source Readers TDD

## Task

- Task id: `advanced-organization-analytics-postgres-gateway-source-readers-tdd`
- Branch: `codex/organization-analytics-source-readers-tdd`
- Claimed at: `2026-06-16T21:55:20-07:00`
- Scope: repository-only typed source readers for organization analytics Postgres gateway inputs.

## Required Baseline

- Ran `git switch master`.
- Ran `git fetch --prune origin`.
- Ran `git status --short --branch` and confirmed clean `master...origin/master`.
- Ran `git rev-parse HEAD master origin/master` and confirmed all three equal `b9e4b51a627abd29b8692935df5834a12b12a6be`.
- Ran `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex` and confirmed no output.
- Confirmed queue has exactly one `pending` task and it is `advanced-organization-analytics-postgres-gateway-source-readers-tdd`.

## Read Governance

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

## Allowed Files

- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-postgres-gateway-source-readers-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-postgres-gateway-source-readers-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-postgres-gateway-source-readers-tdd.md`

## Blocked

- No `.env*` read, output, summary, or edit.
- No secret, token, cookie, Authorization header, DB URL, provider payload, raw prompt, raw answer, publicId list, row data, or private data exposure.
- No real database connection or local runtime database instantiation.
- No App Router runtime wiring, service/UI changes, schema/migration/drizzle edits, dependency changes, provider/model calls, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- No hand-written SQL strings in business logic; repository implementation must stay Drizzle/typed gateway based.

## TDD Plan

1. Read the existing repository and focused repository test after this plan exists.
2. Add failing tests for visible organization scope lookup source reader behavior.
3. Add failing tests for aggregate-only organization training answer source row reader behavior.
4. Run the focused unit command and record the expected red failure.
5. Implement the smallest repository source-reader changes needed to pass the focused tests.
6. Run declared validation commands and write redacted evidence.
7. Write audit review and update only this task's state/result fields.
8. Stop after validation; do not commit, merge, push, or clean up the branch without fresh approval.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-readers-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-readers-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-readers-tdd`

## Risk Controls

- Evidence will record commands, exit codes, and summarized pass/fail output only.
- Tests will use injected/fake gateway objects, not a real DB connection.
- If implementation requires route/service/schema/dependency/provider/DB runtime work, the task stops and reports the blocked gate.
