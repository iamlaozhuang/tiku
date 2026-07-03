# Edition-Aware Authorization Requirements

## Purpose

Define the product and governance requirements for issuing, upgrading, revoking, and evaluating `standard | advanced` authorization for personal users and organizations.

This document supplements the advanced edition requirement reading surface. It records confirmed product decisions only; it does not approve schema, migration, API, source code, dependency, env/secret, provider, payment, deployment, or Cost Calibration Gate work.

## Source Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Confirmed Decisions

- `edition` is the original product edition on the authorization source. First-release values are `standard` and `advanced`.
- `effectiveEdition` is the service-computed edition after evaluating source authorization validity, upgrade records, expiry, revocation, and scope.
- `advanced` includes the standard edition capability set plus advanced-only capabilities.
- New authorization can be issued directly as `standard` or `advanced`.
- Upgrading an existing standard authorization keeps the original authorization and creates an `auth_upgrade` record. It does not overwrite the original authorization.
- Existing unversioned authorization data is interpreted as `standard` for backward compatibility until a later approved migration records explicit source `edition`.
- UI visibility is not an authorization boundary. Runtime services must enforce `effectiveEdition` and capability checks.
- `org_auth` creation must expose an explicit `edition = standard | advanced` selector.
- A commercial enterprise authorization package may cover multiple `profession + level` combinations, but eligibility, quota, expiry, cancellation, overlap, and audit must remain attributable to atomic authorization scopes.
- Employee import binds employee accounts to `organization` only. Employee-visible `profession`, `level`, `subject`, and `edition` scope is derived from active organization authorization scopes covering that organization context.

## Personal Authorization

Personal `redeem_code` operations have three first-release kinds:

| Kind                           | Result                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `personal_standard_activation` | Creates or grants a standard `personal_auth` for the user and authorized `profession + level`.  |
| `personal_advanced_activation` | Creates or grants an advanced `personal_auth` for the user and authorized `profession + level`. |
| `edition_upgrade`              | Upgrades an existing active standard `personal_auth` to advanced by creating `auth_upgrade`.    |

Personal upgrade rules:

- `edition_upgrade` is a kind of `redeem_code`, not a separate card system.
- `edition_upgrade` requires an active standard `personal_auth` for the same user and `profession + level`.
- `edition_upgrade` must not create a new `personal_auth`.
- If the user already has effective advanced access for the same `profession + level`, the upgrade must not consume another upgrade code.
- If multiple active standard `personal_auth` records match the same user and `profession + level`, the user or operator
  must explicitly choose the upgrade target; the system must not silently pick one.
- Upgrade expiry inherits the target `personal_auth.expires_at` unless a later approved requirement explicitly changes that rule.
- Operations generation surfaces must require explicit `redeem_code_type`; defaulting all personal card generation to standard activation is not acceptable for standard/advanced combined requirements.

## Organization Authorization

Organization authorization supports two first-release issuance paths:

| Path                                | Result                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Direct `org_auth` creation          | Platform operations can create an `org_auth` as `standard` or `advanced`.                                      |
| Manual standard-to-advanced upgrade | Platform operations can upgrade an active standard `org_auth` through `auth_upgrade.source_type = ops_manual`. |

Organization upgrade rules:

- Only platform operations admins can upgrade an organization authorization in the first release.
- Organization admins and employees cannot use personal `edition_upgrade` codes to upgrade `org_auth`.
- Manual upgrade requires an external reference, operations note, operator public id, and linked `audit_log`.
- Manual upgrade inherits the target `org_auth.expires_at`.
- Revocation changes only the `auth_upgrade` state and revocation fields. It must not delete the upgrade or rewrite the original `org_auth`.

Organization multi-scope rules:

- `org_auth` remains the authorization bundle or purchase record.
- A future reviewed atomic scope layer, currently referred to as `org_auth_scope` in traceability documents, represents one organization coverage plus one `profession`, one `level`, one `subject`, one `edition`, one time window, and one quota rule.
- Product and operations UI may present one bundle containing multiple `profession + level` combinations, but the system must decompose that bundle into atomic scopes for service checks and audit.
- `auth_scope_type` continues to describe organization coverage only and must not be overloaded for `profession`, `level`, `subject`, or `edition`.
- Active overlapping atomic scopes for the same effective `organization`, `profession`, `level`, `subject`, `edition`, and time window are denied unless a later approved upgrade, renewal, or extension rule defines precedence and audit wording.
- Current first-release closure actions for a blocked overlap are explicit only: renewal successor, manual standard-to-advanced
  upgrade through `auth_upgrade.source_type = ops_manual`, transactional replacement, or increase-only quota expansion
  for the same active atomic scope. Silent auto-merge is not allowed.
- Quota summaries may aggregate rows for display, but consumption and audit must retain the atomic scope that granted access.

Employee import under multi-scope authorization:

- Import templates must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`.
- Import preview may show inherited scopes and quota impact as computed outcomes.
- If quota is insufficient, the affected row or action is blocked with a redacted reason instead of silently creating unclear partial authorization.
- If a customer needs different employee groups to see different professional or level scopes, the preferred model is organization-node segmentation followed by authorization scopes on those nodes.

## Effective Edition Rules

Services must compute `effectiveEdition` using these rules:

1. If the source authorization is missing, inactive, out of date range, revoked, cancelled, or outside the requested scope, no valid authorization context is produced.
2. If the source authorization has original `edition = advanced`, the context is advanced while the source remains valid.
3. If the source authorization has original `edition = standard` and has an active, unexpired, unrevoked `auth_upgrade` to `advanced`, the context is advanced.
4. If the upgrade expires or is revoked while the source authorization remains valid, the context falls back to standard unless another valid advanced source applies.
5. If the source authorization has no explicit edition because it predates the edition model, the source is interpreted as standard.
6. `effectiveEdition` is never written back to overwrite the source `edition`.

## Authorization Context And Quota Ownership

Authorization APIs should expose a list of selectable authorization contexts rather than a single flat edition flag.

Each context must carry:

- authorization source: `personal_auth` or `org_auth`;
- source authorization public id;
- original `edition`;
- computed `effectiveEdition`;
- `upgradeStatus`;
- `profession`, `level`, and subject scope;
- owner type and owner public id;
- `quotaOwnerType` and `quotaOwnerPublicId`;
- expiry and display status.

Quota ownership defaults:

| Context                    | Data owner    | Quota owner   |
| -------------------------- | ------------- | ------------- |
| Personal authorization     | Personal user | Personal user |
| Organization authorization | Organization  | Organization  |

The system must not automatically switch a user to another context solely to obtain a higher `effectiveEdition` or more quota. Personal learning entrypoints default to the personal context when available; organization entrypoints use organization context only when selected or required by the workflow.

Production quota point defaults remain undecided until the Cost Calibration Gate is approved.

## Operations And Audit

Operations surfaces must support safe summaries for:

- personal and organization authorization edition;
- upgrade status and expiry;
- `org_auth` bundle, expanded atomic scope rows, conflict warnings, and effective status;
- `redeem_code` kind and status;
- quota owner and quota summary;
- operator, external reference, operations note, and audit linkage.

Operations logs, evidence, committed documents, screenshots, error output, exported files, and non-distribution audit summaries must not expose secret material, provider payloads, raw prompts, raw generated AI content, raw employee answer text, full paper content, internal database rows, or plaintext `redeem_code` values.

`redeem_code` generation requirements:

- Operations can generate one `redeem_code` or a specified quantity.
- Generation requires explicit `redeem_code_type`, `profession`, and `level`.
- `redeem_code_type` values are `personal_standard_activation`, `personal_advanced_activation`, and `edition_upgrade`.
- Generation success provides a distribution window that lets eligible operators view and copy the newly generated plaintext values.
- After leaving the distribution window, ordinary operations list and detail pages may still show and copy plaintext `redeem_code` values for `ops_admin` and `super_admin`, because offline distribution, support, and replenishment are operational requirements.
- `content_admin`, organization admins, employees, learners, and unauthenticated users must not be able to view plaintext `redeem_code` values.
- View and copy actions must write `audit_log` metadata, but the audit row must not store plaintext card values or card hashes.
- Evidence, committed documents, runtime logs, error logs, screenshots, and exported files must remain redacted and must not include plaintext `redeem_code` values.

`audit_log` is required for governed authorization creation, upgrade, revocation, quota grant, and manual adjustment actions once those actions are implemented in later approved tasks.

## Non-Goals

- No online payment, refund, invoice, settlement, or external payment callback.
- No provider call, provider measurement, real model request, prompt execution, or Cost Calibration Gate execution.
- No schema, migration, API, service, UI, dependency, env/secret, staging, production, deployment, PR, or force-push approval.
- No production quota package pricing or quota point default values.

## Future Implementation Packets

Later implementation must be split into scoped tasks with explicit approvals:

1. Schema and migration packet for `edition`, `redeem_code_type`, and `auth_upgrade`.
2. API, contract, validator, and mapper packet for edition-aware authorization operations.
3. Service and repository packet for `effectiveEdition` and authorization context calculation.
4. Personal `redeem_code` operation packet.
5. Organization authorization and manual upgrade packet.
6. Organization multi-scope `org_auth` bundle and atomic scope packet.
7. Employee import template and organization-only binding packet.
8. Quota governance packet after Cost Calibration Gate decisions.
9. Standard and advanced full-flow validation packet.
