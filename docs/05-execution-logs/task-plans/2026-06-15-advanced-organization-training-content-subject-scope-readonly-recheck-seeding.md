# Task Plan: advanced-organization-training-content-subject-scope-readonly-recheck-seeding

## Scope

- Task id: `advanced-organization-training-content-subject-scope-readonly-recheck-seeding`
- Branch: `codex/advanced-organization-training-content-subject-scope-readonly-recheck-seeding`
- Baseline: `master == origin/master == 845fa78d0dbd7f4d8889f0c6f735350042481981`
- Goal: seed the pending readonly follow-up task
  `advanced-organization-training-content-subject-scope-readonly-recheck`.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`

## Implementation Plan

1. Keep this task docs/state-only.
2. Add the pending readonly task to `docs/04-agent-system/state/task-queue.yaml`.
3. Update `docs/04-agent-system/state/project-state.yaml` to record this seeding closeout and the next recommended
   readonly recheck.
4. Write evidence and audit review after local validation.

## Blocked Gates

- No product source implementation.
- No route, service, repository, mapper, contract, model, validator, API runtime, admin UI, or student UI changes.
- No `.env*`, DB, row/private data, provider/model, quota/cost, dev server, Browser, Playwright, e2e,
  staging/prod/cloud/deploy/payment/external-service, schema, drizzle, scripts, package, lockfile, dependency,
  formal content write, formal target write, PR, or force push work.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck-seeding
```
