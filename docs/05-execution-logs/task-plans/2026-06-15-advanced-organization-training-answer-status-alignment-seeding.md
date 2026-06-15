# Task Plan: advanced-organization-training-answer-status-alignment-seeding

## Objective

Seed a narrow follow-up task for the organization training employee answer status mismatch found by
`advanced-organization-training-contract-validation-readonly-recheck`.

## Approval

- User approved execution in the current 2026-06-15 Codex thread by saying "批准执行".
- Approval covers this docs/state-only seeding task, local validation, local commit, fast-forward merge to `master`,
  push to `origin/master`, short-branch cleanup, and fetch prune.
- The seeded implementation task remains `pending` and requires fresh approval before claim.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-contract-validation-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-contract-validation-readonly-recheck.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `src/server/models/organization-training.ts`

## Seeding Decision

Seed `advanced-organization-training-answer-status-alignment` as a pending TDD implementation task.

The seeded task should align `organizationTrainingAnswerStatusValues` with the current organization training plan before
any service, route, repository, mapper, API runtime, or UI work consumes the status union.

## Blocked Gates

- No product code change in this seeding task.
- No `.env*`, DB, row/private data, provider/model call, provider configuration, provider payload, raw prompt, raw
  answer, quota/cost, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment,
  external-service, schema/drizzle/scripts/package/lockfile/dependency, route/service/repository/mapper/API runtime/UI,
  formal content write, formal target write, PR, or force push.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-answer-status-alignment-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-answer-status-alignment-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-answer-status-alignment-seeding`
