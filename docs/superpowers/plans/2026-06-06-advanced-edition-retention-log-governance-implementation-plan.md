# Advanced Edition Retention And Log Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the confirmed retention, `expired_hidden`, `audit_log`, `ai_call_log`, controlled snapshot, hard-delete approval, and evidence redaction governance boundaries for the advanced edition MVP without provider, environment, deployment, payment, external-service, schema, or dependency work.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Retention and log governance must consume the advanced authorization context, AI generation task domain, organization training lifecycle, organization analytics summary, operations authorization/quota governance, and operations configuration contract while keeping ordinary user entrances separated from operations governance entrances.

**Tech Stack:** TypeScript, existing API response contract, existing redacted `audit_log` and `ai_call_log` runtime patterns, reviewed operations configuration contract, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing redacted AI audit runtime exists in `src/server/services/admin-ai-audit-log-runtime.ts`.
- Existing AI audit log repository exists in `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`.
- Existing operations AI audit service exists in `src/server/services/admin-ai-audit-log-ops-service.ts`.
- Existing AI/RAG validators and redaction helpers exist in `src/server/validators/ai-rag.ts` and `src/server/models/ai-rag.ts`.
- Existing advanced edition planning has now defined AI generation task lifecycle, personal AI generation, organization training, organization analytics, and operations authorization/quota boundaries.

The current advanced edition planning set does not yet define the exact implementation boundary for applying confirmed retention periods, `expired_hidden` recovery, hard-delete approval, controlled snapshot exceptions, `audit_log` retention, `ai_call_log` retention, and evidence redaction across these domains.

## Dependency Contract

This plan depends on the reviewed upstream plans:

- AI generation task domain:
  - Task lifecycle owns `pending`, `running`, `succeeded`, `failed`, and `cancelled`.
  - Final `expired_hidden` governance belongs to this retention/log plan.
  - `audit_log` and `ai_call_log` must store redacted task summaries only.
- Personal AI generation:
  - Personal AI learning content remains outside formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
  - Personal and employee AI learning content uses 90-day retention.
- Organization training lifecycle:
  - Unpublished organization training drafts use 90-day retention.
  - Published organization training versions are long-term retained.
  - Takedown is not deletion and preserves history.
- Organization analytics:
  - Analytics reads must respect `expired_hidden`, takedown, organization scope, and summary-only privacy rules.
- Operations authorization/quota governance:
  - Operations actions write `audit_log`.
  - Quota ledger and authorization summaries must remain traceable without sensitive raw fields.
- Operations configuration contract:
  - `ai_generated_practice_retention_day = 90`.
  - `organization_training_draft_retention_day = 90`.
  - `organization_training_published_retention_policy = long_term_retention`.
  - `question_paper_draft_retention_policy = managed_by_existing_content_rule`.
  - `expired_content_hidden_grace_day = 30`.
  - `hard_delete_approval_required = true`.
  - `snapshot_exception_required = true`.
  - `audit_log_retention_day = 1095`.
  - `ai_call_log_retention_day = 180`.
  - `evidence_redaction_enabled = true`.
  - `sensitive_field_denylist` must include prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, and disallowed personal AI content.

This plan owns retention/log governance boundaries and future implementation sequencing. It does not own provider execution, cost calibration, production quota point defaults, online payment, external-service confirmation, env/secret, deployment, cloud configuration, schema approval, migration approval, or dependency approval.

## Future File Structure

Future implementation should keep retention/log governance as a cross-domain service boundary rather than embedding retention rules separately in every feature service.

- Create or extend: `src/server/contracts/retention-log-governance-contract.ts`
  - DTOs for retention policy summaries, expired hidden summaries, recovery requests, hard-delete approval summaries, controlled snapshot exception summaries, log retention summaries, and redaction check results.
- Create or extend: `src/server/models/retention-log-governance.ts`
  - Internal content domain values, retention policy keys, `expired_hidden` metadata, recovery window calculation, sensitive field denylist, and immutable governance event types.
- Create or extend: `src/server/repositories/retention-log-governance-repository.ts`
  - Persistence boundary for retention candidates, expired hidden marking, recovery summary append, hard-delete approval summary append, log retention candidates, and governance audit summaries.
- Create or extend: `src/server/services/retention-log-governance-service.ts`
  - Service orchestration for policy resolution, expiration marking, ordinary visibility filtering, recovery, hard-delete approval guard, controlled snapshot exception guard, `audit_log` retention, `ai_call_log` retention, and redaction enforcement.
- Create or extend: `src/server/mappers/retention-log-governance-mapper.ts`
  - Map internal governance rows to camelCase DTOs without numeric ids, prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, or disallowed personal AI content.
- Create or extend: `src/server/validators/retention-log-governance.ts`
  - Normalize policy keys, recovery reason, hard-delete approval input, controlled snapshot exception input, retention filters, and redaction check inputs.
- Create only if REST surface is in scope: `src/server/services/retention-log-governance-route.ts`.
- Create only if REST surface is in scope: `src/app/api/v1/retention-log-governance/**/route.ts`.
- Create only if Web surface is in scope: `src/app/(admin)/retention-log-governance/**`.
- Test: `src/server/services/retention-log-governance-service.test.ts`.
- Test: `src/server/mappers/retention-log-governance-mapper.test.ts`.
- Test: `src/server/validators/retention-log-governance.test.ts`.
- Test: `tests/unit/phase-31-advanced-edition-retention-log-governance-implementation.test.ts`.

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- real provider runtime files
- payment or external-service configuration files
- staging/prod/cloud/deploy files
- hard-delete executor jobs

## Domain Contract

### Retention Content Domains

First-release retention policy resolution should support these content domains:

| Content Domain                    | Policy Key                                         | First-Release Rule                                                                                             |
| --------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ai_generated_practice`           | `ai_generated_practice_retention_day`              | Personal user and employee AI learning content expires after 90 days.                                          |
| `organization_training_draft`     | `organization_training_draft_retention_day`        | Unpublished organization training drafts expire after 90 days.                                                 |
| `organization_training_published` | `organization_training_published_retention_policy` | Published organization training versions are long-term retained and are not hidden by the 90-day draft policy. |
| `question_paper_draft`            | `question_paper_draft_retention_policy`            | Formal `question` and `paper` drafts remain governed by existing formal content rules.                         |
| `audit_log`                       | `audit_log_retention_day`                          | `audit_log` retention is 1095 days.                                                                            |
| `ai_call_log`                     | `ai_call_log_retention_day`                        | `ai_call_log` retention is 180 days.                                                                           |

The content domain must be explicit. Future implementation must not use one generic generated-content retention key for all advanced edition content.

### Expired Hidden Contract

`expired_hidden` is a governance visibility state, not a deletion state.

Required internal fields:

| Field                    | Requirement                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `targetPublicId`         | Public id of the governed object.                              |
| `targetDomain`           | One of the first-release retention content domains.            |
| `retentionPolicyKey`     | Configuration key used to calculate expiration.                |
| `retentionPolicyVersion` | Configuration version or snapshot marker.                      |
| `expiresAt`              | Calculated expiration time, or `null` for long-term retention. |
| `expiredHiddenAt`        | Time when ordinary visibility is hidden, or `null`.            |
| `hiddenGraceEndsAt`      | `expiredHiddenAt + 30 days`, or `null`.                        |
| `hiddenReason`           | Redacted governance reason.                                    |
| `lastAuditLogPublicId`   | Public id of the latest related `audit_log`, or `null`.        |

Ordinary user, employee, organization admin, and content management entrances must filter `expired_hidden` records unless a feature-specific historical summary rule explicitly allows a summary. Operations governance entrances may see redacted summaries only.

### Recovery Contract

Recovery from `expired_hidden` is allowed only within the 30-day recovery window.

Recovery must:

- require authenticated platform operations admin context or another later explicitly approved recovery role;
- require reason, operator, target public id, target domain, and current governance snapshot;
- write `audit_log`;
- restore only the ordinary visibility state allowed by the target domain;
- re-run `authorization`, organization scope, owner, and redaction checks before ordinary access resumes;
- avoid exposing sensitive raw fields in response DTOs, logs, or evidence.

After `hiddenGraceEndsAt`, ordinary recovery is blocked. Any later restoration requires a separately approved controlled governance flow.

### Hard Delete Approval Contract

Hard delete is not an ordinary operations shortcut.

First-release implementation must enforce:

- `hard_delete_approval_required = true`;
- hard-delete requests require approval record, reason, operator, target public id, target domain, and redacted impact summary;
- hard-delete approval does not itself approve a physical deletion executor;
- physical deletion jobs, if needed later, require a separate task with explicit allowed files, approval evidence, backup/rollback consideration, and validation evidence;
- hard-delete governance must preserve `audit_log` and approval traceability.

### Controlled Snapshot Exception Contract

Sensitive original content access for diagnosis is blocked from ordinary entrances.

If future implementation needs controlled snapshot exception:

- `snapshot_exception_required = true`;
- access requires explicit reason, operator, target public id, time-limited scope, and `audit_log`;
- ordinary DTOs still must not expose prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, or disallowed personal AI content;
- evidence must record only public ids, time, reason category, and redacted summary.

This plan does not approve sensitive raw content display.

### Log Retention Contract

`audit_log` retention:

- 1095-day retention for authorization, quota, recovery, hard-delete approval, operations configuration change, controlled snapshot exception, and governance actions.
- Retention changes must write a new `audit_log` with configuration version, operator, time, and reason.
- Cleanup must not break quota ledger, authorization, hard-delete approval, or controlled governance traceability.

`ai_call_log` retention:

- 180-day retention for AI task status, failure category, retry summary, redacted `model_provider` and `model_config` public identifiers, token usage summary, safe cost summary when already available, and `evidence_status`.
- Must not store prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, or disallowed personal AI content.
- Must not create provider calls or provider cost measurement.

### Evidence Redaction Contract

Evidence must remain redacted by default.

The sensitive field denylist must block:

- prompt;
- raw AI input/output;
- provider payload;
- secret;
- token;
- database URL;
- plaintext `redeem_code`;
- employee subjective answer text;
- disallowed personal AI complete generated content.

Validation should include a denylist scanner or structured redaction assertions for evidence, `audit_log`, `ai_call_log`, quota ledger summaries, and operations governance DTOs.

## Service Rules

### Policy Resolution

- Resolve policy by explicit content domain.
- Use confirmed non-cost configuration values from the operations configuration contract.
- Do not infer production quota point values, behavior cost point values, concurrency thresholds, timeout thresholds, retry limits, idempotency windows, or peak thresholds.
- Treat missing required retention/log configuration as `configuration_required` for the governed flow.

### Expiration Marking

- Personal and employee AI learning content older than 90 days becomes `expired_hidden`.
- Unpublished organization training drafts older than 90 days become `expired_hidden`.
- Published organization training versions do not become `expired_hidden` by the 90-day draft rule.
- Formal `question` and `paper` drafts remain under existing formal content retention rules.
- Expiration marking writes `audit_log` with redacted target summary.

### Ordinary Visibility

- `expired_hidden` content is hidden from ordinary personal user, employee, organization admin, and content management entrances.
- Organization training takedown remains separate from `expired_hidden`; takedown may still allow employee historical result summary according to the organization training lifecycle plan.
- Organization analytics must exclude hidden draft/content details and use summary-safe rows only.
- Recovery must not bypass `authorization`, effective edition, organization scope, owner checks, or redaction.

### Redacted Logging

- `audit_log` and `ai_call_log` append paths must reject or redact sensitive fields before persistence.
- Logging service tests must prove known sensitive field names and known raw payload shapes are not stored in ordinary logging paths.
- Failure summaries use stable failure categories and redacted messages, not raw provider errors.

### Operations Governance

- Platform operations admins may view redacted retention/log governance summaries.
- Recovery requires reason and writes `audit_log`.
- Hard-delete approval requires reason, approval record, and `audit_log`; physical deletion remains separately gated.
- Controlled snapshot exception requires reason, scope, and `audit_log`; sensitive display remains separately gated.

## Implementation Order

### Task 1: Contract, Model, And Validators

**Files:**

- Create: `src/server/contracts/retention-log-governance-contract.ts`
- Create: `src/server/models/retention-log-governance.ts`
- Create: `src/server/validators/retention-log-governance.ts`
- Test: `src/server/validators/retention-log-governance.test.ts`

- [ ] Define content domain, policy key, expired hidden summary, recovery input, hard-delete approval input, controlled snapshot exception input, log retention summary, and redaction result DTOs.
- [ ] Add validator tests for recovery required fields.
- [ ] Add validator tests for hard-delete approval required fields.
- [ ] Add validator tests for controlled snapshot exception required fields.
- [ ] Add policy calculation tests for 90-day, 30-day, 1095-day, 180-day, long-term, and existing-rule policy values.
- [ ] Verify DTOs use camelCase fields and optional values use `null`.

### Task 2: Retention Candidate And Visibility Service

**Files:**

- Create: `src/server/repositories/retention-log-governance-repository.ts`
- Create: `src/server/services/retention-log-governance-service.ts`
- Test: `src/server/services/retention-log-governance-service.test.ts`

- [ ] Add tests proving personal and employee AI learning content older than 90 days becomes `expired_hidden`.
- [ ] Add tests proving unpublished organization training drafts older than 90 days become `expired_hidden`.
- [ ] Add tests proving published organization training versions are not hidden by draft retention.
- [ ] Add tests proving formal `question` and `paper` drafts are delegated to existing formal content rules.
- [ ] Add ordinary visibility tests for personal user, employee, organization admin, platform content teacher, and platform operations admin summaries.
- [ ] Add `audit_log` summary tests for expiration marking.

### Task 3: Recovery, Hard Delete Approval, And Snapshot Exception

**Files:**

- Modify: `src/server/services/retention-log-governance-service.ts`
- Modify: `src/server/repositories/retention-log-governance-repository.ts`
- Test: `src/server/services/retention-log-governance-service.test.ts`

- [ ] Add recovery tests within the 30-day window.
- [ ] Add recovery rejection tests after the 30-day window.
- [ ] Add recovery tests proving reason and operator are required.
- [ ] Add tests proving recovery re-runs `authorization`, organization scope, owner, and redaction checks.
- [ ] Add hard-delete approval guard tests proving approval record and reason are required.
- [ ] Add controlled snapshot exception guard tests proving reason, scope, operator, and `audit_log` are required.
- [ ] Add tests proving neither approval nor snapshot exception writes sensitive raw fields to evidence or ordinary DTOs.

### Task 4: Log Retention And Redaction Guards

**Files:**

- Create or extend: `src/server/mappers/retention-log-governance-mapper.ts`
- Modify only as needed: `src/server/services/admin-ai-audit-log-runtime.ts`
- Modify only as needed: `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- Modify only as needed: `src/server/services/admin-ai-audit-log-ops-service.ts`
- Test: `src/server/mappers/retention-log-governance-mapper.test.ts`
- Test: existing admin AI audit log runtime tests or new focused tests.

- [ ] Add `audit_log` retention tests for 1095-day policy summaries.
- [ ] Add `ai_call_log` retention tests for 180-day policy summaries.
- [ ] Add redaction tests for prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, and disallowed personal AI content.
- [ ] Add failure summary tests proving raw provider errors are not persisted.
- [ ] Add mapper tests proving numeric ids are absent from governance DTOs.

### Task 5: Optional Route And Web Surfaces

**Files:**

- Create only if API surface is in scope: `src/server/services/retention-log-governance-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/retention-log-governance/**/route.ts`
- Create only if Web surface is in scope: `src/app/(admin)/retention-log-governance/**`
- Test: route-level tests if routes are added.
- Test: Web surface tests if pages are added.

- [ ] Add thin route handlers after service tests pass.
- [ ] Keep responses in `{ code, message, data, pagination? }`.
- [ ] Use public ids in route paths and query filters.
- [ ] Use verb subpaths only for governed actions such as recover, approve hard delete, or create snapshot exception.
- [ ] Add operations pages for expired hidden summary, recovery, hard-delete approval summary, controlled snapshot exception summary, log retention summary, Loading, Empty, Error, and Permission Blocked states when Web pages are included.
- [ ] Verify no provider configuration, env/secret, staging/prod/cloud/deploy, payment, external-service, raw content viewer, or physical hard-delete executor is introduced.

## Required Acceptance Tests

- Personal and employee AI learning content older than 90 days becomes `expired_hidden`.
- Unpublished organization training drafts older than 90 days become `expired_hidden`.
- Published organization training versions are long-term retained and are not hidden by the draft retention rule.
- Formal `question` and `paper` drafts remain governed by existing formal content rules.
- `expired_hidden` content is hidden from ordinary user, employee, organization admin, and content management entrances.
- Recovery within 30 days requires reason, operator, public target, target domain, and writes `audit_log`.
- Recovery after 30 days is blocked from the ordinary recovery flow.
- Recovery does not bypass `authorization`, organization scope, owner checks, or redaction rules.
- Hard-delete approval requires approval record, reason, operator, target public id, target domain, and writes `audit_log`.
- Controlled snapshot exception requires reason, operator, time-limited scope, and writes `audit_log`.
- `audit_log` retention policy is 1095 days.
- `ai_call_log` retention policy is 180 days.
- `audit_log`, `ai_call_log`, evidence, and operations governance DTOs reject or redact prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, disallowed personal AI content, and numeric ids.
- No automatic hard delete, raw content viewer, provider call, provider cost measurement, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, or lockfile work is introduced.

## Blocked Work

- Automatic physical hard delete remains blocked without a separate approved task.
- Raw sensitive content viewer remains blocked without a separate controlled snapshot implementation approval.
- Provider payload logging remains blocked.
- Prompt and raw AI input/output logging remain blocked.
- Provider cost measurement and point calibration remain blocked.
- Real provider calls remain blocked.
- Production quota package default point values and behavior cost point values remain unconfirmed.
- env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, script, package, and lockfile work remain blocked.

## Handoff To Downstream Plans

- Future AI generation task implementation must call this governance boundary for `expired_hidden` visibility and redacted log retention.
- Future personal AI generation implementation must use `ai_generated_practice_retention_day = 90`.
- Future organization training implementation must use `organization_training_draft_retention_day = 90` for drafts and `long_term_retention` for published versions.
- Future organization analytics implementation must read only summary-safe rows and respect `expired_hidden` and takedown boundaries.
- Future operations authorization/quota implementation must use this redaction and `audit_log` retention boundary for grant, adjustment, `authorization`, and `redeem_code` governance.
- Future code implementation tasks must split schema/migration, service, route, Web, and job work according to the project gate policy instead of treating this planning document as implementation approval.

## Self-Review

- Retention coverage: covers AI learning content, organization training drafts, published organization training, formal `question` / `paper` drafts, `audit_log`, and `ai_call_log`.
- Expired hidden coverage: defines ordinary visibility, 30-day recovery, reason/operator requirements, and `audit_log`.
- Redaction coverage: covers prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, disallowed personal AI content, and numeric ids.
- Cross-plan handoff coverage: connects AI task, personal AI generation, organization training, organization analytics, and operations authorization/quota planning.
- Blocked work coverage: keeps Cost Calibration Gate, provider, cost, production defaults, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, script, package, and lockfile work out of scope.
