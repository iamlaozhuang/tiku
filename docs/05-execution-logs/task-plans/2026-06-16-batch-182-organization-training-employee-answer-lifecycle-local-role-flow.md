# Task Plan: batch-182 organization training employee answer lifecycle local role flow

## Task

- Task id: `batch-182-organization-training-employee-answer-lifecycle-local-role-flow`
- Branch: `codex/organization-training-batch-182-employee-answer-flow`
- Baseline: `master == origin/master == bda4154ed2a49d5002b8e06027d4bc9a98eb1198`
- Scope: local service/contract/model/validator implementation for organization training employee answer lifecycle.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`

## Implementation Approach

1. Follow TDD: add focused failing tests to `src/server/services/organization-training-service.test.ts`.
2. Add service-layer employee answer lifecycle contracts and store writes in `src/server/services/organization-training-service.ts`.
3. Keep writes isolated to the organization training domain:
   - save draft as `organization_training_answer_draft` / `in_progress`;
   - submit once as `organization_training_answer_record` / `submitted`;
   - expose submitted/takedown history as `read_only` summary only.
4. Enforce employee visibility using current employee organization scope intersecting the version publish scope snapshot.
5. Block new answer draft saves, official submission, and question-detail re-entry when a version is `taken_down`.
6. Preserve formal content boundaries: no formal `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` writes.
7. Do not expand repository, schema, DB, route, UI, e2e, provider, package, or lockfile surfaces in this task.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-72-advanced-organization-training-implementation-planning -CandidateTaskId batch-182-organization-training-employee-answer-lifecycle-local-role-flow`
- RED focused unit: `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- GREEN focused unit: `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-182-organization-training-employee-answer-lifecycle-local-role-flow`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-182-organization-training-employee-answer-lifecycle-local-role-flow`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-182-organization-training-employee-answer-lifecycle-local-role-flow`

## Risk Controls

- No `.env*` read/write/output.
- No real DB execution and no row/private data read.
- No provider/model calls, raw prompt, raw answer, or provider payload.
- No quota/cost measurement and no Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No schema, drizzle, package, lockfile, or dependency changes.
- No public identifier value list exposure in evidence.
- No PR and no force push.
