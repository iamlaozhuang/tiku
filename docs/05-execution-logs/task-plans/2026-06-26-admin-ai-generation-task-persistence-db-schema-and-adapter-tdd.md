# Task Plan: Admin AI Generation Task Persistence DB Schema And Adapter TDD

Task id: `admin-ai-generation-task-persistence-db-schema-and-adapter-tdd-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-contract-and-repository-tdd.md`

## Scope

Approved by the current user request:

- local Drizzle schema changes in `src/db/schema/ai-rag.ts`;
- local migration SQL and Drizzle metadata snapshot for a narrow compatibility migration;
- companion table `admin_ai_generation_task_metadata`;
- focused DB adapter TDD for the existing admin AI generation task persistence port.

Explicitly excluded:

- Provider calls, Provider configuration, env/secret/credential reads;
- Cost Calibration Gate;
- formal `question` or `paper` writes, adoption, publish, or result storage;
- DB migration execution, destructive DB operations, seed/account mutation;
- staging/prod, payment, external service, deployment/release readiness, or final Pass.

## Implementation Plan

1. Add failing schema tests for:
   - `ai_generation_task.ai_func_type` nullable for generation lifecycle tasks;
   - `ai_generation_task.question_public_id` nullable for admin generation tasks without a source formal question;
   - `admin_ai_generation_task_metadata` table, columns, FK, unique indexes, and lookup indexes.
2. Add failing DB adapter tests for:
   - non-lossy admin task insert values with `ai_func_type` and `question_public_id` set to `null`;
   - companion metadata insert values preserving workspace, generation kind, runtime bridge status, Provider-disabled flags, formal write boundary, and redaction fields;
   - joined DB row mapping back to the existing gateway row without exposing internal ids or raw AI payload fields.
3. Implement schema changes:
   - remove `.notNull()` from `ai_func_type` and `question_public_id` in `ai_generation_task`;
   - add `adminAiGenerationTaskMetadata` as a companion metadata table linked to `aiGenerationTask.id`;
   - keep admin-specific route/runtime/formal-boundary metadata out of the shared lifecycle table.
4. Add migration SQL manually because the current `drizzle.config.ts` reads `.env.local`; this task must not read env/secret files.
5. Implement a Postgres DB adapter module that writes shared task lifecycle and companion metadata in one transaction, with Provider-disabled defaults and no formal content writes.

## Risk Defenses

- No `drizzle-kit push`, no local DB connection, no migration execution.
- No placeholder `ai_func_type`, fake `question_public_id`, fake `paper_public_id`, or raw generated content fields.
- DB adapter insert builders are unit-tested separately from runtime DB connection.
- Companion table uses `text` for service-owned status fields to avoid introducing new enum migration risk in this narrow task.
- Evidence records command outcomes and summaries only; no raw prompts, raw output, provider payloads, credentials, tokens, cookies, Authorization headers, DB URLs, or internal row data.

## Validation Plan

- RED: `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts`
- RED: `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts`
- Capability gate: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-task-persistence-db-schema-and-adapter-tdd-2026-06-26 -Capability schemaMigration -Intent use_capability`
- GREEN: `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- scoped Prettier check
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness with remote-ahead check skipped for local branch closeout readiness

Cost Calibration Gate remains blocked.
