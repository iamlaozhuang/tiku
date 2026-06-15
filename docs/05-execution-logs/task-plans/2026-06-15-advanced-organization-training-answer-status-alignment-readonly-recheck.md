# Task Plan: advanced-organization-training-answer-status-alignment-readonly-recheck

## Scope

- Task: `advanced-organization-training-answer-status-alignment-readonly-recheck`
- Branch: `codex/advanced-organization-training-answer-status-alignment-readonly-recheck`
- Fresh approval: user approved execution in the current 2026-06-15 Codex thread by saying "批准执行".
- Goal: readonly recheck after `advanced-organization-training-answer-status-alignment` to confirm the organization
  training answer status contract, test coverage, ADR-002 layering, and blocked gate preservation before downstream
  service/route/repository/mapper/API runtime/UI work.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-answer-status-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-answer-status-alignment.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Allowed Edits

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-answer-status-alignment-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-answer-status-alignment-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-answer-status-alignment-readonly-recheck.md`

## Readonly Review Surfaces

- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`

## Blocked Gates

- No product source implementation.
- No `.env*` read/write/output.
- No DB access, no direct row/private data read, and no private data evidence.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, mapper, UI, or API runtime
  changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No PR and no force push.

## Review Plan

1. Confirm `organizationTrainingAnswerStatusValues` contains exactly `in_progress`, `submitted`, and `read_only`.
2. Confirm `OrganizationTrainingAnswerStatus` is consumed only by DTO contracts and the scoped unit test at this stage.
3. Confirm the scoped unit test locks the status values.
4. Confirm no organization training service/route/repository/mapper/API runtime/UI/schema consumer exists yet.
5. Confirm ADR-002 layering remains intact and all blocked gates remain preserved.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-answer-status-alignment-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-answer-status-alignment-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-answer-status-alignment-readonly-recheck`
