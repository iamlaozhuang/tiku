# Task Plan: advanced-organization-training-content-subject-scope-guard

## Scope

- Task id: `advanced-organization-training-content-subject-scope-guard`
- Branch: `codex/advanced-organization-training-content-subject-scope-guard`
- Baseline: `master == origin/master == 0527045754b0185586a0f605e852c30e3bab3106`
- Goal: add a narrow service-level content/request scope guard so organization training manual draft creation validates
  selected `profession + level + subject` while `EffectiveAuthorizationContextDto` remains source-backed
  `profession/level` only.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/contracts/ai-generation-task-contract.ts`

## TDD Plan

1. Add a failing unit test in `src/server/services/organization-training-service.test.ts` proving manual draft creation
   rejects an invalid selected `subject` and does not call the draft store.
2. Add type-level assertions in the same service test file proving `EffectiveAuthorizationContextDto` has no `subject`
   field.
3. Implement the smallest service/contract change needed to validate selected organization training content scope.
4. Re-run the focused service test and the task-declared scoped unit set.

## Allowed Changes

- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review files.

## Blocked Gates

- Do not add `subject` to `EffectiveAuthorizationContextDto`.
- Do not modify route, repository, mapper, validator, model, API, UI, schema, drizzle, scripts, package, or lockfile
  files.
- Do not access DB, row/private data, provider/model, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy,
  payment, external-service, quota/cost, or Cost Calibration Gate.
- Do not perform formal content write, formal target write, PR creation, or force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
```
