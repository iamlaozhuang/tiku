# Advanced Organization Analytics Postgres Gateway Source Input Decision Seeding

## Scope

- Task id: `advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
- Branch: `codex/advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
- Type: docs/state-only queue seeding.
- Goal: materialize a single pending readonly/docs decision task for identifying the real organization analytics Postgres gateway source inputs before any App Router real runtime wiring.

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
- `git rev-parse HEAD master origin/master`: all `bb21512daa32a965aaa942ff615c3e2e89a60c68`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output.
- Queue check: no real `status: pending` entry; `status: pending` appears only inside historical validation command strings.

## Implementation Plan

1. Update `project-state.yaml` to record the docs/state-only seeding closeout and next handoff.
2. Append the closed seeding task and one pending readonly/docs decision task to `task-queue.yaml`.
3. Create evidence and audit files for this seeding task.
4. Run declared local validation commands.
5. If all hard-block gates pass, commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Blocked Gates

- No `.env*` reads, output, summaries, or edits.
- No source implementation.
- No direct DB access or database connection execution.
- No schema, migration, Drizzle, package, lockfile, dependency, provider/model, quota/cost, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, or force-push work.
- No row/private data, provider payload, raw prompt, raw answer, token, cookie, Authorization header, DB URL, publicId list, or secret exposure.

## Validation

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-postgres-gateway-source-input-decision","status: pending","readonly_audit","src/server/repositories/organization-analytics-repository.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
