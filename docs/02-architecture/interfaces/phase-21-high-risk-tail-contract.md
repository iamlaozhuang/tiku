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
