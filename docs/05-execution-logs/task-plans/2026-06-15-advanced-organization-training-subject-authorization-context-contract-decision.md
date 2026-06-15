# Task Plan: advanced-organization-training-subject-authorization-context-contract-decision

## Scope

- Decide whether `subject` belongs in `EffectiveAuthorizationContextDto` for organization training.
- Record the contract boundary decision before broader organization training lifecycle expansion.
- Docs/state/evidence/audit only. No product source implementation.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-boundary-readonly-audit.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/contracts/ai-generation-task-contract.ts`
- `src/db/schema/auth.ts` readonly shape check only

## Decision Procedure

1. Confirm the current authorization source model dimensions.
2. Compare `EffectiveAuthorizationContextDto` with organization training and AI task content/request scopes.
3. Decide whether adding `subject` to `EffectiveAuthorizationContextDto` would represent true source-backed
   authorization state or would conflate authorization with content filtering.
4. Record the next implementation boundary.

## Risk Defense

- No `.env*` read/write/output.
- No DB access, direct row/private data read, provider/model call, quota/cost work, dev server, Browser, Playwright, e2e,
  staging/prod/cloud/deploy/payment/external-service work.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No route, service, repository, mapper, API runtime, contract, model, validator, UI, or formal target write changes.
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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
```

## Expected Output

- Contract decision evidence and audit review.
- Durable state and queue update.
- Recommended next task to seed or implement a content/request scope guard if needed.
