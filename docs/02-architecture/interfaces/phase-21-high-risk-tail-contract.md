# Phase 21 High-Risk Tail Closure Contract

## Status

Planning boundary for Phase 20 accepted deferred blockers.

## Purpose

Phase 21 exists to handle the two Phase 20 tasks that were intentionally left `blocked` because completing them crosses high-risk boundaries. This contract keeps those tail items auditable and prevents Phase 20 closeout from pretending that blocked work is complete.

The accepted Phase 20 closeout position is:

- `50` Phase 20 tasks are `closed`.
- `2` Phase 20 tasks remain `blocked` as accepted deferred blockers.
- There are no Phase 20 `pending`, `claimed`, `validated`, or `merged` tasks.

## Deferred Blockers

### `phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence`

Reason for deferral:

- Durable retry persistence for `ai_scoring` timeout and retry state requires an approved storage design.
- Current evidence shows no approved `answer_record` storage column or separate attempt table for retry count, last failure, attempt snapshots, or retry timing.
- Completing the task requires `database_migration` approval.

### `phase-20-fix-ra-06-01-admin-common-ux-concurrency-coverage`

Reason for deferral:

- The remaining proof spans common admin UX states, role-specific write behavior, and concurrency/atomicity for high-risk admin mutations.
- Completing the task as one implementation unit would mix UI, permission, repository, transaction, and possible test tooling concerns.
- The task must be split into smaller Phase 21 planning and implementation tasks.

## Phase 21 Scope

Phase 21 is limited to high-risk tail closure for the two accepted deferred blockers.

Allowed planning work:

- Document schema intent and migration approval requirements.
- Document admin write concurrency and permission boundary split.
- Register queue tasks with explicit allowed files, blocked files, validation commands, and risk gates.
- Keep original Phase 20 blocked evidence intact.

Allowed implementation work only after task-specific approval:

- Local migration design and reviewed migration generation for AI scoring retry persistence.
- Source, test, and e2e changes required by approved implementation tasks.
- Local-only admin UX state coverage and deterministic concurrency proof after approvals are recorded.

## Non-Goals

- No `.env.local` or `.env.example` read or write.
- No secret creation, rotation, exposure, or environment variable change.
- No dependency, package, or lockfile change without a dedicated dependency approval task.
- No staging, production, cloud, deploy, object storage, real provider, or external service work.
- No destructive data operation, force push, or `drizzle-kit push`.
- No claim that the two Phase 20 blocked tasks are completed until their Phase 21 implementation tasks close.

## Required Approval Gates

### AI Scoring Retry Persistence

Before implementation, evidence must record:

- target schema design and whether storage lives on `answer_record` or a dedicated `ai_scoring` attempt structure;
- exact table and column names;
- migration generation command;
- data preservation rule for existing rows;
- rollback plan;
- validation commands;
- explicit approval for `database_migration`;
- explicit statement that destructive migration and force schema push remain forbidden.

#### Design Candidate A: `answer_record` Retry Fields

Store only the current durable retry state on `answer_record`.

Suggested additive fields:

- `ai_scoring_status`: current retry lifecycle state, using lower `snake_case` string values such as `pending`, `running`, `succeeded`, `failed`, `retry_scheduled`, and `abandoned`.
- `ai_scoring_retry_count`: non-negative retry count for the active scoring lifecycle.
- `ai_scoring_last_failed_at`: last scoring failure time, nullable.
- `ai_scoring_next_retry_at`: next retry schedule time, nullable.
- `ai_scoring_failure_code`: redaction-safe failure category, nullable.
- `ai_scoring_snapshot`: redaction-safe JSON snapshot of model config, prompt template reference, retry policy, scoring status, and attempt summary.

Benefits:

- Smallest schema surface for the MVP.
- Fast lookup from an `answer_record` without a join.
- Simple rollback before runtime use because all fields are additive and nullable.

Tradeoffs:

- Loses per-attempt history unless `ai_scoring_snapshot` stores a compact summary.
- Harder to audit retry timing and failure evolution.
- Concurrent retries need careful compare-and-update behavior on the row to prevent stale overwrite.

Use this only if Phase 21 implementation scope is limited to current-state persistence and does not need attempt-level audit.

#### Design Candidate B: Dedicated `ai_scoring_attempt` Structure

Store retry lifecycle history in a dedicated table keyed to `answer_record`.

Suggested table: `ai_scoring_attempt`.

Suggested additive fields:

- `id`: internal BIGINT primary key.
- `answer_record_id`: foreign key to `answer_record`.
- `attempt_no`: one-based attempt number within an answer record.
- `ai_call_log_id`: nullable internal reference to `ai_call_log` when a call record exists.
- `status`: attempt status using lower `snake_case` string values such as `pending`, `running`, `succeeded`, `failed`, `timeout`, and `cancelled`.
- `failure_code`: redaction-safe failure category, nullable.
- `failure_message_digest`: non-reversible digest or stable category for troubleshooting, nullable.
- `scheduled_at`: planned attempt time.
- `started_at`: actual start time, nullable.
- `finished_at`: actual finish time, nullable.
- `retry_after_at`: next retry eligibility time, nullable.
- `attempt_snapshot`: redaction-safe JSON snapshot for model config public reference, prompt template key/version, retry policy, timeout, and evidence status.
- `created_at` and `updated_at`: standard timestamps.

Suggested indexes:

- `idx_ai_scoring_attempt_answer_record_id`
- `idx_ai_scoring_attempt_status`
- `idx_ai_scoring_attempt_retry_after_at`
- `udx_ai_scoring_attempt_answer_record_id_attempt_no`

Benefits:

- Preserves durable per-attempt audit history without overloading `answer_record`.
- Supports deterministic retry, timeout, and concurrency proof.
- Keeps future retry policy and `ai_call_log` correlation easier to inspect.

Tradeoffs:

- Larger migration and repository surface.
- Requires service and repository joins or separate queries for scoring detail views.
- Requires a clear retention rule so this table does not become a raw AI payload sink.

Recommendation:

- Prefer Candidate B for implementation because retry persistence is an audit and concurrency concern, not just a display state.
- Candidate A remains acceptable only for a deliberately smaller MVP if the human owner approves losing attempt history.

#### Migration Approval Evidence Required

Before any implementation task may change schema, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**`, evidence must record:

- selected candidate: Candidate A, Candidate B, or a reviewed hybrid;
- exact table and field list, with `snake_case` database names and no unregistered abbreviations;
- generated migration file name using `{YYYYMMDDHHMMSS}_{description}.sql`;
- migration generation command, for example `corepack pnpm@10 exec drizzle-kit generate`, with a secret-safe environment plan;
- note that current Drizzle configuration may load `.env.local`; running a migration command must not print, copy, or expose secret values and may require separate `secret_or_env_change` approval if env content must be read or modified;
- data preservation rule for existing `answer_record` rows;
- backfill rule for nullable fields or empty attempt history;
- rollback plan for `dev`, `staging`, and `prod`, with destructive rollback still blocked unless separately approved;
- validation commands for unit, e2e, naming, readiness, quality gate, and `git diff --check`;
- explicit human approval for `database_migration`.

#### Data Retention Rule

- Persist only redaction-safe retry metadata, status, timestamps, public references, failure categories, digests, retry policy, and evidence status.
- Do not store raw prompts, raw student answers, raw model responses, raw provider payloads, Authorization headers, API keys, database URLs, full papers, or customer/customer-like private data.
- Keep retry metadata for the same retention window as the related `answer_record` and `exam_report` unless a later retention task defines a shorter purge policy.
- If `answer_record` deletion or anonymization is introduced later, retry metadata must follow the same deletion or anonymization boundary.

#### Rollback Plan

- Design-only rollback: revert this contract section, the task plan, evidence, and queue/project-state updates.
- Pre-runtime migration rollback in `dev`: after reviewed backup or disposable local data confirmation, drop only the newly added nullable fields or `ai_scoring_attempt` table created by the approved migration.
- Post-runtime rollback: disable retry scheduling in application configuration or code first, preserve existing retry metadata for audit, and only remove schema after separate approval confirms data export, retention impact, and restore path.
- `drizzle-kit push`, destructive migration, production data deletion, force push, staging/prod changes, and real provider work remain forbidden.

### Admin Concurrency And Permission Tail

Before implementation, evidence must record:

- exact admin surfaces in scope;
- role and permission matrix;
- whether repository transaction, optimistic concurrency, or existing atomic operation is used;
- conflict response contract;
- focused unit, route, or e2e validation plan;
- explicit approval for `auth_permission_model` if permission behavior changes;
- explicit approval for schema/migration or dependency changes if needed.

## Task Split

Phase 21 begins with two planning tasks:

1. `phase-21-tail-ai-scoring-retry-persistence-design`
   - docs-only design and approval checklist for AI scoring retry persistence.
2. `phase-21-tail-admin-concurrency-permission-split-design`
   - docs-only split plan for RA-06-01 into safe implementation units.

Implementation tasks remain blocked until their design and human approval evidence exists:

- `phase-21-tail-ai-scoring-retry-persistence-implementation`
- `phase-21-tail-admin-common-ux-state-audit`
- `phase-21-tail-admin-write-concurrency-proof`
- `phase-21-tail-admin-permission-boundary-review`

## Security And Evidence Rules

- Evidence must not include tokens, secrets, passwords, raw prompts, raw answers, raw model responses, provider payloads, database URLs, full papers, full textbooks, customer data, or raw private content.
- API response examples must keep `{ code, message, data, pagination? }`.
- JSON fields must remain camelCase.
- External references must use public identifiers; internal auto-increment `id` values remain internal.
- Any future security review must use `docs/04-agent-system/sop/security-review-gate.md`.

## Closeout Rule

Phase 20 may be described as closed with accepted deferred blockers only when:

- the queue still records the two blockers as `blocked`;
- this Phase 21 contract exists;
- Phase 21 queue tasks exist for both blocker families;
- `project-state.yaml` points handoff to Phase 21;
- closeout evidence records the `50 closed + 2 blocked` count.
