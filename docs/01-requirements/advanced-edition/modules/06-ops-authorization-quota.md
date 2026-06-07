# Advanced Edition Operations Authorization And Quota Requirements

## Purpose

Define platform operations governance for `authorization`, `redeem_code`, and quota.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`

## Scope

- Platform operations governs `authorization` upgrades, `redeem_code` state, quota packages, quota adjustments, and quota summaries.
- Governed operations must write `audit_log`.
- AI consumption summaries may link to redacted `ai_call_log` data.

## Acceptance Boundaries

- Operations can inspect safe quota and authorization summaries.
- Cleartext `redeem_code` is not shown in ordinary operations views or evidence.
- Quota changes are auditable.
- Production quota point defaults remain undecided until Cost Calibration Gate is approved.

## Non-Goals

- No online payment.
- No production quota package pricing.
- No provider cost measurement.
- No external-service integration.

Cost Calibration Gate remains blocked pending fresh explicit approval.
