# Admin AI Generation Task Persistence DB Schema Mapping Approval Package

Task id: `admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`

Decision type: `docs_only_db_schema_mapping_approval_package`

## Decision Summary

Selected storage shape: add an admin metadata companion table linked to shared `ai_generation_task`.

Do not extend `ai_generation_task` with all admin-specific fields. Do not create a fully separate backend AI generation
task lifecycle table.

The selected shape is:

1. keep `ai_generation_task` as the shared lifecycle table;
2. add a dedicated `admin_ai_generation_task_metadata` companion table for content/organization admin metadata;
3. require a narrow future schema approval to make current personal/RAG-oriented required fields compatible with
   non-lossy admin AI tasks before any real DB adapter is written.

This package is not schema approval and does not implement the migration or adapter.

## Why Companion Metadata Table

The existing admin persistence contract needs metadata that is not lifecycle state:

- `workspace`: `content` or `organization`;
- `generation_kind`: `question` or `paper`;
- `authorization_source`: `admin_role` or `org_auth`;
- `runtime_status` and `runtime_bridge_status`;
- Provider-disabled execution boundary flags;
- formal `question`/`paper` write boundary flags;
- source `question`/`paper` references when present;
- `result_kind`, content visibility, and redaction status.

Putting these fields directly into `ai_generation_task` would make a shared lifecycle table carry admin-only route,
review, and formal-content boundary concerns. A companion table keeps shared task lifecycle reusable while keeping admin
metadata explicit and isolated.

## Rejected Options

### Reject: Extend `ai_generation_task` With All Admin Fields

Reason:

- pollutes the shared lifecycle table with admin-only review and route fields;
- makes personal learner task history carry irrelevant nullable columns;
- mixes formal content adoption boundary with lifecycle/status concerns;
- still does not solve future isolated result/review storage.

### Reject: New Backend AI Generation Task Lifecycle Table

Reason:

- duplicates lifecycle status, retry, idempotency, owner/quota, and `ai_call_log` linkage already modeled by
  `ai_generation_task`;
- risks divergent transition semantics between learner/admin tasks;
- makes cross-workflow quota and operations summaries harder to normalize.

## Required Minimal Shared Table Compatibility

A later approved schema task must not write placeholder values into existing required fields.

The adapter must not map admin AI paper generation into fake `question_public_id`, fake `ai_func_type`, or formal
`paper_public_id` values.

Required compatibility decision for `ai_generation_task` before admin DB adapter implementation:

- allow `question_public_id` to be `null` for `task_type` values that do not start from a formal source question;
- allow `ai_func_type` to be `null` for generation lifecycle tasks whose function is already represented by
  `task_type`;
- keep `paper_public_id`, `mock_exam_public_id`, and `answer_record_public_id` nullable and unused for admin draft
  tasks unless a later source-reference policy explicitly approves a non-formal reference.

This is a narrow compatibility migration, not approval to add all admin metadata to `ai_generation_task`.

## Proposed Companion Table Contract

Future schema name:

`admin_ai_generation_task_metadata`

Proposed fields:

| field                         | purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `id`                          | internal BIGINT primary key                               |
| `public_id`                   | public metadata reference                                 |
| `ai_generation_task_id`       | FK to `ai_generation_task.id`                             |
| `task_public_id`              | public task reference mirror for route/service lookups    |
| `request_public_id`           | request id mirror                                         |
| `workspace`                   | `content` or `organization`                               |
| `generation_kind`             | `question` or `paper`                                     |
| `authorization_source`        | `admin_role` or `org_auth`                                |
| `result_kind`                 | `ai_generated_question_set` or `ai_generated_paper_draft` |
| `content_visibility`          | first-release value `summary_only`                        |
| `runtime_status`              | first-release value `local_contract_only`                 |
| `runtime_bridge_status`       | first-release value `provider_call_blocked`               |
| `provider_call_executed`      | must be `false` in Provider-disabled route                |
| `env_secret_accessed`         | must be `false` in Provider-disabled route                |
| `provider_configuration_read` | must be `false` in Provider-disabled route                |
| `cost_calibration_executed`   | must be `false` in Provider-disabled route                |
| `question_write_status`       | formal question write boundary                            |
| `paper_write_status`          | formal paper write boundary                               |
| `source_question_public_id`   | nullable source reference, not a formal write             |
| `source_paper_public_id`      | nullable source reference, not a formal write             |
| `redaction_status`            | first-release value `redacted`                            |
| `created_at`                  | creation timestamp                                        |
| `updated_at`                  | update timestamp                                          |

Recommended constraints and indexes:

- unique `ai_generation_task_id`;
- unique `task_public_id`;
- index on `workspace, generation_kind`;
- index on `runtime_bridge_status`;
- index on `request_public_id`.

## Mapping To Existing `ai_generation_task`

| existing field              | admin mapping                                                  |
| --------------------------- | -------------------------------------------------------------- |
| `public_id`                 | `taskPublicId`                                                 |
| `request_public_id`         | admin request public id                                        |
| `task_type`                 | `ai_question_generation` or `ai_paper_generation`              |
| `ai_func_type`              | must become nullable for generation lifecycle tasks            |
| `authorization_public_id`   | `authorizationPublicId`                                        |
| `actor_public_id`           | requesting admin public id                                     |
| `owner_type`                | `platform` for content, `organization` for organization admin  |
| `owner_public_id`           | platform/content owner id or organization public id            |
| `organization_public_id`    | `null` for content, organization public id for organization    |
| `quota_owner_type`          | `platform` or `organization`                                   |
| `quota_owner_public_id`     | owner quota public id                                          |
| `effective_edition`         | `advanced`                                                     |
| `question_public_id`        | must become nullable; source question lives in metadata if any |
| `answer_record_public_id`   | `null`                                                         |
| `paper_public_id`           | `null`; source paper lives in metadata if any                  |
| `mock_exam_public_id`       | `null`                                                         |
| `idempotency_key_hash`      | repository idempotency key hash                                |
| `task_status`               | `pending` first                                                |
| `retry_count`               | `0` first                                                      |
| `failure_category`          | `null` first                                                   |
| `result_public_id`          | `null` first; result storage remains separate                  |
| `evidence_status`           | `none` first                                                   |
| `citation_count`            | `0` first                                                      |
| `is_authorization_active`   | `true` for accepted local contract                             |
| `is_scope_allowed`          | `true` for accepted local contract                             |
| `is_quota_available`        | `true` for accepted local contract                             |
| `is_runtime_config_ready`   | `true` for accepted Provider-disabled local contract           |
| `ai_call_log_id`            | `null` until real Provider/log path is separately approved     |
| `ai_call_log_public_id`     | `null` until real Provider/log path is separately approved     |
| `requested_at`              | request timestamp                                              |
| `started_at`, `finished_at` | `null` while pending                                           |
| `created_at`, `updated_at`  | DB timestamps                                                  |

## Adapter Boundary If Later Approved

A later implementation task may add a real admin DB adapter only after fresh schema/migration approval. The adapter must:

- write `ai_generation_task` and `admin_ai_generation_task_metadata` in one transaction;
- reject lossy placeholder mapping;
- keep production/default Provider execution blocked unless a separate Provider task changes that boundary;
- write no formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`;
- record redacted evidence only.

## Result Storage Boundary

This decision covers task persistence metadata only.

It does not approve generated result storage. Content admin review drafts and organization-owned AI draft content need a
separate result/review storage package before raw or redacted generated output is persisted.

## Approval Request For Next Work

Recommended next task if the owner approves schema work:

`admin-ai-generation-task-persistence-db-schema-and-adapter-tdd-2026-06-26`

Required fresh approval scope:

- local schema/migration generation for the narrow compatibility migration and companion table;
- focused DB adapter TDD using local-only tests or static adapter tests;
- no Provider call, no env/secret read, no formal content write, no staging/prod, no payment, no external service, no
  release/final Pass claim.

## Non-Decision Statement

This package does not implement route persistence, DB adapter, schema, migration, seed, Provider execution, Cost
Calibration, formal content adoption, result storage, staging/prod readiness, payment, external-service readiness,
deployment readiness, release readiness, or final Pass.
