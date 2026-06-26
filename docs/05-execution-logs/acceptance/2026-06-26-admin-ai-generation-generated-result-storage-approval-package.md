# Approval Package: Admin AI Generation Generated Result Storage

Task id: `admin-ai-generation-generated-result-storage-approval-package-2026-06-26`

Decision status:
`APPROVE_NEXT_SCHEMA_CONTRACT_ADAPTER_TDD_FOR_ADMIN_AI_GENERATION_RESULT_STORAGE_FAKE_FIXTURES_ONLY`

## Decision

Approve a future source TDD task for backend admin AI generation generated result storage, with these limits:

- use an isolated companion table named `admin_ai_generation_result`;
- link each generated result to one `ai_generation_task`;
- keep `admin_ai_generation_task_metadata` as metadata only;
- do not expand `ai_generation_task` with generated content columns;
- do not write formal `question` or `paper` records in the storage task;
- do not call a Provider in the storage task;
- use fake normalized generated result fixtures only for TDD.

This approval package itself is docs/state-only and does not approve any current schema, migration, adapter, route, DB,
Provider, or formal content write execution.

## Storage Shape Decision

The future table should follow the existing personal result pattern while adding backend admin scoping:

- `public_id`
- `ai_generation_task_id`
- `task_public_id`
- `request_public_id`
- `workspace`
- `generation_kind`
- `owner_type`
- `owner_public_id`
- `organization_public_id`
- `task_type`
- `result_status`
- `content_redacted_snapshot`
- `content_digest`
- `content_preview_masked`
- `citation_redacted_snapshot`
- `evidence_status`
- `citation_count`
- `ai_call_log_public_id`
- `source_question_public_id`
- `source_paper_public_id`
- `is_formal_adoption_blocked`
- `created_at`
- `updated_at`

Recommended result statuses for the first implementation: `draft` and `discarded`.

The future adapter may update `ai_generation_task.result_public_id`, task status, evidence status, citation count, and
call-log public id in the same transaction when a valid generated result row is created. It must not update
`question_public_id`, `paper_public_id`, or any formal content table.

## Current Provider-Disabled Boundary

Provider-disabled local-contract tasks must continue to expose:

- `resultPublicId: null`;
- `contentVisibility: summary_only`;
- `evidenceStatus: none`;
- `citationCount: 0`;
- `runtimeStatus: local_contract_only`;
- `runtimeBridgeStatus: provider_call_blocked`;
- `questionWriteStatus: blocked_without_follow_up_task`;
- `paperWriteStatus: blocked_without_follow_up_task`.

No generated result row should be created for a Provider-disabled local-contract-only request.

## Future Source TDD Approval

This package approves only the following future task type:

`admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd-2026-06-26`

Allowed in that future task:

- local source, schema, migration, and focused unit test changes for `admin_ai_generation_result`;
- repository/adapter contract for creating, reading, and summarizing generated result drafts;
- fake normalized result fixtures that represent already validated generated `question` or `paper` content;
- redacted DTOs with summary/preview/digest/citation metadata;
- no live DB connection requirement unless separately approved after migration execution.

Still blocked in that future task without fresh approval:

- applying the migration to any DB;
- route smoke against a live DB;
- Provider/model call or Provider configuration;
- raw prompt, raw Provider payload, or raw generated output evidence;
- formal `question` or `paper` write/adoption;
- staging/prod, payment, external service, deployment, release readiness, or final Pass.

## Redaction And Evidence Policy

Evidence may record only:

- table/contract names;
- status/category decisions;
- route/workspace/workflow categories;
- whether fake fixture coverage passed;
- counts and safe metadata fields;
- content digest and masked preview shape, not the underlying generated content.

Evidence must not record:

- raw prompt;
- raw generated output;
- raw Provider payload;
- raw DB rows;
- API key, token, cookie, Authorization header, database URL, private account file, localStorage, or sessionStorage;
- public identifier lists;
- internal numeric ids;
- full unpublished `question`, `paper`, `material`, answer, or explanation content.

## Review And Adoption Boundary

Generated result storage is only a draft/review holding area.

Formal adoption remains a separate approval and implementation boundary. A later adoption package must define:

- content admin review workflow;
- organization-owned draft lifecycle;
- validation before formal `question` or `paper` write;
- audit log requirements;
- duplicate handling;
- permission and quota effects.

## Failure Branches

The future source TDD task must stop at the smallest diagnostic if any of these occur:

- schema design would require storing raw Provider payloads;
- generated content would be written directly to formal `question` or `paper` tables;
- route or UI changes require live DB smoke before migration execution approval;
- implementation requires Provider credentials or real model calls;
- evidence cannot be kept redacted.

## Explicit Non-Approvals

This package does not approve:

- implementing generated result storage in this task;
- applying any migration or connecting to a DB;
- route smoke, browser/dev-server/e2e, or live DB validation;
- Provider/model calls, Provider configuration, env/secret reads, or Cost Calibration;
- formal `question` or `paper` write/adoption;
- staging/prod/cloud/deploy, payment, external-service work, PR, force push, release readiness, or final Pass.

Cost Calibration Gate remains blocked.
