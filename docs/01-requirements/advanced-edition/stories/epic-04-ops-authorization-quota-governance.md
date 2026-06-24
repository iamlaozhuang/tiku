# Epic 04 Operations Authorization And Quota Governance

## Actor

Platform operations admin.

## Goal

Govern advanced edition `authorization`, `redeem_code`, and quota state through auditable operations.

## Acceptance Scenario

1. Operations admin opens the authorization and quota governance surface.
2. The system shows safe summaries for `authorization`, `redeem_code`, original `edition`, computed `effectiveEdition`, upgrade state, and quota.
3. The admin performs an allowed governance action.
4. The system records the action in `audit_log`.
5. AI consumption summaries reference redacted `ai_call_log` data when relevant.
6. The admin can generate one `redeem_code` or a specified quantity after choosing `profession` and `level`.
7. The admin can create `org_auth` as `standard` or `advanced` through an explicit selector.
8. The admin can open a governed standard-to-advanced organization upgrade entry based on `auth_upgrade.source_type = ops_manual`.
9. The admin can create one enterprise authorization package with multiple `profession + level` combinations, with expanded atomic scopes and conflict warnings before submit.
10. The admin can download or view employee import template guidance that binds employees to `organization` only.

## Data Boundary

- Cleartext `redeem_code` must not be shown in ordinary operations views or evidence.
- `auth_upgrade` is the governed source for standard-to-advanced upgrade state; source authorization is not overwritten by upgrade actions.
- Production quota point defaults remain undecided until Cost Calibration Gate approval.
- Payment, external-service integration, provider cost measurement, and env/secret work remain out of scope.
- Employee import templates must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`.

## Source Links

- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
