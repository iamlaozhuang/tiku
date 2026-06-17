# Advanced Organization Analytics Training Answer Source Schema Migration

## Scope

- Task id: `advanced-organization-analytics-training-answer-source-schema-migration`
- Branch: `codex/advanced-organization-analytics-training-answer-source-schema-migration`
- Task kind: `local_schema_migration`
- Goal: add a metadata-only official organization training answer/submission source for aggregate organization analytics.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-training-answer-source-schema-migration-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-training-answer-source-schema-migration-planning.md`

## Baseline

- `git switch master`: pass.
- `git fetch --prune origin`: pass with non-blocking Git loose-object maintenance warning.
- `git status --short --branch`: clean `master...origin/master`.
- `git rev-parse HEAD master origin/master`: all `307aeb731939861e6955332a86a13915f81d357c`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output.
- Fresh user approval: user said `批准执行` after this task was identified.

## Capability Gate

Before modifying `src/db/schema/**` or `drizzle/**`, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration -Capability schemaMigration -Intent use_capability
```

If this gate fails, stop and record the blocker.

## TDD Plan

1. Read existing organization training schema patterns and prior planning evidence.
2. Add a focused schema unit test first for:
   - `organizationTrainingAnswerStatusEnum` values: `in_progress`, `submitted`, `read_only`.
   - `organizationTrainingAnswer` table name.
   - metadata-only columns required for analytics: version, employee, organization, status, score, total score, submitted timestamp, organization snapshot, timestamps.
   - unique/index names matching project conventions.
3. Run the focused unit test and confirm RED for missing schema exports.
4. Add the minimal schema export in `src/db/schema/organization-training.ts`.
5. Generate a Drizzle migration file only after schema gate passes.
6. Re-run the focused unit test and full declared validation commands.

## Migration Boundary

- Allowed: schema definition, focused schema test, generated Drizzle migration file, task plan/evidence/audit/state updates.
- Blocked: database connection execution, database migration execution, `drizzle-kit push`, staging/prod/cloud/deploy/payment/external-service, provider/model calls, dependency/package/lockfile changes, route/service/repository/UI runtime wiring, e2e/browser/dev-server, PR, force push, Cost Calibration Gate.

## Rollback / Recovery

- This task may generate a forward migration only.
- If no database migration is executed, rollback is git revert of the schema and generated migration changes.
- Future local database rollback, if separately approved, can drop the new table and enum only in local dev and only before dependent data exists.
- Staging/prod rollback remains out of scope and requires a separate approved environment plan.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration -Capability schemaMigration -Intent use_capability`
- `npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration`

## Closeout Boundary

The queued task does not approve fast-forward merge or push. After validation, stop before local commit unless fresh post-validation approval is provided.
