# ADR-007: Edition-Aware Authorization Source Of Truth

## Status

Accepted

## Date

2026-06-21

## Related

- adr-001-tech-stack-selection.md
- adr-002-runtime-architecture-and-multi-client-contract.md
- adr-004-environment-isolation-and-release-boundaries.md
- adr-005-staging-architecture-and-release-boundaries.md
- adr-006-runtime-dependency-alignment.md
- ../../01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- ../../01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md

## Context

Tiku has standard personal `redeem_code` and organization `org_auth` concepts, and advanced requirements already depend on `effectiveEdition`, `personal_auth`, `org_auth`, `auth_upgrade`, and quota ownership. Operations must be able to handle personal and organization standard and advanced authorization without relying on UI-only state.

The current documentation gap is the source-of-truth rule for where original edition, upgrades, and effective authorization should live. Without a clear rule, later implementation could duplicate edition flags across UI, authorization rows, and advanced feature services.

This ADR records a documentation-level architecture decision only. It does not approve schema, migration, API, service, repository, UI, dependency, env/secret, provider, payment, deployment, or Cost Calibration Gate work.

## Decision

Tiku will use an edition-aware authorization source-of-truth model:

- Source authorization records carry original `edition`; first-release values are `standard | advanced`.
- `auth_upgrade` carries upgrade facts for standard-to-advanced upgrades.
- Services compute `effectiveEdition` dynamically from source authorization validity, original `edition`, active upgrade state, expiry, revocation, and scope.
- `effectiveEdition` is a derived runtime value and must not be written back to overwrite source `edition`.
- UI state and menu visibility are not authorization boundaries.
- Existing authorization records with no explicit edition are interpreted as `standard` until a later approved migration records explicit values.

## Personal Authorization Boundary

Personal card operations will be modeled as three first-release kinds:

- `personal_standard_activation` creates or grants standard personal authorization.
- `personal_advanced_activation` creates or grants advanced personal authorization.
- `edition_upgrade` upgrades an existing active standard `personal_auth` by creating `auth_upgrade`.

`edition_upgrade` remains a kind of `redeem_code`. It is not a separate card system and it does not create a new `personal_auth`.

## Organization Authorization Boundary

Organization authorization can be issued directly as `standard` or `advanced`.

An existing standard `org_auth` can be upgraded through platform operations by creating `auth_upgrade.source_type = ops_manual`. Organization admins and employees cannot use personal upgrade codes to upgrade organization authorization in the first release.

## Quota Ownership Boundary

Quota ownership follows the selected authorization context:

- personal context uses personal quota ownership;
- organization context uses organization quota ownership.

The system must not automatically switch authorization contexts solely to obtain a higher `effectiveEdition` or more quota. Production quota values remain blocked until Cost Calibration Gate approval.

## Consequences

- Later schema work must model original edition and upgrade records separately.
- Later service work must centralize `effectiveEdition` and capability checks in the service layer described by ADR-002.
- Later API and UI work must expose source edition, effective edition, upgrade status, and quota owner without exposing internal ids or sensitive material.
- Backward compatibility is straightforward because unversioned historical authorization is standard by default.
- Payment, pricing, provider, quota defaults, staging/prod deployment, and migration execution remain separately gated.

## Later Clarification

The 2026-07-02 `redeem_code` decision creates a narrow product-UI exception for offline distribution: eligible
`ops_admin` and `super_admin` users may view/copy plaintext `redeem_code` values in the generation distribution window
and in ordinary operations list/detail pages. This exception supersedes the older blanket wording below only for that
specific product UI surface.

The exception does not permit plaintext `redeem_code` values in evidence, committed documents, runtime logs, error logs,
screenshots, exports, non-distribution audit summaries, or non-eligible role views. Audit rows may record view/copy
metadata, but not plaintext card values or card hashes.

## Non-Goals

- No online payment, refund, invoice, settlement, or external purchase confirmation.
- No provider call, model request, env/secret change, dependency change, schema migration, deployment, PR, or force-push approval.
- No Cost Calibration Gate execution or production quota default decision.
- No permission to expose secret material, provider payloads, raw prompts, raw generated AI content, raw employee answer
  text, full paper content, internal database rows, or plaintext `redeem_code` values outside the narrow 2026-07-02
  eligible-operations product UI exception described above.
