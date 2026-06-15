# Task Plan: advanced-organization-training-draft-lifecycle-service

## Goal

Implement the first narrow service-only organization training draft lifecycle behavior: manual draft creation for an
advanced organization admin.

This task is intentionally smaller than the broad organization training implementation plan Task 2. It does not create a
real repository, route, API runtime, UI, schema, migration, provider integration, quota/cost behavior, or formal content
write path.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-seeding.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`

## Baseline

- Start from `master`.
- Run `git fetch --prune origin`.
- Require clean worktree.
- Require `HEAD == master == origin/master`.
- Require no local or remote `codex/*` residual branches.

## TDD Plan

1. RED: add `src/server/services/organization-training-service.test.ts` first.
2. Run the scoped service test and confirm it fails because the service module does not exist.
3. GREEN: add `src/server/services/organization-training-service.ts` with only manual draft creation behavior.
4. Run the scoped service test and validator test until both pass.

## Implementation Scope

Allowed files:

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review.

Service behavior:

- Accept an already resolved effective authorization context.
- Require `effectiveEdition = advanced`.
- Require `authorizationSource = org_auth`.
- Require `canCreateOrganizationTraining = true`.
- Require target `organizationPublicId` to be in the admin visible organization scope.
- Require target organization to match the effective `org_auth` organization boundary for this first narrow step.
- Require requested `profession`, `level`, and `subject` to match the authorization context.
- Compose a metadata-only `OrganizationTrainingDraftDto` through a service-local draft store port.
- Mark the internal store write as `organization_training_draft` with `ownerType = organization` and
  `quotaOwnerType = organization`.
- Return `sourceTaskPublicId: null`, no formal target references, and no provider/quota/cost behavior.

## Stop Conditions

Stop and report instead of expanding scope if implementation requires:

- repository implementation or DB persistence;
- route/API runtime changes;
- UI changes;
- schema or migration work;
- provider/model calls or provider configuration;
- quota/cost measurement or Cost Calibration Gate;
- formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes;
- package/lockfile/dependency changes;
- dev server, Browser, Playwright, or e2e.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, row/private data, provider/model call, provider configuration, provider payload, raw prompt, or raw
  answer.
- No quota/cost measurement and no Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No schema, drizzle, scripts, package, lockfile, or dependency change.
- No repository, mapper, route, API runtime, or UI change.
- No formal content write and no formal adoption target write.
- No public identifier value list exposure.
- No PR and no force push.
