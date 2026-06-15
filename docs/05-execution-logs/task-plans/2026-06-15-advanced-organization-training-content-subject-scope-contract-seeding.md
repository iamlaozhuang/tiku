# Task Plan: advanced-organization-training-content-subject-scope-contract-seeding

## Scope

- Docs/state-only queue seeding task.
- Convert the approved subject scope contract decision into one narrow pending TDD implementation task.
- Do not implement product behavior in this task.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `src/server/services/organization-training-service.ts` readonly context only
- `src/server/services/organization-training-service.test.ts` readonly context only
- `src/server/contracts/effective-authorization-contract.ts` readonly context only

## Seeding Plan

1. Preserve the contract decision that `subject` is selected content/request scope, not a source-backed
   `EffectiveAuthorizationContextDto` field.
2. Append a pending TDD task:
   `advanced-organization-training-content-subject-scope-guard`.
3. Scope the pending task to service/contract/test surfaces only.
4. Require RED first, then implementation, with tests covering subject validation, metadata preservation,
   non-leakage, and no subject field added to `EffectiveAuthorizationContextDto`.

## Risk Defense

- No `.env*` read/write/output.
- No DB access, direct row/private data read, provider/model call, quota/cost work, dev server, Browser, Playwright, e2e,
  staging/prod/cloud/deploy/payment/external-service work.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No product source implementation in this seeding task.
- No route, service, repository, mapper, API runtime, contract, model, validator, or UI change in this seeding task.
- No formal target write.
- No secret, token, cookie, Authorization header, DB URL, provider payload, raw prompt, raw answer, public identifier
  value list, row data, or private data in evidence.
- No PR and no force push.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-contract-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-contract-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-contract-seeding
```

## Expected Output

- One closed seeding task entry.
- One pending TDD implementation task entry.
- Evidence and audit documenting the seeded scope and blocked gates.
