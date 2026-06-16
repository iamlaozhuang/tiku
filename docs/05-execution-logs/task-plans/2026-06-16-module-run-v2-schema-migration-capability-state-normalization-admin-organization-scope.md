# Task Plan: module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope

## Scope

- Task id: `module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope`
- Branch: `codex/schema-migration-capability-state-normalization`
- Task kind: docs/state repair.
- User approval: explicit approval in the current thread to execute the recommended normalization.
- Goal: normalize the pending admin-organization schema task's `capabilities.schemaMigration` value to the approved state recognized by `Test-ModuleRunV2LocalCapabilityGate.ps1`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.ps1` as readonly policy context.

## Findings Before Edit

- The local capability gate defines `schemaMigration.ApprovedState` as `approved_migration_plan`.
- The pending task `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration` used `approved_by_standing_local_schema_migration_2026_06_10`.
- The gate failed before this repair with `localCapabilityDecision: stop_for_hard_block` and reason `capability state is not in the approved schema`.
- A previous accepted schema migration task used `schemaMigration: approved_migration_plan`, which confirms the queue value should be normalized rather than changing the script.

## Implementation Plan

1. Keep this task docs/state-only.
2. Add this repair task to `task-queue.yaml` with explicit allowed and blocked files.
3. Update `project-state.yaml` to point to this repair task while it is active.
4. Change only the pending admin-organization schema task's `capabilities.schemaMigration` value to `approved_migration_plan`.
5. Record evidence and audit review with RED/GREEN, blocked gates, and next-task policy.
6. Re-run the schema task capability gate to prove the normalized state is accepted before returning to schema work.

## Blocked Gates

- No `.env*` read, output, or edit.
- No product source, tests, scripts, schema/drizzle, migration, package, or lockfile changes.
- No DB command execution, migration execution, row/private data access, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration -Capability schemaMigration -Intent use_capability
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope
```
