# Task Plan: advanced-organization-training-next-implementation-queue-seeding

## Metadata

- Task id: `advanced-organization-training-next-implementation-queue-seeding`
- Branch: `codex/advanced-organization-training-next-implementation-queue-seeding`
- Baseline: `master == origin/master == 3706ecf1b4329511bf478be59407701898cc01b8`
- Started at: `2026-06-15T17:20:58-07:00`
- Approval: current 2026-06-15 Codex thread, explicit `批准执行` after next-step recommendation.

## Read Scope

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
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

## Objective

Seed the next pending organization training implementation task after the content subject scope readonly recheck closed
with no blocking findings.

This task is docs/state-only. It does not implement product behavior.

## Candidate Decision

Seed one narrow RED-first implementation task:

`advanced-organization-training-publish-version-service`

Rationale:

- Contract and validation scaffolds already define publish input, question type summary, published version DTO, and scope
  snapshot shapes.
- Manual draft service guard is already present and rechecked.
- The smallest next service-layer lifecycle step is publishing a validated training draft into an immutable published
  version with organization scope snapshot semantics.
- Route, repository, schema, mapper, UI, takedown/copy, employee answer, analytics, provider, and DB work remain blocked.

## Execution Plan

1. Record repository readiness and no pending queue state.
2. Add a closed seeding task for this docs/state-only queue update.
3. Add one pending TDD implementation task for publish version service behavior.
4. Record evidence and audit with blocked gates preserved.
5. Run declared validation commands.
6. Close out, commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and
   confirm clean state.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No product source implementation in this seeding task.
- No route, service, repository, mapper, API runtime, contract, model, validator, or UI changes in this seeding task.
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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding
```
