# Task Plan: advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding

## Task

- Task id: `advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding`
- Branch: `codex/advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding`
- Baseline: `master == origin/master == c38be7139fd1a5bb2776b1ba0253b39d8cd83f82`
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
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`

## Objective

Seed the next exact implementation task after isolated publish-version schema exists:

`advanced-organization-training-publish-version-persistence-repository-mapper`

This task does not implement repository, mapper, service, route, UI, DB execution, provider, schema, migration, package, or
dependency work. It only records the docs/state queue transition and the approval boundary for the future TDD task.

## Implementation Plan

1. Create this task plan, evidence, and audit review.
2. Update `project-state.yaml` to make this seeding task the current closed task and point the handoff to the pending
   repository/mapper TDD task.
3. Append two queue entries:
   - the closed docs-only repository/mapper TDD seeding task.
   - the pending repository/mapper implementation task, with TDD RED-first required.
4. Preserve all blocked gates and keep the future task narrow:
   - repository and mapper only.
   - consume existing `organization_training_version` schema only.
   - no schema/drizzle edits and no migration execution.
   - no route/service/UI/runtime adapter changes.
   - no DB access unless a future task records separate approval.

## Files Allowed For This Task

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding.md`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, migration generation, migration execution, or row/private data read.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, product source implementation, route, repository, mapper,
  API runtime, UI, formal content write, or formal target write changes in this seeding task.
- No public identifier value list exposure.
- No PR and no force push.

## Validation Commands

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts" "src/db/schema/organization-training.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding
```

## Risk Controls

- The future repository/mapper task is seeded as `pending` with TDD required.
- The future task must create failing tests before implementation.
- The future task must not modify route, service, API runtime, UI, schema, migration, package, lockfile, dependency, provider,
  or formal target write surfaces.
- DB access and migration execution remain blocked by this seeding task.
