# Full Chain Acceptance DB Selector And Provisioning Approval

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: approval package draft only.

## Decision

Default DB baseline for the later full-chain acceptance is a new isolated local DB label:

- Proposed local DB label: `tiku_full_chain_acceptance_20260704_001`
- Proposed run selector: `full_chain_acceptance_20260704`
- Proposed fixture namespace label: `full-chain-acceptance-2026-07-04`
- Current task execution: no DB connection, no DB read, no DB write, no cleanup, no reset, no migration, no seed.

The existing local app database is not accepted as the full-chain DB-backed acceptance baseline for this preparation
package.

## Source Facts

| Fact                                                                                                              | Source                           | Impact                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `professionValues` are `monopoly`, `marketing`, `logistics`.                                                      | `src/db/schema/auth.ts`          | Fixture scopes must use these values.                                             |
| `authorizationEditionValues` are `standard`, `advanced`.                                                          | `src/db/schema/auth.ts`          | Standard/advanced authorization rows are explicit.                                |
| `redeemCodeTypeValues` include `personal_standard_activation`, `personal_advanced_activation`, `edition_upgrade`. | `src/db/schema/auth.ts`, ADR-007 | Card fixture prep must cover all three types.                                     |
| Admin roles include `super_admin`, `ops_admin`, `content_admin`, `org_standard_admin`, `org_advanced_admin`.      | `src/db/schema/auth.ts`          | Admin account provisioning is admin-domain only.                                  |
| `user_type` is `personal` or `employee`.                                                                          | `src/db/schema/auth.ts`          | Learner and employee accounts are separate from admin records.                    |
| `org_auth` currently has one `profession` and one `level` per row.                                                | `src/db/schema/auth.ts`          | Multi-profession/multi-level package must expand into multiple rows.              |
| `org_auth_organization` maps authorization rows to organization nodes.                                            | `src/db/schema/auth.ts`          | Organization coverage is not encoded in employee rows.                            |
| `employee` binds one `user` to one `organization`.                                                                | `src/db/schema/auth.ts`          | Employee import must not include authorization scope fields.                      |
| `auth_upgrade` can point to `personal_auth` or `org_auth`, exactly one source authorization.                      | `src/db/schema/auth.ts`, ADR-007 | Upgrade card and manual org upgrade preparation must select explicit source auth. |

## Future Fresh Approval Text

The later provisioning execution task should request fresh approval before any DB action. Approval text should be at least
as strict as:

> Approve local-only non-destructive fixture provisioning for
> `full-chain-acceptance-planning-and-materials-prep-2026-07-04` follow-up on local Docker Compose PostgreSQL, target DB
> label `tiku_full_chain_acceptance_20260704_001`, run selector `full_chain_acceptance_20260704`, using private fixture
> account and material inputs in memory only, allowing idempotent create/upsert for the exact listed auth, user, admin,
> organization, authorization, content, paper, practice, mock, training, and audit metadata tables required by the
> approved selector plan. No cleanup/reset/delete/truncate/drop, no schema migration, no source/test/dependency/script
> changes, no Provider, no browser/e2e unless separately approved, and redacted evidence only.

## Provisioning Phases For Later Execution

| Phase  | Allowed future action after approval                                                                                 | Required proof                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| DB-P1  | Create or select isolated local DB label                                                                             | Target label and app runtime label match; no connection string in evidence. |
| DB-P2  | Apply existing reviewed migrations only if the isolated DB is empty and task explicitly approves migration execution | Migration file inventory and command summary; no `drizzle-kit push`.        |
| DB-P3  | Idempotently provision admin-domain accounts                                                                         | Counts by role, no phone/email/password values.                             |
| DB-P4  | Idempotently provision content baseline                                                                              | Counts by material/question/paper/status/type only.                         |
| DB-P5  | Idempotently provision organization tree                                                                             | Node counts by `org_tier` and status only.                                  |
| DB-P6  | Idempotently provision `org_auth` rows                                                                               | Row counts by edition/profession/level/status; multi-scope expansion table. |
| DB-P7  | Idempotently bind organization admins and employees                                                                  | Counts by role/type/org selector only.                                      |
| DB-P8  | Idempotently provision personal cards and auth                                                                       | Counts by `redeem_code_type`, edition, status only.                         |
| DB-P9  | Idempotently create minimal learning/training data only if separately approved                                       | Aggregate counts by surface; no raw answers.                                |
| DB-P10 | Run read-only aggregate preflight                                                                                    | Selector-scoped counts and fail/block classification.                       |

## Allowed Future Table Families

This list is a planning boundary, not current approval:

- Auth/account family: `auth_user`, `auth_account`, `admin`, `user`, `student`, `employee`.
- Organization family: `organization`, `admin_organization`, `org_auth`, `org_auth_organization`, `auth_upgrade`.
- Personal authorization family: `redeem_code`, `personal_auth`, `auth_upgrade`.
- Content family: `material`, `knowledge_node`, `question`, `question_option`, `paper`, `paper_question`, `paper_asset`.
- Learning family: `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`.
- Enterprise training family: `organization_training_*` tables required by the current schema and approved follow-up scope.
- Audit family: redacted `audit_log` and `ai_call_log` metadata only when required by the approved execution task.

## Blocked Future Operations Unless Separately Approved

- Current local DB cleanup or reset.
- Destructive SQL: `delete`, `truncate`, `drop`, broad `update` without selector, or unscoped mutation.
- Schema migration outside an explicit isolated-DB migration task.
- `drizzle-kit push`.
- Reading or printing `.env*`, connection strings, credentials, tokens, raw rows, internal numeric ids, phone, email,
  plaintext `redeem_code`, or passwords.
- Provider calls, staging, production, deployment, Cost Calibration, browser/e2e, or dev server.

## Preflight Acceptance Criteria

Later preflight must record only redacted aggregates:

- Isolated DB target label equals app runtime target label.
- `super_admin`, `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` selectors exist.
- Admin-domain and learner/employee-domain phone selectors do not collide.
- Organization tree contains multiple levels and active target nodes.
- Standard and advanced enterprise packages expand into expected `org_auth` row counts.
- Standard and advanced employee imports each exceed 5 employees.
- Personal standard, advanced, and upgrade card selectors exist.
- Content baseline has material, knowledge node, question type, and paper coverage.
- No forbidden raw value appears in evidence.

## Non-Claims

This document prepares a future approval package only. It does not execute or approve DB work in this task.
