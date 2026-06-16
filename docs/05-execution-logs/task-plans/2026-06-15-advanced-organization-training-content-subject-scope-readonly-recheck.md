# Task Plan: advanced-organization-training-content-subject-scope-readonly-recheck

## Metadata

- Task id: `advanced-organization-training-content-subject-scope-readonly-recheck`
- Branch: `codex/advanced-organization-training-content-subject-scope-readonly-recheck`
- Baseline: `master == origin/master == 02396ecc1df966ff1bf7cbca752fa6c04a322755`
- Started at: `2026-06-15T17:10:10-07:00`
- Approval: current 2026-06-15 Codex thread, explicit `批准执行` after next-step recommendation.

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`

Readonly source references:

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/validators/organization-training.ts`

## Objective

Perform a readonly recheck after the organization training content subject scope guard merged to `master`.

Confirm:

- service, contract, validator, and unit test posture is consistent;
- ADR-002 layering remains intact;
- selected `subject` remains content/request scope;
- `EffectiveAuthorizationContextDto` remains source-backed `profession/level` only;
- formal target writes and all high-risk gates remain blocked.

## Execution Plan

1. Reconfirm repository readiness on `master`, fetch prune, clean worktree, aligned `HEAD/master/origin/master`, and no `codex/*` residue before branch creation.
2. Claim this pending readonly task in durable state and record the current approval.
3. Read the prior guard and contract decision evidence/audit.
4. Read the allowed readonly source files without modifying product source.
5. Record findings in evidence and audit review.
6. Run declared validation commands.
7. If validation passes, close the task, commit the docs/state-only change, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean state.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No product implementation.
- No route, service, repository, mapper, API runtime, contract, model, validator, or UI changes.
- No formal content write and no formal target write.
- No public identifier value list exposure.
- No PR and no force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
```
