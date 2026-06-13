# Task Plan: batch-170-personal-learning-ai-generated-content-persistence-implementation

## Scope

- Task: `batch-170-personal-learning-ai-generated-content-persistence-implementation`
- Branch: `codex/batch-170-personal-learning-ai-generated-content-persistence-implementation`
- Baseline: `989dff3233e56a0ef8369c29e2275952c49f7f26`
- Task kind: implementation with approved local schema/migration and draft-only generated-content persistence.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-167 evidence and audit records.
- Confirmed `HEAD`, `master`, and `origin/master` are all `989dff3233e56a0ef8369c29e2275952c49f7f26`.
- Confirmed the worktree is clean before edits.
- Confirmed no remote `codex/*` branches remain; the only local `codex/*` branch is the active batch-170 branch.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed before this plan.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved "generated-content persistence local schema/migration +
  repository/service + unit tests" and allowed local Drizzle migration.
- The approval is local-dev only and draft-only.
- No formal adoption into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` is approved.
- No provider call, sandbox execution, env/secret read or write, e2e, staging/prod/cloud, deploy, payment,
  external-service, PR, force-push, dependency/package/lockfile change, destructive database operation, or Cost
  Calibration Gate is approved.

## Allowed Files

- `src/db/schema/**`
- `drizzle/**`
- `src/server/models/personal-ai-generation-*.ts`
- `src/server/contracts/personal-ai-generation-*.ts`
- `src/server/validators/personal-ai-generation-*.ts`
- `src/server/mappers/personal-ai-generation-*.ts`
- `src/server/mappers/personal-ai-generation-*.test.ts`
- `src/server/repositories/personal-ai-generation-*.ts`
- `src/server/repositories/personal-ai-generation-*.test.ts`
- `src/server/services/personal-ai-generation-*.ts`
- `src/server/services/personal-ai-generation-*.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-170-personal-learning-ai-generated-content-persistence-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-170-personal-learning-ai-generated-content-persistence-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-170-personal-learning-ai-generated-content-persistence-implementation.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/app/**`, `src/features/**`, `src/ai/**`, `tests/**`, `e2e/**`.
- `materials/**`, `paper_assets/**`, `playwright-report/**`, `test-results/**`.
- Provider calls, provider configuration, sandbox execution, env/secret content, e2e, staging/prod/cloud, deploy,
  payment, external-service, PR, force-push, destructive database operation, dependency changes, and Cost Calibration.
- Formal writes or adoption into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.

## Design

1. Add an independent draft result persistence table for personal AI generation results. Keep generated result data out of
   `ai_generation_task`, which remains a task/history table.
2. Persist redaction-safe draft snapshots and references only. Use public identifiers in service and API-facing DTOs; keep
   internal `id` values repository-owned.
3. Keep formal adoption explicitly blocked in the service contract.
4. Implement repository and service layers behind injectable gateways for unit tests and a Drizzle-backed repository for
   runtime use.
5. Generate and apply a local Drizzle migration only after `schemaMigration` capability gate passes. Use redacted evidence;
   do not record database URLs, secrets, row data, raw prompts, provider payloads, or raw generated output.

## TDD Plan

1. Add failing schema tests for the new draft result table, indexes, foreign key, and blocked formal-domain columns.
2. Add failing repository tests for create/reuse/list behavior, owner scoping, server-owned metadata, and no internal ids.
3. Add failing service tests for standard `{ code, message, data }` responses, draft-only persistence, and explicit
   formal-adoption rejection.
4. Run the targeted tests and record the RED failure.
5. Implement the minimal schema, model, contract, validator, mapper, repository, and service code.
6. Re-run targeted tests and full required gates.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId batch-170-personal-learning-ai-generated-content-persistence-implementation -Capability schemaMigration -Intent use_capability`
- `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts`
- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-result-repository.test.ts`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-persistence-service.test.ts`
- `pnpm.exe exec drizzle-kit generate`
- `pnpm.exe exec drizzle-kit migrate`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-170-personal-learning-ai-generated-content-persistence-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-170-personal-learning-ai-generated-content-persistence-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-170-personal-learning-ai-generated-content-persistence-implementation`

## Rollback And Recovery

- Schema rollback boundary: this task adds a local migration only. If local migration fails, stop and record redacted
  evidence; do not run destructive database operations.
- Code rollback boundary: revert the batch-170 branch commit before merge if validation fails.
- Production/staging boundary: no staging/prod/cloud connection or migration is allowed.
