# Advanced Edition Operations Authorization And Quota Requirements

## Purpose

Define platform operations governance for `authorization`, `redeem_code`, and quota.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`

## Scope

- Platform operations governs `authorization` upgrades, `redeem_code` state, quota packages, quota adjustments, and quota summaries.
- Platform operations can issue personal or organization authorization as `standard | advanced` and can govern standard-to-advanced `auth_upgrade` state.
- Governed operations must write `audit_log`.
- AI consumption summaries may link to redacted `ai_call_log` data.
- Platform operations can generate one `redeem_code` or a specified quantity, with explicit `profession` and `level`.
- Platform operations can create `org_auth` with explicit `edition = standard | advanced`.
- Platform operations can upgrade an active standard `org_auth` to advanced through governed `auth_upgrade.source_type = ops_manual` semantics.
- Platform operations can open one commercial enterprise authorization package covering multiple `profession + level` combinations by expanding the package into atomic scopes.
- Platform operations must provide employee import template guidance or a reusable template, while keeping employee import scoped to `organization` binding only.

## Acceptance Boundaries

- Operations can inspect safe quota and authorization summaries.
- Operations summaries show original `edition`, computed `effectiveEdition`, upgrade status, and quota owner without exposing sensitive data.
- `redeem_code` generation supports both single-card and specified-quantity workflows.
- `redeem_code` generation requires `profession` and `level` before submit.
- Cleartext `redeem_code` is not shown in ordinary operations views or evidence.
- `org_auth` creation has a visible standard/advanced selector.
- Standard-to-advanced organization upgrade has an operations entry and writes redacted audit metadata.
- Multi-scope `org_auth` creation shows the selected bundle, expanded atomic scope rows, quota/expiry/cancellation differences, and conflict warnings before submit.
- Employee import templates do not contain `profession`, `level`, `edition`, or `orgAuthScopePublicId`; inherited scopes and quota impact may appear only in preview.
- Quota changes are auditable.
- Production quota point defaults remain undecided until Cost Calibration Gate is approved.

## Non-Goals

- No online payment.
- No production quota package pricing.
- No provider cost measurement.
- No external-service integration.

Cost Calibration Gate remains blocked pending fresh explicit approval.
