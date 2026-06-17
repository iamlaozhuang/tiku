# Advanced Organization Analytics Training Answer Source Schema Migration Planning

## Scope

- Task id: `advanced-organization-analytics-training-answer-source-schema-migration-planning`
- Branch: `codex/advanced-organization-analytics-training-answer-source-schema-migration-planning`
- Type: docs-only schema/migration planning.
- Goal: prepare a migration approval package for the missing organization training employee answer/submission source required by the real organization analytics Postgres gateway.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

## Baseline

- `git switch master`: pass.
- `git fetch --prune origin`: pass with non-blocking unreachable loose object maintenance warning.
- `git status --short --branch`: clean `master...origin/master`.
- `git rev-parse HEAD master origin/master`: all `89ebcd06f6ae1f37b4aaea2cfbb6a364e445120f`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output.
- Pending task confirmed: `advanced-organization-analytics-training-answer-source-schema-migration-planning`.

## Planning Method

1. Read the prior gap decision evidence and audit.
2. Read declared readonly schema/source references.
3. Draft a schema/migration approval package that describes proposed table(s), fields, indexes, foreign keys, rollback, validation, and follow-up boundaries.
4. Seed a pending schema/migration task only as a future approval target; do not modify schema or migration files in this task.

## Blocked Gates

- No `.env*` read, output, summary, or edit.
- No source implementation, query implementation, route/service/repository/UI runtime change.
- No database connection execution, database row access, or private data access.
- No `src/db/schema/**`, `drizzle/**`, package, lockfile, dependency, or script change.
- No `drizzle-kit`, migration generation, migration execution, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.

## Validation

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-training-answer-source-schema-migration-planning","status: closed","docs_schema_migration_planning"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`

## Closeout Boundary

The queued task does not approve fast-forward merge or push. If validation passes, stop before local commit unless fresh post-validation approval is provided.
