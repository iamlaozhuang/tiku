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
> account and material inputs in memory only, allowing idempotent create/upsert only for the explicitly approved
> bootstrap `super_admin` selector and required static configuration such as `contact_config`. Scenario-owned outputs
> including `ops_admin`, `content_admin`, organization tree, `org_auth`, organization admins, employee accounts,
> `redeem_code`, personal users, content, paper, practice, mock, training, and analytics rows must be created by the
> later acceptance flow unless a future task separately approves a shortcut and records the proof it narrows. No
> cleanup/reset/delete/truncate/drop, no schema migration, no source/test/dependency/script changes, no Provider, no
> browser/e2e unless separately approved, and redacted evidence only.

## Baseline Seed Versus Scenario-Created Data

| Category        | Allowed default preparation stance                               | Examples                                                                                             |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Bootstrap seed  | May be idempotently created after fresh approval                 | Isolated DB label, reviewed migrations for an empty DB, bootstrap `super_admin`, `contact_config`.   |
| Scenario input  | May be prepared outside DB and used in memory during execution   | Private account inputs, employee CSVs, organization tree plan, material files, card request labels.  |
| Scenario output | Must be created by the later experiential flow by default        | `ops_admin`, `content_admin`, org tree, `org_auth`, org admins, employees, cards, content, learning. |
| Shortcut seed   | Blocked unless separately approved with explicit proof narrowing | Any pre-created organization, authorization, card, user, question, paper, answer, training row.      |

## Provisioning Phases For Later Execution

| Phase | Allowed future action after approval                                                                                 | Required proof                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| DB-P1 | Create or select isolated local DB label                                                                             | Target label and app runtime label match; no connection string in evidence. |
| DB-P2 | Apply existing reviewed migrations only if the isolated DB is empty and task explicitly approves migration execution | Migration file inventory and command summary; no `drizzle-kit push`.        |
| DB-P3 | Idempotently provision bootstrap `super_admin` and required static config only                                       | Counts by bootstrap role/config label only.                                 |
| DB-P4 | Verify scenario-owned outputs are absent or marked pending before browser/e2e                                        | Zero/pending counts by selector family; no raw rows.                        |
| DB-P5 | Prepare private scenario inputs outside DB                                                                           | Input file presence and shape only; no private values.                      |
| DB-P6 | Run browser/e2e scenario actions after separate approval                                                             | Scenario-created counts by role/surface/status.                             |
| DB-P7 | Run selector-scoped read-only aggregate proof after each scenario batch                                              | Counts by edition/profession/level/status; no raw rows.                     |
| DB-P8 | Split repair/provisioning only on fail/block                                                                         | Repair task id and blocked selector summary.                                |

## Table Family Boundary

This list is a planning boundary, not current approval:

- Bootstrap write candidates after fresh approval: reviewed migrations for an empty isolated DB, bootstrap
  `super_admin`, auth/session-compatible account rows required for that selector, `contact_config`, and other explicitly
  named static config.
- Scenario-created write candidates during later browser/e2e approval: `ops_admin`, `content_admin`, `organization`,
  `admin_organization`, `org_auth`, `org_auth_organization`, `employee`, `redeem_code`, `personal_auth`, `auth_upgrade`,
  content, paper, learning, mock, mistake-book, enterprise training, audit, and AI call metadata rows generated by the
  scenario itself.
- Read-only verification candidates: selector-scoped aggregates for the same families, with no raw rows, no internal ids,
  and no private values in evidence.

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
- Bootstrap `super_admin` and required static config selectors exist.
- Scenario-owned output families are absent or explicitly marked pending before the experiential flow starts.
- Private input files for `ops_admin`, `content_admin`, org admins, employees, cards, organization tree, and materials
  are present and shape-checked without values.
- Employee import inputs each exceed 5 employees and contain no authorization fields.
- Question, paper, AI support, and learning workload inputs cover the required shapes.
- No forbidden raw value appears in evidence.

## Non-Claims

This document prepares a future approval package only. It does not execute or approve DB work in this task.
