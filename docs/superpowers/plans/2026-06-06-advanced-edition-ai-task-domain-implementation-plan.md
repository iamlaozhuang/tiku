# Advanced Edition AI Task Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the provider-agnostic local task lifecycle for advanced edition AI question generation, AI `paper` generation, and organization training generation without real provider execution.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. The AI task domain owns task submission, status transition, recovery metadata, cancellation, retry, redacted logging, and handoff snapshots; generation-specific flows consume it instead of duplicating lifecycle logic.

**Tech Stack:** TypeScript, existing API response contract, existing service/repository/model patterns, existing `model_config` runtime selection and redacted `ai_call_log` snapshot patterns, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing AI scoring service: `src/server/services/ai-scoring-service.ts`.
- Existing local mock provider runtime: `src/server/services/ai-mock-provider-runtime.ts`.
- Existing `ai_call_log` append and admin listing runtime: `src/server/repositories/admin-ai-audit-log-runtime-repository.ts` and `src/server/services/admin-ai-audit-log-runtime.ts`.
- Existing audit and `ai_call_log` ops service: `src/server/services/admin-ai-audit-log-ops-service.ts`.
- Existing `model_config` runtime selector: `src/server/services/model-config-runtime.ts`.
- Existing AI scoring attempt repository: `src/server/repositories/ai-scoring-attempt-repository.ts`.
- Existing AI/RAG validator and redaction helpers: `src/server/validators/ai-rag.ts` and `src/server/models/ai-rag.ts`.

The current code has scoring-specific attempt tracking and redacted AI call logging, but does not yet provide a reusable `ai_generation_task` lifecycle domain for advanced edition generation flows.

## Future File Structure

Future implementation should keep the lifecycle domain separate from personal and organization generation business rules.

- Create: `src/server/contracts/ai-generation-task-contract.ts`
  - Public DTOs, API-safe status values, query filters, and error codes.
- Create: `src/server/models/ai-generation-task.ts`
  - Internal lifecycle types, transition rules, snapshot redaction helpers, and failure classification.
- Create: `src/server/repositories/ai-generation-task-repository.ts`
  - Persistence boundary for task creation, idempotency lookup, status transition, retry metadata, cancellation, recovery scans, and audit summary append.
- Create: `src/server/services/ai-generation-task-service.ts`
  - Provider-agnostic orchestration for submit, cancel, claim, complete, fail, retry, and recover.
- Create: `src/server/mappers/ai-generation-task-mapper.ts`
  - Convert internal rows to camelCase DTOs without numeric ids, raw prompt, raw provider payload, or secret material.
- Create: `src/server/validators/ai-generation-task.ts`
  - Normalize task submission, cancellation, and listing inputs.
- Modify, only if a REST surface is included in the implementation task: `src/app/api/v1/ai-generation-tasks/route.ts` and `src/server/services/ai-generation-task-route.ts`.
- Test: `src/server/services/ai-generation-task-service.test.ts`
- Test: `src/server/mappers/ai-generation-task-mapper.test.ts`
- Test: `tests/unit/phase-31-advanced-edition-ai-task-domain-implementation.test.ts`

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- real provider runtime files
- payment or external-service configuration

## Domain Contract

### Task Type

Initial task type values should cover first-release advanced edition flows:

- `ai_question_generation`
- `ai_paper_generation`
- `organization_training_generation`

The task type must not decide ownership by itself. Ownership and quota ownership come from the advanced authorization context snapshot.

### Status Model

The internal lifecycle must represent these stable states:

| Status      | Meaning                                                               |
| ----------- | --------------------------------------------------------------------- |
| `pending`   | Task accepted, prechecked, and waiting to be claimed.                 |
| `running`   | Task claimed by a worker and not yet completed.                       |
| `succeeded` | Task produced a usable generated result or adoption-ready draft.      |
| `failed`    | Task ended without a usable result. Failure category explains why.    |
| `cancelled` | Task was cancelled before it reached an irreversible execution point. |

Recovery metadata must also represent timed-out `running` tasks and expired hidden result handling without adding unapproved status values to public DTOs. The later retention plan owns final `expired_hidden` governance.

### Required Snapshot Fields

Every accepted task must snapshot the context needed to audit and retry safely:

| Field                                    | Requirement                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `taskPublicId`                           | Externally safe task identifier.                                              |
| `taskType`                               | One of the first-release task type values.                                    |
| `status`                                 | Public task lifecycle status.                                                 |
| `actorType`                              | `student`, `admin`, `employee`, `organization_admin`, or `platform_admin`.    |
| `actorPublicId`                          | Public id only.                                                               |
| `authorizationSource`                    | `personal_auth` or `org_auth`; platform context only where allowed later.     |
| `authorizationPublicId`                  | Public id of the effective `authorization` source.                            |
| `ownerType`                              | `personal`, `organization`, or `platform`.                                    |
| `ownerPublicId`                          | Public id of the generated content owner.                                     |
| `organizationPublicId`                   | Required for organization-owned tasks; otherwise `null`.                      |
| `quotaOwnerType`                         | `personal`, `organization`, or `platform`.                                    |
| `quotaOwnerPublicId`                     | Public id of the quota owner.                                                 |
| `effectiveEdition`                       | Must be `advanced` for generation tasks.                                      |
| `profession`                             | `monopoly`, `marketing`, or `logistics`.                                      |
| `level`                                  | Numeric level from the authorized scope.                                      |
| `subject`                                | `theory` or `skill`, when the task is subject-bound.                          |
| `modelConfigSnapshot`                    | Redacted `model_config` metadata only.                                        |
| `promptTemplateSnapshot`                 | Key, version, and digest; never raw prompt text in public DTOs.               |
| `inputSnapshot`                          | Redacted user intent and generation constraints.                              |
| `citationSnapshot`                       | RAG `citation` summary when available; no raw chunk body in public DTOs.      |
| `generationConstraintSnapshot`           | Question count, question type, `paper` structure, and difficulty constraints. |
| `retryCount`                             | Completed attempt count for this task.                                        |
| `maxRetryCountSource`                    | Config source marker, not a hardcoded production default.                     |
| `failureCategory`                        | Stable category when status is `failed`.                                      |
| `failureSummaryRedacted`                 | Safe summary for `audit_log` and ops UI.                                      |
| `idempotencyKeyHash`                     | Hash only; never store or return raw idempotency key.                         |
| `createdAt` / `startedAt` / `finishedAt` | ISO 8601 timestamps in API DTOs.                                              |

### Failure Categories

Use stable categories so retries and user messages are deterministic:

- Retryable: `system_error`, `provider_temporary_error`, `network_error`, `rate_limited`, `rag_temporary_error`, `running_timeout`.
- Non-retryable: `invalid_input`, `authorization_missing`, `authorization_invalid`, `edition_not_allowed`, `quota_insufficient`, `scope_forbidden`, `configuration_missing`, `production_enablement_blocked`.

Missing production configuration must become `production_enablement_blocked`; it must not silently fall back to dev/test placeholders.

## Service Rules

- Submit validates session, advanced authorization context, capability, owner scope, quota owner, idempotency, and required runtime configuration before creating a task.
- Submit returns task public id and `pending` status. It must not wait for model output.
- Duplicate submit within the configured idempotency window returns the existing compatible task instead of creating a second task.
- Worker claim changes `pending` to `running` through a concurrency-safe repository operation.
- Worker claim respects user, organization, and global concurrency gates, but the actual limit values must come from confirmed configuration.
- `pending` cancellation produces `cancelled` and releases any quota reservation without quota consumption.
- `running` cancellation may record a cancellation request, but it cannot be treated as if execution never started.
- `succeeded` is immutable for cancellation; later flows may discard generated content without changing lifecycle history.
- Failure always records a redacted summary and an auditable category.
- Retry reuses the original task, increments retry metadata, preserves original actor/owner/quota snapshots, and refuses to run when the configured retry value is missing.
- Quota handling remains a reservation/finalization boundary in this plan; exact quota ledger schema and point values belong to the operations authorization and quota plan.
- Standard practice, standard `mock_exam`, exam report, and mistake book flows must not depend on this advanced task worker.
- `ai_call_log` entries for generation tasks may store redacted prompt, model output, token, latency, and safe cost fields only after the related implementation task defines those fields. No raw prompt, raw answer, raw model output, provider payload, key, token, or secret can be logged.
- `audit_log` records lifecycle mutations, cancellation, retry, configuration blocking, and quota reservation/finalization summaries with redacted metadata.

## Implementation Order

### Task 1: Contract And Lifecycle Model

**Files:**

- Create: `src/server/contracts/ai-generation-task-contract.ts`
- Create: `src/server/models/ai-generation-task.ts`
- Test: `src/server/models/ai-generation-task.test.ts`

- [ ] Define public DTO fields and internal lifecycle types using project terminology.
- [ ] Add transition tests for `pending -> running`, `running -> succeeded`, `running -> failed`, and `pending -> cancelled`.
- [ ] Add negative transition tests for cancelling `succeeded`, completing `cancelled`, and treating `running` cancellation as no execution.
- [ ] Add failure category tests for retryable and non-retryable categories.
- [ ] Run the focused lifecycle model tests and record evidence.

### Task 2: Repository Boundary

**Files:**

- Create: `src/server/repositories/ai-generation-task-repository.ts`
- Test: `src/server/repositories/ai-generation-task-repository.test.ts`

- [ ] Define repository methods for create, idempotency lookup, claim, complete, fail, cancel, retry, and recovery scan.
- [ ] Add repository contract tests using in-memory fakes before any database implementation.
- [ ] Verify all repository inputs use public ids and redacted snapshots only.
- [ ] Keep schema and migration work out unless a later implementation task explicitly authorizes it.

### Task 3: Service Orchestration

**Files:**

- Create: `src/server/services/ai-generation-task-service.ts`
- Test: `src/server/services/ai-generation-task-service.test.ts`

- [ ] Add submit tests for personal advanced AI question task and AI `paper` task using `personal_auth`.
- [ ] Add submit tests for organization training task using `org_auth` and organization quota owner.
- [ ] Add blocked tests for missing authorization, standard edition, scope mismatch, quota insufficiency, and missing production configuration.
- [ ] Add idempotency tests returning an existing compatible task.
- [ ] Add claim tests for user, organization, and global concurrency source checks.
- [ ] Add cancellation tests proving `pending` releases reservation and `running` does not rewind execution.
- [ ] Add retry tests proving configured retry source is required and retryable categories can reuse the original task.

### Task 4: Mapping And Route Surface

**Files:**

- Create: `src/server/mappers/ai-generation-task-mapper.ts`
- Create only if API surface is in scope: `src/server/services/ai-generation-task-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/ai-generation-tasks/route.ts`
- Test: `src/server/mappers/ai-generation-task-mapper.test.ts`
- Test: `tests/unit/phase-31-advanced-edition-ai-task-domain-implementation.test.ts`

- [ ] Map internal task rows to camelCase DTOs.
- [ ] Ensure optional values return `null`, lists return `[]`, and responses use `{ code, message, data, pagination? }`.
- [ ] Verify numeric ids, raw prompt, raw provider payload, plaintext `redeem_code`, secret, and token values are absent.
- [ ] If a route is added, test unauthenticated, forbidden, submit, cancel, and list/query behavior.

### Task 5: Audit And AI Call Log Boundary

**Files:**

- Modify only as needed: `src/server/services/admin-ai-audit-log-runtime.ts`
- Modify only as needed: `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- Modify only as needed: `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- Test: existing admin AI audit log runtime tests or new focused tests.

- [ ] Extend `audit_log` summaries for task submit, claim, cancel, retry, fail, and succeed events.
- [ ] Extend `ai_call_log` function type support only with redacted generation summaries.
- [ ] Verify failed task logging stores `failureSummaryRedacted`, not raw error payload.
- [ ] Verify missing production configuration records `production_enablement_blocked` without creating a provider call.

## Required Acceptance Tests

- `pending` task can be cancelled without quota consumption.
- `running` task cannot be cancelled as if it never ran.
- Failed task records a redacted failure summary.
- Retry respects configured value source and refuses missing production configuration.
- Duplicate submission within idempotency window returns the existing compatible task.
- Personal AI question and AI `paper` tasks bind `authorizationSource = personal_auth`.
- Organization training tasks bind `authorizationSource = org_auth` and `quotaOwnerType = organization`.
- Missing production task runtime configuration blocks with `production_enablement_blocked`.
- `audit_log` and `ai_call_log` do not contain raw prompt, raw provider payload, plaintext `redeem_code`, secret, token, or numeric ids.

## Blocked Work

- Real provider calls remain blocked.
- Provider cost measurement and point calibration remain blocked.
- Production timeout, retry, concurrency, peak threshold, and quota point defaults remain unconfirmed.
- Database schema and migration work require a separate implementation task if needed.
- env/secret, staging/prod/cloud/deploy, payment, and external-service actions remain blocked.
- Redis/BullMQ or another queue dependency requires a separate dependency approval task.

## Handoff To Downstream Plans

- Personal AI question and AI `paper` generation should consume this task domain for submit, status, cancel, and retry.
- Organization training lifecycle should consume the same task domain and add organization content ownership, employee assignment, and training answer workflows.
- Operations authorization and quota management should provide quota reservation/finalization and configuration source contracts consumed by this domain.
- Retention and log governance should own `expired_hidden`, `audit_log` retention, and `ai_call_log` retention behavior after this lifecycle is defined.
