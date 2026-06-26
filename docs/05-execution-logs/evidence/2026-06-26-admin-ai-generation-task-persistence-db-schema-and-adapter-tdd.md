# Evidence: Admin AI Generation Task Persistence DB Schema And Adapter TDD

Task id: `admin-ai-generation-task-persistence-db-schema-and-adapter-tdd-2026-06-26`

## Summary

Implemented the approved local schema/migration and DB adapter TDD packet for admin AI generation task persistence.

Storage shape:

- shared lifecycle remains in `ai_generation_task`;
- narrow compatibility migration makes `ai_generation_task.ai_func_type` and `ai_generation_task.question_public_id`
  nullable;
- admin-only route/runtime/formal-boundary metadata is stored in companion table
  `admin_ai_generation_task_metadata`;
- DB adapter writes shared task lifecycle and companion metadata in one transaction.

## Requirement Mapping Result

- AI task domain: admin AI generation now has durable pending task lifecycle mapping through shared
  `ai_generation_task`.
- Organization admin AI generation: organization-owned admin tasks can carry organization owner/quota context in shared
  lifecycle fields and organization-specific metadata in the companion table.
- Content admin AI generation: platform/content review ownership can be represented without writing formal `question` or
  `paper` rows.
- Formal content separation: adapter insert values keep `question_public_id`, `paper_public_id`, formal write status,
  and result references non-lossy and blocked; formal adoption remains a separate task.
- Edition/authorization boundary: adapter preserves `authorizationSource`, `authorizationPublicId`, owner, quota owner,
  organization context, and `effectiveEdition = advanced` from the repository input.

## TDD Log

- RED schema command: `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts`
  - result: failed as expected;
  - failures: `ai_func_type` was still non-null, companion metadata table was missing, metadata indexes were missing.
- RED adapter command:
  `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts`
  - result: failed as expected;
  - failure: missing `admin-ai-generation-task-persistence-db-adapter` module.
- GREEN focused command:
  `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
  - result: pass;
  - files: 3 passed;
  - tests: 33 passed.

## Implementation Evidence

- `src/db/schema/ai-rag.ts`
  - `ai_generation_task.ai_func_type` is nullable only for shared lifecycle compatibility;
  - `ai_generation_task.question_public_id` is nullable only for non-lossy generation task compatibility;
  - added `adminAiGenerationTaskMetadata` with FK `fk_admin_ai_generation_task_metadata_task`;
  - added unique indexes for metadata public id, task id, and task public id;
  - added lookup indexes for workspace/generation kind, runtime bridge status, and request public id.
- `drizzle/20260626134500_add_admin_ai_generation_task_metadata.sql`
  - drops the two narrow NOT NULL constraints;
  - creates `admin_ai_generation_task_metadata`;
  - adds FK and indexes.
- `src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts`
  - builds non-lossy shared task insert values with `ai_func_type = null`, `question_public_id = null`, and
    `paper_public_id = null`;
  - builds companion metadata insert values with workspace, generation kind, authorization source, runtime bridge status,
    Provider-disabled flags, formal write boundary, source references, and redaction status;
  - writes task and metadata in one transaction;
  - rejects mapped DB rows that violate Provider-disabled or redacted boundaries.

## Migration Boundary

- Migration file created: yes.
- Drizzle metadata snapshot created: yes.
- Local DB migration executed: `false`.
- `drizzle-kit push` executed: `false`.
- Database connection executed: `false`.
- Destructive database operation executed: `false`.
- Seed/account mutation executed: `false`.

The current `drizzle.config.ts` reads `.env.local`, so migration SQL and snapshot were prepared without running
Drizzle Kit generation in this task.

## Safety Boundary

- Provider call/configuration/env/secret/credential read: `false`.
- Cost Calibration Gate: `false`.
- Formal `question`/`paper` write or adoption: `false`.
- Browser/e2e/dev-server: `false`.
- Staging/prod/payment/external service/deployment/release readiness: `false`.
- Package/lockfile change: `false`.
- Final Pass claim: `false`.

## Validation Log

- Schema migration capability gate: `pass`.
- Focused unit: `pass`, 3 files / 33 tests.
- Lint: `pass`.
- Typecheck: `pass`.
- Scoped Prettier write: `pass`.
- Scoped Prettier check: `pass`.
- `git diff --check`: `pass`.
- Module Run v2 pre-commit hardening: `pass`.
- Module Run v2 pre-push readiness: `pass_skip_remote_ahead_check`.

## Closeout Decision

Local schema/migration-file and DB adapter TDD packet: `PASS`.

This pass is limited to local source, tests, migration SQL, and Drizzle metadata. It does not approve or execute local DB
migration application, Provider/Cost smoke, formal `question`/`paper` writes, staging/prod, payment, external services,
deployment, release readiness, or final Pass.

Cost Calibration Gate remains blocked.
