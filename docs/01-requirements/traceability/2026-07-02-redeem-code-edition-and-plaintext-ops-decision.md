# 2026-07-02 Redeem Code Edition And Plaintext Operations Decision

## Status

Confirmed product decision, docs-only.

This document records the current requirement discussion outcome for personal `redeem_code` edition types and operations plaintext visibility. It does not approve source code changes, tests, schema, migration, database access, Provider execution, env/secret access, browser/runtime validation, staging/prod deployment, payment, release readiness, final Pass, or production usability claims.

## Source Reading

Requirement sources:

- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

Read-only implementation observations:

- `src/db/schema/auth.ts` already defines `redeem_code_type` values for `personal_standard_activation`, `personal_advanced_activation`, and `edition_upgrade`, and `personal_auth.edition`.
- `drizzle/20260621024911_add_edition_aware_authorization.sql` adds the edition-aware schema surface.
- Current admin generation service and repository behavior is standard-activation oriented and does not expose an explicit `redeem_code_type` generation choice in the observed runtime path.
- Current student redemption path creates `personal_auth` and does not yet implement `edition_upgrade` as an `auth_upgrade` write.
- Current admin list/detail contract and UI are masked-oriented and do not yet implement the confirmed eligible-role plaintext list/detail copy behavior.

These code observations are gap evidence only. This decision file does not start implementation.

## Confirmed Decisions

### RD-2026-07-02-01 Personal Redeem Code Types

Personal `redeem_code` must distinguish three first-release kinds:

| `redeem_code_type`             | Required behavior                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_activation` | Creates or grants standard `personal_auth` for the redeeming user and selected `profession + level`.                                |
| `personal_advanced_activation` | Creates or grants advanced `personal_auth` for the redeeming user and selected `profession + level`.                                |
| `edition_upgrade`              | Upgrades an existing active standard `personal_auth` for the same user and `profession + level` to advanced through `auth_upgrade`. |

Rules:

- `edition_upgrade` is a `redeem_code` kind, not a separate card system.
- `edition_upgrade` must not create a new `personal_auth`.
- If the user already has effective advanced access for the same `profession + level`, the upgrade must not consume another upgrade card.
- If multiple active standard `personal_auth` records match the same user and `profession + level`, the user or operator
  must explicitly choose the target authorization; automatic selection is not acceptable.
- Operations generation must require explicit `redeem_code_type`, `profession`, and `level`.

### RD-2026-07-02-02 Operations Plaintext Visibility

Operations distribution requires plaintext access after generation.

Confirmed behavior:

- Generation success provides a distribution window that lets eligible operators view and copy the plaintext values generated in that operation.
- Leaving the distribution window does not remove all plaintext access.
- `ops_admin` and `super_admin` may view and copy plaintext `redeem_code` values in ordinary operations list and detail pages for distribution, support, and replenishment.
- Non-eligible roles, including `content_admin`, organization admins, employees, learners, and unauthenticated users, must not view plaintext values.

Redaction boundary:

- `audit_log` must record view/copy metadata, including actor, action, time, target `publicId`, and purpose or reason when collected.
- `audit_log` must not store plaintext card values or card hashes.
- Evidence, committed documents, runtime logs, error logs, screenshots, exported files, and non-distribution audit summaries must not contain plaintext `redeem_code` values.

## Implementation Gap Register

| Gap                            | Current observation                                                          | Required later task                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Generation type selection      | Runtime generation path appears to default to standard activation semantics. | Add explicit `redeem_code_type` input, validation, contract, UI control, and redacted audit metadata.                               |
| Advanced activation redemption | Redemption path appears to create standard `personal_auth` by default.       | Apply selected `redeem_code_type` so advanced activation creates advanced `personal_auth`.                                          |
| Upgrade redemption             | Redemption path does not yet create `auth_upgrade` for `edition_upgrade`.    | Validate active standard `personal_auth`, prevent unnecessary consumption when already advanced, and write governed `auth_upgrade`. |
| Plaintext list/detail          | Existing admin list/detail behavior is masked-oriented.                      | Implement eligible-role plaintext display/copy in operations list/detail with redacted audit.                                       |
| Evidence safety                | Plaintext access is now allowed in product UI for eligible roles.            | Keep all test evidence and committed artifacts redacted; use status summaries only.                                                 |

## Non-Goals

- No product source implementation.
- No schema or migration approval.
- No runtime browser validation.
- No database mutation.
- No Provider, Prompt, model, or Cost Calibration work.
- No online payment.
- No release readiness, final Pass, or production usability claim.
