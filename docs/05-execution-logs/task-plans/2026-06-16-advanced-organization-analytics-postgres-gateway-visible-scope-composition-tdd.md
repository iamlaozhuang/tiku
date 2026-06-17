# Advanced Organization Analytics Postgres Gateway Visible Scope Composition TDD Plan

## Baseline

- Branch: `codex/advanced-organization-analytics-visible-scope-composition`.
- Baseline commit: `c4c75d55900104602836ce2f7ac57bb2c370a057`.
- Required startup checks passed before claim: `git switch master`, `git fetch --prune origin`, clean `git status --short --branch`, matching `HEAD/master/origin/master`, and no local or remote `codex/*` refs.
- Required documents re-read: `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, all `docs/02-architecture/adr/*.md`, `docs/04-agent-system/state/project-state.yaml`, and `docs/04-agent-system/state/task-queue.yaml`.
- TDD skill loaded: `superpowers:test-driven-development`.

## Task Scope

- Task id: `advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`.
- Fresh approval: user said `批准执行` after the fresh baseline and pending task review.
- Implement only repository/gateway boundary behavior that composes the visible organization scope lookup reader with the existing metadata-only training answer source reader.
- Keep the implementation injection-based. Unit tests may use in-memory fake readers. No real database connection or row/private data exposure is allowed.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd.md`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`

## Blocked Boundaries

- No route runtime wiring, service changes, UI changes, App Router dependency wiring, real DB execution, schema/migration/drizzle changes, dependency/package/lockfile changes, provider/model calls, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, quota/cost work, or Cost Calibration Gate.
- Evidence must not contain raw rows, private data, publicId lists, provider payloads, raw prompts, raw answers, secrets, tokens, cookies, Authorization headers, or DB URLs.
- Closeout stops after validation unless fresh approval is provided for local commit. This task does not approve fast-forward merge or push.

## TDD Plan

1. Read the allowed repository and unit test files plus declared readonly context.
2. RED: add a focused unit test proving the Postgres gateway factory composes both injected readers and passes visible organization ids into the metadata-only training answer source query.
3. Verify RED with `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"` and record the expected failing assertion.
4. GREEN: minimally update the repository/gateway implementation to pass the test, preserving existing contracts and fail-closed injection semantics.
5. Run the scoped unit test until green, then run all task validation commands.
6. Write evidence and audit review with redacted outputs and blocked-gate confirmation.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`
