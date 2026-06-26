# Admin AI generation formal adoption DB/schema adapter or route integration approval package

Task id: `admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26`

## Decision

Status: `APPROVE_NEXT_SCHEMA_ADAPTER_TDD_BOUNDARY_ONLY`.

This package recommends the following durable landing zone and execution order. It does not execute the work.

## Durable Landing Zone

Use a new companion table named `admin_ai_generation_formal_adoption` for formal adoption metadata.

Do not extend `admin_ai_generation_result` with formal target write columns beyond its existing blocked-adoption flag and redacted generated-result summary fields.

Do not create a new backend AI generation task table. Continue using:

- `ai_generation_task` for shared task lifecycle;
- `admin_ai_generation_task_metadata` for admin route/task metadata;
- `admin_ai_generation_result` for isolated redacted generated-result history;
- new `admin_ai_generation_formal_adoption` companion table for reviewed adoption metadata.

## Proposed Companion Table Contract

The future companion table should store metadata only:

- `public_id`
- `source_result_public_id`
- `source_task_public_id`
- `source_request_public_id`
- `workspace`
- `generation_kind`
- `owner_type`
- `owner_public_id`
- `organization_public_id`
- `target_type`
- `target_domain`
- `review_status`
- `formal_target_write_status`
- `formal_question_public_id`
- `formal_paper_public_id`
- `reviewer_public_id`
- `reviewed_at`
- `content_digest`
- `content_preview_masked`
- `evidence_status`
- `citation_count`
- `ai_call_log_public_id`
- `created_at`
- `updated_at`

Recommended constraints:

- unique `public_id`;
- unique source/target/domain tuple: `source_result_public_id`, `target_type`, `target_domain`;
- indexes for source result, reviewer, target write status, and created time;
- foreign key to `admin_ai_generation_result.public_id` only if the schema convention supports public-id references consistently; otherwise use an indexed text reference and keep repository-level lookup enforcement.

## Formal Draft Adapter Decision

Do not wire admin routes directly to `question` or `paper` repositories.

Introduce a narrow formal draft adapter in a later approved implementation task. The adapter should be the only place allowed to map reviewed admin AI generated content into formal question or paper draft commands.

The adapter must remain blocked until both conditions are true:

- the adoption metadata companion table and DB adapter are implemented and locally verified;
- a reviewed structured content source is approved for draft creation.

Current `admin_ai_generation_result` data contains redacted snapshots, digest, and masked preview. That is sufficient for adoption metadata and history, but not sufficient by itself to create a usable formal `question` or `paper` draft.

## Execution Order

1. `admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26`
   - Add local schema and migration file for `admin_ai_generation_formal_adoption`.
   - Add Drizzle DB adapter and focused unit tests.
   - Do not execute migration and do not connect live DB.

2. `admin-ai-generation-formal-adoption-local-migration-execution-approval-package-2026-06-26`
   - Separately approve whether to apply the local migration.
   - Decide the exact local DB smoke limit and redacted evidence fields.

3. `admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26`
   - If freshly approved, apply the local migration only.
   - No staging/prod, destructive DB work, Provider, env/secret, or formal draft write.

4. `admin-ai-generation-formal-adoption-route-integration-tdd-2026-06-26`
   - Wire the admin formal adoption command route to the adoption repository/DB adapter.
   - Route response may record/reuse adoption metadata.
   - `formalTargetWriteStatus` must remain `blocked_without_follow_up_task`.

5. `admin-ai-generation-formal-adoption-local-route-smoke-approval-package-2026-06-26`
   - Separately approve at most two local route smoke calls against the adoption metadata route.
   - Evidence must stay redacted and must not include full generated content.

6. `admin-ai-generation-formal-draft-adapter-contract-tdd-2026-06-26`
   - Decide and test the narrow adapter for formal question/paper draft creation.
   - Requires a reviewed structured content source; it must not derive drafts from masked previews alone.

## Local Migration And Route Smoke Boundary

This package does not approve execution.

Recommended future execution limits if separately approved:

- local migration execution: one local Drizzle migration run only;
- local route smoke: at most two calls, using content-admin platform adoption metadata workflows only;
- no direct formal `question` or `paper` creation in smoke;
- no organization-scoped adoption unless separately approved;
- no DB row dump, private credential evidence, generated content body, Provider invocation, or staging/prod access.

## Blocked Gates

- schema/migration edit or execution in this task;
- live DB connection or DB mutation in this task;
- route integration or route smoke in this task;
- formal question/paper draft creation;
- organization-scoped adoption;
- Provider/model call and credential/env access;
- staging/prod, payment, external service, deployment, release readiness;
- Cost Calibration and final Pass.

## Closeout Decision

Result: `PASS_APPROVAL_PACKAGE_PREPARED`.

The next recommended task is `admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26`, only if the user approves schema/migration-file and DB-adapter TDD scope.
