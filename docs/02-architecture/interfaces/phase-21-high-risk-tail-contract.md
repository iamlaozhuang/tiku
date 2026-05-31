# Phase 21 High-Risk Tail Closure Contract

## Status

Planning boundary for Phase 20 accepted deferred blockers.

## Purpose

Phase 21 exists to handle the two Phase 20 tasks that were intentionally left `blocked` because completing them crosses high-risk boundaries. This contract keeps those tail items auditable and prevents Phase 20 closeout from pretending that blocked work is complete.

The accepted Phase 20 closeout position is:

- `50` Phase 20 tasks are `closed`.
- `2` Phase 20 tasks remain `blocked` as accepted deferred blockers.
- There are no Phase 20 `pending`, `claimed`, `validated`, or `merged` tasks.

Post-governance queue representation:

- The 2026-05-31 historical queue closeout changes stale queue residues to `status: closed` with `closureDecision: deferred` or `closureDecision: superseded`, because automation scripts do not support `superseded` or `deferred` as primary status values.
- The two Phase 20 high-risk tail items remain deferred in meaning even when their queue rows are closed for governance hygiene.
- `closureDecision: deferred` is not an implementation-complete claim; it means future work requires a fresh approved task before source, schema, migration, test, e2e, env, provider, staging, prod, cloud, deploy, or dependency changes.

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

#### RA-06-01 Split Principle

`phase-20-fix-ra-06-01-admin-common-ux-concurrency-coverage` must not be implemented as one broad task. It is split into the smallest reviewable units below so UI state, write concurrency, and permission boundaries can be verified independently.

#### Subtask 1: `phase-21-tail-admin-common-ux-state-audit`

Goal:

- Prove common `admin` UX states without changing write semantics.

Scope:

- Loading, empty, error, disabled, confirmation, success, and failure states for shared admin shells and high-risk admin operation views.
- Candidate surfaces: `user`, `organization`, `employee`, `authorization`, `redeem_code`, content/knowledge management summaries, model configuration metadata, `audit_log`, and `ai_call_log` read views.
- Confirmation and danger-state copy for disabling users or organizations, cancelling `authorization`, employee import, redeem code batch generation, model config enable/disable, and fallback reordering where those surfaces already exist.

Suggested allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/app/**`
- `src/components/**`
- `src/features/admin/**`
- `tests/**`
- `e2e/**`

Suggested blocked files:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

Suggested risk types:

- `admin_ops`
- `browser_runtime`
- `local_human_verification`
- `evidence_integrity`

Suggested validation commands:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `git diff --check`

Approval needs:

- `auth_permission_model`: not required if this task only proves UI states over existing permission behavior.
- `transaction/concurrency`: not required if no write semantics change.
- `database_migration`: not approved and should remain blocked.
- `dependency_change`: not approved and should remain blocked.

#### Subtask 2: `phase-21-tail-admin-write-concurrency-proof`

Goal:

- Prove deterministic concurrency behavior for high-risk admin writes.

Scope:

- `authorization` creation and adjustment overlap checks by `organization`, `auth_scope_type`, `profession`, `level`, and effective date range.
- Employee import atomicity for accepted import batch behavior and conflict reporting.
- `redeem_code` batch generation idempotence or uniqueness guarantees.
- Any existing model configuration fallback reordering or enable/disable write path if it is part of the same admin operations surface.
- Conflict response contract using standard `{ code, message, data, pagination? }`, with `4096xx` conflict codes and camelCase fields.

Suggested allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/app/api/v1/**`
- `tests/**`
- `e2e/**`

Suggested blocked files:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `scripts/**`
- `src/db/schema/**` and `drizzle/**` unless the task evidence has explicit `database_migration` approval.

Suggested risk types:

- `admin_ops`
- `data_contract`
- `authorization`
- `transaction_concurrency`
- `local_human_verification`
- `evidence_integrity`

Suggested validation commands:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `git diff --check`

Approval needs:

- `transaction/concurrency`: required before changing write concurrency behavior, transaction boundaries, optimistic locking, conflict responses, or retry semantics.
- `auth_permission_model`: required if role checks or permission outcomes change.
- `database_migration`: required if implementation adds version columns, lock columns, uniqueness constraints, generated indexes, or migration files.
- `dependency_change`: required if any new concurrency, import, database, or test tooling is introduced.

#### Subtask 3: `phase-21-tail-admin-permission-boundary-review`

Goal:

- Prove admin role and permission boundaries for high-risk admin operations.

Scope:

- `super_admin`, `ops_admin`, and `content_admin` role matrix.
- Denial proof for disabled or non-admin users.
- Public identifier tampering proof for `user`, `organization`, `employee`, `authorization`, `redeem_code`, `audit_log`, `ai_call_log`, model configuration, content, and knowledge resources.
- Service-level permission checks, not UI-only hiding.
- Redaction rules for password hashes, session internals, redeem code clear text, provider credentials, raw prompts, raw answers, raw model outputs, raw chunks, and provider payloads.

Suggested allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/app/api/v1/**`
- `tests/**`
- `e2e/**`

Suggested blocked files:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

Suggested risk types:

- `admin_ops`
- `auth_permission_model`
- `authorization`
- `local_human_verification`
- `evidence_integrity`

Suggested validation commands:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `git diff --check`

Approval needs:

- `auth_permission_model`: required before changing role, scope, service permission, or denial behavior.
- `transaction/concurrency`: not required unless the task also changes high-risk writes.
- `database_migration`: not approved and should remain blocked.
- `dependency_change`: not approved and should remain blocked.

#### High-Risk Items Still Requiring Human Approval

- `auth_permission_model` for any role, permission, denial, organization scope, public identifier, or admin service authorization behavior change.
- `transaction/concurrency` for any transaction boundary, optimistic lock, atomic write, conflict response, retry behavior, or race-condition proof that changes runtime behavior.
- `database_migration` for any schema, migration, unique index, lock/version column, constraint, or Drizzle output.
- `dependency_change` for any new package, CLI, test runner, database helper, concurrency harness, or lockfile change.
- `browser_runtime` or local human verification approval if implementation claims rendered admin UX behavior beyond automated unit coverage.

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

- the queue records the two blockers either as `blocked` or as `closed` with `closureDecision: deferred`;
- this Phase 21 contract exists;
- Phase 21 queue tasks exist for both blocker families;
- `project-state.yaml` points handoff to Phase 21;
- closeout evidence records the `50 closed + 2 blocked` count.
