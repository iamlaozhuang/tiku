# Advanced Edition Operations Authorization And Quota Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give platform operations admins governed tools for `authorization`, `redeem_code`, quota package, quota ledger, purchase-style grant, bonus grant, `manual_adjustment`, and audit summary management without online payment or external-service confirmation.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Operations authorization and quota management must consume the advanced authorization context, operations configuration contract, and AI task quota reservation/finalization boundaries while keeping ledger entries append-only and evidence redacted.

**Tech Stack:** TypeScript, existing API response contract, existing operations admin session/runtime patterns, reviewed authorization context planning, reviewed AI task lifecycle planning, reviewed operations configuration contract, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing authorization context planning defines `canManageAuthorizationQuota` for platform operations admins.
- Existing effective authorization runtime has `personal_auth`, `org_auth`, and `redeem_code` surfaces.
- Existing organization management runtime has `organization`, `employee`, and `org_auth` concepts.
- Existing `audit_log` and `ai_call_log` runtime provides redacted audit summary patterns.
- Existing operations configuration contract defines required fields for purchase-style grant, bonus grant, `manual_adjustment`, quota unit, quota consume order, and sensitive field denylist.

The current advanced edition planning set does not yet define the exact operations implementation boundary for advanced `authorization`, `redeem_code`, quota package, quota ledger, quota grants, and governed manual adjustments.

## Dependency Contract

This plan depends on the reviewed upstream plans:

- Advanced authorization context:
  - Platform operations admin management requires `canManageAuthorizationQuota = true`.
  - Operations admin DTOs must not expose plaintext `redeem_code`, prompt text, provider payload, secret, token, employee sensitive detail, or numeric ids.
- AI generation task domain:
  - AI task submission consumes quota through reservation/finalization boundaries.
  - Exact behavior cost point values remain unconfirmed and must not be hard-coded.
- Operations configuration contract:
  - `quota_unit` is quota point.
  - `quota_consume_order` starts as `earliest_expiring_first`.
  - `purchase_grant_required_field` requires `external_reference` and `ops_note`.
  - `bonus_grant_required_field` requires reason, quota point, `expires_at`, and operator.
  - `manual_adjustment_required_field` requires reason, direction, quota point, and operator.
  - Config changes must write `audit_log`.

This plan owns governed operations workflows and future implementation boundaries for quota governance. It does not own provider execution, cost calibration, production point defaults, online payment, external purchase confirmation, env/secret, deployment, or cloud configuration.

## Future File Structure

Future implementation should keep operations governance separate from student and organization learning flows.

- Create or extend: `src/server/contracts/ops-authorization-quota-contract.ts`
  - DTOs for authorization summary, `redeem_code` summary, quota package summary, quota ledger summary, purchase-style grant, bonus grant, `manual_adjustment`, and audit summary filters.
- Create or extend: `src/server/models/ops-authorization-quota.ts`
  - Internal operation types, ledger entry types, redaction constants, and immutable status values.
- Create or extend: `src/server/repositories/ops-authorization-quota-repository.ts`
  - Persistence boundary for governed reads, grant creation, ledger append, adjustment append, and audit summary append.
- Create or extend: `src/server/services/ops-authorization-quota-service.ts`
  - Service orchestration for permission checks, purchase-style grant, bonus grant, `manual_adjustment`, quota package reads, ledger reads, `authorization` governance, and `redeem_code` governance.
- Create or extend: `src/server/mappers/ops-authorization-quota-mapper.ts`
  - Map internal rows to camelCase DTOs without numeric ids, plaintext `redeem_code`, prompt, raw provider payload, secret, token, or employee answer detail.
- Create or extend: `src/server/validators/ops-authorization-quota.ts`
  - Normalize grant input, adjustment input, ledger filters, authorization filters, redeem code filters, and audit summary filters.
- Create only if REST surface is in scope: `src/server/services/ops-authorization-quota-route.ts`.
- Create only if REST surface is in scope: `src/app/api/v1/ops-authorization-quota/**/route.ts`.
- Create only if Web surface is in scope: `src/app/(admin)/ops-authorization-quota/**`.
- Test: `src/server/services/ops-authorization-quota-service.test.ts`.
- Test: `src/server/mappers/ops-authorization-quota-mapper.test.ts`.
- Test: `src/server/validators/ops-authorization-quota.test.ts`.
- Test: `tests/unit/phase-31-advanced-edition-ops-auth-quota-implementation.test.ts`.

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- payment integration files
- external-service integration files
- real provider runtime files

## Domain Contract

### Operation Types

First-release operations governance should use these stable operation types:

- `purchase_grant`
- `bonus_grant`
- `manual_adjustment`
- `quota_reservation`
- `quota_finalization`
- `quota_release`
- `authorization_create`
- `authorization_update`
- `authorization_cancel`
- `redeem_code_create`
- `redeem_code_import`
- `redeem_code_disable`
- `auth_upgrade_create`

`purchase_grant` is an operations registration flow. It is not online payment, payment callback, refund, invoice, automatic reconciliation, or external-service confirmation.

### Quota Ledger Contract

Quota ledger entries must be append-only.

Required internal fields:

| Field                         | Requirement                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `publicId`                    | Public id only.                                                                                              |
| `ownerType`                   | `personal`, `organization`, or `platform`.                                                                   |
| `ownerPublicId`               | Public id of quota owner.                                                                                    |
| `authorizationSource`         | `personal_auth`, `org_auth`, or `null` for platform governance rows.                                         |
| `authorizationPublicId`       | Public id of the related `authorization`, or `null`.                                                         |
| `operationType`               | One of the first-release operation types.                                                                    |
| `direction`                   | `credit`, `debit`, `reserve`, `finalize`, or `release`.                                                      |
| `quotaPoint`                  | Positive integer point amount supplied by the operation or task domain; no production default inferred here. |
| `remainingQuotaPointSnapshot` | Remaining point snapshot after append when available.                                                        |
| `reason`                      | Required for bonus and `manual_adjustment`; redacted in public DTOs when needed.                             |
| `externalReference`           | Required for purchase-style grant; no payment secret or external payload.                                    |
| `opsNote`                     | Required for purchase-style grant; redacted where needed.                                                    |
| `expiresAt`                   | Required for grant rows when configured; otherwise `null`.                                                   |
| `operatorPublicId`            | Platform operations admin public id.                                                                         |
| `createdAt`                   | ISO 8601 timestamp.                                                                                          |

Ledger rows must never be updated in place to change business meaning. Corrections use a new `manual_adjustment` entry with reason, direction, quota point, and operator.

### Authorization Governance Contract

Operations admin can govern:

- `personal_auth` creation/update/cancel summary workflows.
- `org_auth` creation/update/cancel summary workflows.
- `auth_upgrade` creation summary workflows.
- `redeem_code` create/import/disable summary workflows.

Operations admin ordinary reads must return summaries only:

- authorization public id, type, status, scope, effective edition, starts/expires time, owner summary, and quota summary;
- `redeem_code` public id, status, batch summary, expires time, redeemed time, and redacted code fingerprint;
- no plaintext `redeem_code` after creation/import display boundary;
- no employee private learning detail.

If a later implementation needs one-time plaintext `redeem_code` display at creation/import, it must be a controlled response boundary with no persistence in evidence, logs, or ordinary read DTOs.

## Service Rules

### Permission And Redaction

- Require authenticated platform operations admin context.
- Require `canManageAuthorizationQuota = true`.
- Return not-found or forbidden without leaking sensitive object existence outside operations scope.
- All ordinary DTOs use public ids and camelCase fields.
- Plaintext `redeem_code`, prompt text, provider payload, secret, token, database URL, raw AI input/output, employee subjective answer text, and numeric ids must be absent.

### Purchase-Style Grant

- Require `externalReference`, `opsNote`, quota point, target owner, target `authorization`, operator, and optional expiry.
- Append quota ledger `purchase_grant` entry.
- Write `audit_log` with redacted external reference and operation summary.
- Do not call payment provider, external service, invoice, refund, or reconciliation workflow.

### Bonus Grant

- Require reason, quota point, `expiresAt`, target owner, target `authorization`, and operator.
- Append quota ledger `bonus_grant` entry.
- Write `audit_log`.

### Manual Adjustment

- Require reason, direction, quota point, target owner, target `authorization`, and operator.
- Direction must be explicit: `credit` or `debit`.
- Debit must not silently create invalid negative available quota unless a later explicit governance decision permits dispute handling with negative balance.
- Append quota ledger `manual_adjustment` entry.
- Write `audit_log`.

### AI Task Quota Boundary

- AI task domain owns reservation, finalization, release, retry, and cancellation lifecycle calls.
- Operations quota service provides ledger append and read-model contracts.
- `pending` task cancellation releases reservation without quota consumption.
- `running` task cancellation cannot be treated as if execution never started.
- Exact quota point values and behavior cost point values remain blocked until Cost Calibration Gate is approved and completed.

### Configuration Boundary

- Missing production point defaults must block AI capabilities with `production_enablement_blocked` or `configuration_required`.
- Confirmed non-cost settings from the operations configuration contract may be represented as configuration keys.
- Config changes must write `audit_log` and must not backfill historical ledger rows.

## Implementation Order

### Task 1: Contract, Model, And Validators

**Files:**

- Create: `src/server/contracts/ops-authorization-quota-contract.ts`
- Create: `src/server/models/ops-authorization-quota.ts`
- Create: `src/server/validators/ops-authorization-quota.ts`
- Test: `src/server/validators/ops-authorization-quota.test.ts`

- [ ] Define operation type, ledger entry, grant input, adjustment input, authorization summary, `redeem_code` summary, and filter DTOs.
- [ ] Add validator tests for purchase-style grant required fields.
- [ ] Add validator tests for bonus grant required fields.
- [ ] Add validator tests for `manual_adjustment` required fields.
- [ ] Add validator tests rejecting zero or negative quota point input where a positive point amount is required.
- [ ] Verify DTOs use camelCase fields and optional values use `null`.

### Task 2: Ledger And Governance Repository

**Files:**

- Create: `src/server/repositories/ops-authorization-quota-repository.ts`
- Test: `src/server/repositories/ops-authorization-quota-repository.test.ts`

- [ ] Define append-only ledger methods.
- [ ] Define authorization summary read methods.
- [ ] Define `redeem_code` summary read methods.
- [ ] Add contract tests proving updates do not mutate ledger business meaning.
- [ ] Add tests proving repository outputs exclude plaintext `redeem_code`, secret, token, provider payload, prompt, raw AI input/output, employee answer text, and numeric ids.

### Task 3: Operations Service

**Files:**

- Create: `src/server/services/ops-authorization-quota-service.ts`
- Test: `src/server/services/ops-authorization-quota-service.test.ts`

- [ ] Add permission tests for platform operations admin.
- [ ] Add blocked tests for non-operations admin and missing `canManageAuthorizationQuota`.
- [ ] Add purchase-style grant service tests.
- [ ] Add bonus grant service tests.
- [ ] Add `manual_adjustment` service tests.
- [ ] Add debit overdraw rejection tests unless a later explicit governance decision permits negative balances.
- [ ] Add `audit_log` summary tests for every governance action.

### Task 4: Mapping And Redaction

**Files:**

- Create: `src/server/mappers/ops-authorization-quota-mapper.ts`
- Test: `src/server/mappers/ops-authorization-quota-mapper.test.ts`

- [ ] Map authorization, `redeem_code`, quota package, and ledger rows to operations DTOs.
- [ ] Verify redaction for plaintext `redeem_code`, secret, token, provider payload, prompt, raw AI input/output, employee answer text, database URL, and numeric ids.
- [ ] Verify public summaries include enough traceability: public id, status, operation type, direction, quota point, redacted reason, operator public id, and timestamps.

### Task 5: Optional Route And Web Surfaces

**Files:**

- Create only if API surface is in scope: `src/server/services/ops-authorization-quota-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/ops-authorization-quota/**/route.ts`
- Create only if Web surface is in scope: `src/app/(admin)/ops-authorization-quota/**`
- Test: route-level tests if routes are added.
- Test: Web surface tests if pages are added.

- [ ] Add thin route handlers after service tests pass.
- [ ] Keep responses in `{ code, message, data, pagination? }`.
- [ ] Use public ids in route paths.
- [ ] Use verb subpaths only for governed actions such as grant, adjust, disable, cancel, or create upgrade.
- [ ] Add operations pages for authorization summary, `redeem_code` summary, quota ledger summary, purchase-style grant, bonus grant, `manual_adjustment`, Loading, Empty, Error, and Permission Blocked states when Web pages are included.
- [ ] Verify no payment UI, external-service confirmation, provider configuration, env/secret, or production default value entry is introduced.

## Required Acceptance Tests

- Platform operations admin can view authorization, `redeem_code`, quota package, and quota ledger summaries.
- Non-operations admin cannot manage authorization or quota.
- Purchase-style grant requires external reference, operations note, quota point, target owner, target authorization, and operator.
- Bonus grant requires reason, quota point, `expiresAt`, target owner, target authorization, and operator.
- `manual_adjustment` requires reason, direction, quota point, target owner, target authorization, and operator.
- Quota ledger is append-only.
- Corrections use `manual_adjustment`, not mutation of old ledger rows.
- Plaintext `redeem_code` is not returned from ordinary read endpoints.
- `audit_log` is written for authorization, `redeem_code`, grant, adjustment, and config governance actions.
- Missing production quota or behavior point defaults block AI capability instead of using placeholder production values.
- Online payment, external purchase confirmation, provider cost measurement, real provider calls, env/secret, staging/prod/cloud/deploy, and external-service actions are absent.

## Blocked Work

- Online payment integration remains blocked.
- External-service purchase confirmation remains blocked.
- Provider cost measurement and point calibration remain blocked.
- Real provider calls remain blocked.
- Production quota package default point values and behavior cost point values remain unconfirmed.
- env/secret, staging/prod/cloud/deploy, payment, and external-service actions remain blocked.
- Database schema and migration work require a separate implementation task if needed.
- Dependency changes require a separate approval task if needed.

## Handoff To Downstream Plans

- Retention/log governance should apply `audit_log` and `ai_call_log` retention and redaction policies to the operations actions defined here.
- AI task implementation should consume ledger reservation/finalization/release boundaries without owning operations grants or adjustments.
- Future code implementation tasks must split schema/migration, service, route, and Web work according to the project gate policy instead of treating this planning document as implementation approval.

## Self-Review

- authorization coverage: covers `personal_auth`, `org_auth`, `auth_upgrade`, operations admin permission, and authorization summaries.
- redeem_code coverage: covers create/import/disable summaries and blocks plaintext `redeem_code` in ordinary reads.
- audit_log coverage: requires `audit_log` for authorization, `redeem_code`, grant, adjustment, and config governance actions.
- quota governance coverage: covers purchase-style grant, bonus grant, `manual_adjustment`, append-only ledger, reservation/finalization/release boundary, and blocked production defaults.
- Blocked work coverage: keeps Cost Calibration Gate, provider, cost, production defaults, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, and dependency work out of scope.
