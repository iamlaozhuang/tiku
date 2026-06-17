# Advanced Organization Analytics Postgres Gateway Source Input Decision

## Scope

- Task id: `advanced-organization-analytics-postgres-gateway-source-input-decision`
- Branch: `codex/advanced-organization-analytics-postgres-gateway-source-input-decision`
- Type: readonly/docs decision.
- Goal: decide the real organization analytics Postgres gateway source inputs required before any App Router real runtime wiring.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Baseline

- `git switch master`: pass.
- `git fetch --prune origin`: pass with non-blocking unreachable loose object maintenance warning.
- `git status --short --branch`: clean `master...origin/master`.
- `git rev-parse HEAD master origin/master`: all `929864be5d0334b7d0c60617308b9d8725e46e64`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output.
- Pending task confirmed: `advanced-organization-analytics-postgres-gateway-source-input-decision`.

## Decision Method

1. Read the task-declared readonly source surfaces:
   - `src/server/repositories/organization-analytics-repository.ts`
   - `src/server/repositories/organization-analytics-repository.test.ts`
   - `src/server/services/organization-analytics-service.ts`
   - `src/server/repositories/runtime-database.ts`
   - `src/db/schema/**`
2. Identify the minimum source inputs needed by a future real Postgres gateway implementation.
3. Record a decision that preserves ADR-002 layering and avoids route runtime wiring.
4. Record the next minimum implementation boundary without implementing it.

## Blocked Gates

- No `.env*` read, output, summary, or edit.
- No implementation, query implementation, source modification, route/service/repository/UI runtime change.
- No database connection execution or row/private data access.
- No schema/migration/drizzle/package/lockfile/dependency change.
- No provider/model call, provider payload, raw prompt, raw answer, publicId list, secret, token, cookie, Authorization header, or DB URL exposure.
- No e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.

## Validation

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-postgres-gateway-source-input-decision","status: closed","readonly_audit"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision`

## Closeout Boundary

The queued task does not materialize approval for fast-forward merge or push. After validation, stop before merge/push and report the remaining approval boundary.
