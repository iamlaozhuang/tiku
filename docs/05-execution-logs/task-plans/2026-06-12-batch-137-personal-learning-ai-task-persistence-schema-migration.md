# Task Plan: batch-137-personal-learning-ai-task-persistence-schema-migration

## Scope

- Task id: `batch-137-personal-learning-ai-task-persistence-schema-migration`
- Branch: `codex/batch-137-personal-learning-ai-task-persistence-schema-migration`
- Task kind: `schema_migration`
- Goal: add the local dev Drizzle schema and migration surface for redacted personal learning AI request task metadata.
- Fresh approval: user explicitly approved batch-137 local dev schema/migration work limited to task-queue allowedFiles and local dev scope.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-136-personal-learning-ai-persistence-schema-approval-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-136-personal-learning-ai-persistence-schema-approval-gate.md`
- Drizzle skill references for `pgTable`, `getTableConfig`, index naming, and migration generation behavior.

## Verified Facts

- Current git baseline is `c540ea037656975878b5be83c1975f1a5a9d98af` on `master`, `origin/master`, and the batch-137 branch.
- Worktree was clean before edits.
- There are no local or remote `codex/*` branch residues other than the active batch-137 branch.
- `batch-136-personal-learning-ai-persistence-schema-approval-gate` is closed and records that batch-137 requires fresh approval.
- Fresh approval is present in the current user instruction for local dev schema/migration only.
- Existing `src/db/schema/ai-rag.ts` already owns `ai_call_log`, `model_provider`, `model_config`, and `prompt_template`.
- Existing schema tests use `getTableName` and `getTableConfig` to assert table, column, and index contracts.

## Allowed Files

- `src/db/schema/ai-rag.ts`
- `src/db/schema/ai-rag.test.ts`
- `drizzle/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`

## Blocked Files And Capabilities

- Blocked files: `.env*`, package/lockfiles, `src/app/**`, `src/features/**`, `src/server/repositories/**`,
  `src/server/services/**`, `src/server/contracts/**`, `src/server/mappers/**`, `e2e/**`, `playwright-report/**`, and
  `test-results/**`.
- Blocked capabilities: destructive DB operations, `drizzle-kit push`, staging/prod/cloud/env/provider/deploy/payment,
  external-service work, dependency/package/lockfile changes, real provider calls, formal generated-content write paths,
  authorization model changes, PR, force-push, and Cost Calibration Gate execution.

## Migration Plan

1. Use TDD: first add focused schema tests that require a new `ai_generation_task` table with redacted metadata fields,
   public identifiers, owner/session metadata, status, idempotency hash, optional `ai_call_log` linkage, timestamps, and
   naming-compliant indexes.
2. Verify the focused schema test fails because the table is not implemented.
3. Add the table and enum definitions in `src/db/schema/ai-rag.ts` only.
4. Generate or add a reviewed migration under `drizzle/**` without using `drizzle-kit push` and without touching
   staging/prod/cloud connections.
5. Verify focused schema tests, lint, typecheck, full unit tests, build, diff check, LocalCapabilityGate
   `schemaMigration`, pre-commit hardening, module closeout, and pre-push readiness.

## Rollback / Recovery

- Schema rollback is local-dev only: revert this batch commit to remove `ai_generation_task` schema and migration.
- If a local dev database migration has already been applied, recover by applying a reviewed local-only rollback or
  recreating the disposable local dev database after explicit local-destructive approval if destructive cleanup is needed.
- No staging/prod/cloud database is connected or modified by this task.

## Evidence Redaction

- Evidence records commands, exit status, table/index names, and pass/fail summaries only.
- Evidence must not include database URLs, row data, secrets, tokens, provider payloads, raw prompts, raw answers, raw
  generated content, formal `question` or `paper` content, or internal numeric ids from runtime data.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Focused TDD:
  `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts`
- Required batch gates:
  `npm.cmd run lint`
  `npm.cmd run typecheck`
  `npm.cmd run test:unit`
  `npm.cmd run build`
  `git diff --check`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId batch-137-personal-learning-ai-task-persistence-schema-migration -Capability schemaMigration -Intent use_capability`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-137-personal-learning-ai-task-persistence-schema-migration`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-137-personal-learning-ai-task-persistence-schema-migration`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-137-personal-learning-ai-task-persistence-schema-migration`

## Stop Conditions

- Any need to edit blocked files.
- Any need for destructive DB operations, `drizzle-kit push`, staging/prod/cloud connection, provider/env/dependency,
  deploy/payment/external-service work, generated-content writes, or Cost Calibration Gate execution.
- Any validation requiring secrets, database URLs, provider payloads, raw prompts, raw answers, generated content, or
  database row evidence.
