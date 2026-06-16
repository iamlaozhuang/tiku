# Task Plan: advanced-organization-training-publish-version-service

## Scope

- Task id: `advanced-organization-training-publish-version-service`
- Branch: `codex/advanced-organization-training-publish-version-service`
- Baseline: `master == origin/master == 5f9aafbfcae8cb4c6875cc9aeacf77100d222d5d`
- Goal: add a narrow service-layer publish operation that consumes the existing organization training publish input and
  creates an immutable `organization_training_version` DTO with a publish organization scope snapshot.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-next-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-next-implementation-queue-seeding.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

## TDD Plan

1. RED: add focused service unit tests for publishing a validated draft into an immutable published version result,
   including publish scope snapshot, `published` status, metadata immutability, blocked invalid publish input, and
   non-leakage of formal target/provider/raw fields.
2. Verify RED with `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"` and record the
   expected missing service API failure.
3. GREEN: implement the smallest service change needed by adding a publish store boundary and publish method that
   composes an `organization_training_version` write from the existing publish input shape.
4. Re-run the focused service test, then the task-declared scoped unit set and closeout gates.

## Allowed Changes

- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-service.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review files.

## Blocked Gates

- Do not modify route, repository, mapper, schema, DB, provider, UI, package, lockfile, scripts, e2e, takedown,
  copy-to-new-draft, employee answer, analytics, quota/cost, or formal content write behavior.
- Do not access DB, row/private data, provider/model, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy,
  payment, external-service, quota/cost, or Cost Calibration Gate.
- Do not expose secret, token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer,
  row/private data, employee answer text, or public identifier value lists in evidence.
- Do not perform formal target write, PR creation, or force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-service
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-service
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-service
```
