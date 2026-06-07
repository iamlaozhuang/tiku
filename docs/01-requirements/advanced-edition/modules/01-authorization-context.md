# Advanced Edition Authorization Context Requirements

## Purpose

Define the advanced edition access context used by personal users, organization admins, employees, and platform operations.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`

## Scope

- Resolve effective edition and entitlement from `authorization`, `personal_auth`, `org_auth`, and `redeem_code` inputs.
- Preserve personal and organization access boundaries.
- Support future advanced edition checks for AI generation and organization training.
- Record governed operations through `audit_log` when platform operations changes authorization state.

## Acceptance Boundaries

- A personal user can use advanced edition capabilities only when the effective `authorization` context allows it.
- An employee may use organization-provided access only inside the allowed organization context.
- Organization admins can see organization-level summaries, not unrelated personal content.
- Cleartext `redeem_code` must not be exposed in ordinary views, evidence, or logs.

## Non-Goals

- No payment integration.
- No env/secret work.
- No provider calls.
- No Cost Calibration Gate execution.

Cost Calibration Gate remains blocked pending fresh explicit approval.
