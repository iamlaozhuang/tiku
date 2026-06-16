# Task Plan: advanced-organization-training-publish-version-persistence-schema-migration-seeding

## Task

- Task id: `advanced-organization-training-publish-version-persistence-schema-migration-seeding`
- Branch: `codex/advanced-organization-training-publish-version-persistence-schema-migration-seeding`
- Baseline: `master == origin/master == 90e59628d9a238e1d9df520b064fdbfcff7b0b36`
- Task kind: docs/state-only queue seeding.
- User approval: current 2026-06-15 Codex thread, explicit `批准执行` after the next-step recommendation.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit.md`

## Objective

Seed the next exact implementation task required by the readonly inventory result:

`advanced-organization-training-publish-version-persistence-schema-migration`

This task does not implement schema, migration, repository, mapper, route, UI, provider, or DB work. It only records the
docs/state queue transition and the approval boundary for the future high-risk task.

## Implementation Plan

1. Create this task plan, evidence, and audit review.
2. Update `project-state.yaml` to make the seeding task the current closed task and point the handoff to the new pending
   schema-migration task.
3. Append two queue entries:
   - the closed docs-only seeding task.
   - the pending schema-migration task, with schema/DB capability blocked until fresh task approval.
4. Preserve all blocked gates and keep the future task narrow:
   - local schema/migration planning and files only after fresh approval.
   - no DB access or migration execution unless separately approved by that future task.
   - no product source outside `src/db/schema/**`, no server/route/repository/mapper/UI work.

## Files Allowed For This Task

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration-seeding.md`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, migration generation, migration execution, or row/private data read.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, product source, route, repository, mapper, API runtime, UI,
  formal content write, or formal target write changes.
- No public identifier value list exposure.
- No PR and no force push.

## Validation Commands

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration-seeding
```

## Risk Controls

- The future schema-migration task is seeded as `pending` with `schemaMigration: blocked_without_task_approval`.
- The future task must record fresh approval before changing schema or drizzle files.
- The future task must run `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability schemaMigration -Intent use_capability`
  only after its queue capability is updated to `approved_migration_plan`.
- DB access and migration execution remain blocked by this seeding task.
