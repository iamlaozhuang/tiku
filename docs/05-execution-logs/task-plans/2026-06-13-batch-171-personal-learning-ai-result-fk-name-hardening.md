# Task Plan: batch-171-personal-learning-ai-result-fk-name-hardening

## Scope

- Task: `batch-171-personal-learning-ai-result-fk-name-hardening`
- Branch: `codex/batch-171-personal-learning-ai-result-fk-name-hardening`
- Baseline: `0fceac7556b0a9eef444b3cd765c433c53568495`
- Task kind: schema migration hardening.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read batch-170 evidence and audit records.
- Confirmed `HEAD`, `master`, and `origin/master` are all `0fceac7556b0a9eef444b3cd765c433c53568495`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remained before task branch creation.
- Created short branch `codex/batch-171-personal-learning-ai-result-fk-name-hardening`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing the FK-name hardening task and approved local
  schema/migration hardening.
- This approval is local-dev schema/migration hardening only.
- No provider call, sandbox execution, env/secret read or write, e2e, staging/prod/cloud, deploy, payment,
  external-service, PR, force-push, dependency/package/lockfile change, destructive database operation, formal generated
  content adoption, or Cost Calibration Gate is approved.

## Allowed Files

- `src/db/schema/ai-rag.ts`
- `src/db/schema/ai-rag.test.ts`
- `drizzle/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-171-personal-learning-ai-result-fk-name-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-171-personal-learning-ai-result-fk-name-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-171-personal-learning-ai-result-fk-name-hardening.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/app/**`, `src/features/**`, `src/ai/**`, `src/server/**`, `tests/**`, `e2e/**`.
- `materials/**`, `paper_assets/**`, `playwright-report/**`, `test-results/**`.
- Provider calls, provider configuration, sandbox execution, env/secret content, e2e, staging/prod/cloud, deploy,
  payment, external-service, PR, force-push, destructive database operation, dependency changes, formal generated content
  adoption, and Cost Calibration.

## Design

1. Replace the implicit long generated FK on `personal_ai_generation_result.ai_generation_task_id` with an explicit short
   name: `fk_personal_ai_generation_result_task`.
2. Keep the same referenced table, column, and `onDelete: "restrict"` behavior.
3. Generate a local Drizzle migration that renames/drops and recreates the FK constraint without data changes.
4. Run local migration only after `schemaMigration` capability gate passes. Evidence must stay redacted and must not
   include database URLs, secrets, row data, raw prompts, provider payloads, or raw generated output.

## TDD Plan

1. Add a failing schema test that expects the short FK name and rejects the previous long auto-generated FK name.
2. Run the targeted schema test and record RED.
3. Implement the minimal schema change using Drizzle's `foreignKey({ name, columns, foreignColumns })` table callback.
4. Generate/apply the local migration and rerun schema tests.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId batch-171-personal-learning-ai-result-fk-name-hardening -Capability schemaMigration -Intent use_capability`
- `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts`
- `pnpm.exe exec drizzle-kit generate`
- `pnpm.exe exec drizzle-kit migrate`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-171-personal-learning-ai-result-fk-name-hardening`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-171-personal-learning-ai-result-fk-name-hardening`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-171-personal-learning-ai-result-fk-name-hardening`

## Rollback And Recovery

- Schema rollback boundary: this task changes only the FK constraint name. If local migration fails, stop and record
  redacted evidence; do not run destructive database operations.
- Code rollback boundary: revert the batch-171 branch commit before merge if validation fails.
- Production/staging boundary: no staging/prod/cloud connection or migration is allowed.
