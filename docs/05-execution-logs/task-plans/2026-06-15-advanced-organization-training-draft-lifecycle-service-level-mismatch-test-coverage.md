# Task Plan: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage

## Scope

- Add explicit `level` mismatch unit coverage for organization training manual draft creation.
- Keep final product-code change test-only in `src/server/services/organization-training-service.test.ts`.
- Update durable state, queue, evidence, and audit records for this task.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`

## TDD Plan

1. RED: Add the desired `level mismatch` assertion in the service unit test with a temporary test-only failing marker.
   Because `src/server/services/organization-training-service.ts` is blocked/read-only and already checks `level`, the
   RED mechanism must not mutate service code. The temporary marker verifies the assertion body first and is removed
   before final commit.
2. GREEN: Remove the temporary marker so the same assertion becomes normal passing coverage.
3. Refactor: Keep the change narrow; prefer adding one explicit blocked case to the existing content scope test table.

## Risk Defense

- Do not modify `src/server/services/organization-training-service.ts`.
- Do not expand route, repository, mapper, contract, model, validator, schema, drizzle, script, package, lockfile, UI, or
  dependency surfaces.
- Do not access DB, provider/model, quota/cost, dev server, Browser, Playwright, staging/prod/cloud/deploy/payment, or
  external services.
- Do not read, output, or modify `.env*`.
- Preserve ADR-002 layering: this task only strengthens service unit coverage and does not move logic across layers.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
```
