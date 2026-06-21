# Admin Experience Gap Closure Plan

**Date:** 2026-06-21
**Decision status:** split plan recorded; product source implementation deferred to separate scoped tasks.
**Related matrix rows:** `question-admin-binding`, `redeem-code-detail-view`, `organization-management-complete`

## Purpose

This plan closes the discovered content/ops admin experience gaps by converting them into scoped follow-up packages. Follow-up approval on 2026-06-21 selected option A: use the recommended split order for later low-risk local implementation packages, while keeping browser/dev-server/e2e runtime proof behind later approval. This plan does not change source code, routes, services, contracts, tests, schema, data, or runtime behavior.

## Closure Workstreams

### 1. Question And Material Binding

Current static facts:

- `AdminQuestionMaterialManagementClient` already carries `materialPublicId`, `knowledgeNodePublicIdsText`, and `tagPublicIdsText` form fields.
- `QuestionDto` and admin content contracts expose `knowledgeNode` and `tag` summaries.
- The matrix still records binding, related references, and recommendation confirmation as incomplete from the content_admin experience perspective.

Follow-up task package:

| task id                                              | classification                                       | scope                                                                                                  | verification                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `close-question-material-binding-experience`         | `local_implementation`, `runtime_verification_later` | Complete content_admin creation/editing feedback for `material`, `knowledge_node`, and `tag` bindings. | Focused unit tests for form payloads, list/detail rendering, and validation. |
| `close-question-reference-and-material-lock-surface` | `local_implementation`, `runtime_verification_later` | Show clear material reference counts, locked-state reasons, and linked `paper`/`question` references.  | Focused UI/unit tests plus browser runtime only after fresh approval.        |
| `close-kn-recommendation-review-experience`          | `local_implementation`, `security_review_required`   | Make `kn_recommendation` accept/discard state auditable and visibly tied to the target `question`.     | Unit/service tests; no Provider call or prompt payload exposure.             |

Implementation boundaries:

- Use `question`, `material`, `knowledge_node`, `tag`, and `kn_recommendation` terminology exactly.
- Do not expose internal numeric IDs.
- Do not run real AI Provider calls; recommendation review must use existing or mock/local evidence only.

### 2. Redeem Code Detail

Current static facts:

- Ops contracts expose `RedeemCodeSummaryDto` and generated-code DTOs.
- The role matrix records dedicated `redeem_code` detail view and fresh ops_admin path as incomplete.
- Existing governance requires evidence to avoid plaintext `redeem_code` leakage.

Follow-up task package:

| task id                             | classification                                       | scope                                                                                  | verification                                                      |
| ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `close-redeem-code-detail-contract` | `local_implementation`, `security_review_required`   | Define and implement a redacted `redeem_code` detail DTO and route using `publicId`.   | Contract/unit tests for response envelope, nulls, and redaction.  |
| `close-redeem-code-detail-ui`       | `local_implementation`, `runtime_verification_later` | Add ops_admin detail surface with status, scope, user redemption, and generation info. | Focused UI tests; browser path only after fresh runtime approval. |
| `close-redeem-code-audit-redaction` | `security_review_required`                           | Confirm audit_log wording and evidence never include plaintext code or code hash.      | Redaction unit tests and evidence scan.                           |

Implementation boundaries:

- Detail URLs must use `redeem_code` public identifiers only.
- Plaintext code may appear only in separately approved generation-result behavior; detail, audit, and evidence must remain redacted.
- Empty optional values return `null`, not empty strings.

### 3. Organization And Employee Management

Current static facts:

- Ops contracts already include `OrganizationTreeNodeDto`, `EmployeeSummaryDto`, import, mutation, and unbind result shapes.
- The role matrix still records employee import, transfer/unbind, organization enable/disable, and detail gaps.
- These paths affect account access and must preserve audit and public-id boundaries.

Follow-up task package:

| task id                                       | classification                                       | scope                                                                                        | verification                                                                          |
| --------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `close-organization-detail-management`        | `local_implementation`, `security_review_required`   | Complete organization detail, enable/disable state, employee count, parent/child visibility. | Unit/service tests for permission, publicId routing, nulls, and audit summary.        |
| `close-employee-import-management`            | `local_implementation`, `runtime_verification_later` | Implement employee import review with accepted/rejected row feedback.                        | Focused unit tests for duplicate, missing user, missing organization, and row errors. |
| `close-employee-transfer-unbind-management`   | `local_implementation`, `security_review_required`   | Implement transfer/unbind flows with active-flow warning and organization boundary checks.   | Unit/service tests for cross-organization denial, audit_log, and status changes.      |
| `close-organization-management-runtime-proof` | `runtime_verification_later`, `approval_blocked`     | Run ops_admin browser/dev-server path after implementation and fresh runtime approval.       | Browser/e2e or manual runtime evidence after approval only.                           |

Implementation boundaries:

- Do not alter schema or run database work without a separate approved migration/seed package.
- Any enable/disable or transfer/unbind behavior must record `audit_log` without secrets or internal numeric IDs.
- Employee operations must preserve `organization` boundaries and avoid cross-organization leakage.

## Recommended Execution Order

The option A approval confirms this order as the default follow-up sequence. Each item still needs its own task plan, allowed-file scope, validation evidence, audit review, and independent commit before implementation starts.

1. `close-question-material-binding-experience`
2. `close-question-reference-and-material-lock-surface`
3. `close-kn-recommendation-review-experience`
4. `close-redeem-code-detail-contract`
5. `close-redeem-code-detail-ui`
6. `close-redeem-code-audit-redaction`
7. `close-organization-detail-management`
8. `close-employee-import-management`
9. `close-employee-transfer-unbind-management`
10. `close-organization-management-runtime-proof`

## Hard Gates

- Browser/dev-server/e2e runtime proof remains blocked without fresh approval.
- Schema, migration, seed, database, package, lockfile, dependency, Provider, `.env`, deploy, PR, force-push, payment, external-service, and Cost Calibration Gate work remain blocked.
- Follow-up implementation tasks must each create their own task plan, evidence, audit review, commit, and verification record.
- Security-sensitive follow-up items, especially `redeem_code`, `organization`, `employee`, and `kn_recommendation` work, must carry explicit redaction and security review evidence before closure.
