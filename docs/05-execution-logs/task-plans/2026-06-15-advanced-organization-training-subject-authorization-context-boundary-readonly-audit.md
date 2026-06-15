# Task Plan: advanced-organization-training-subject-authorization-context-boundary-readonly-audit

## Scope

- Read-only audit of whether `subject` should be part of `EffectiveAuthorizationContextDto` for organization training.
- Compare requirements, implementation plans, current contracts, service boundary, validators, and recent evidence.
- Update durable state, task queue, evidence, and audit review only.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage.md`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`

## Audit Plan

1. Confirm current code shape for `EffectiveAuthorizationContextDto`, organization training draft DTO, published version
   DTO, validator input, and manual draft service scope checks.
2. Compare code shape against advanced MVP requirements and organization training implementation plan statements about
   `subject`.
3. Decide whether the current service can accurately claim subject-level authorization matching.
4. Record the next required task boundary without implementing contract, service, route, UI, schema, provider, or formal
   write behavior.

## Risk Defense

- No product source edits.
- No route, service, repository, mapper, contract, model, validator, UI, schema, drizzle, scripts, package, lockfile, or
  dependency changes.
- No DB access, provider/model calls, quota/cost work, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy,
  payment, or external-service access.
- No `.env*` read/write/output.
- Evidence must use file paths, field names, and redacted conclusions only.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
```
