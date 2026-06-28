# Organization Auth Test-Owned DB Schema Alignment Execution Traceability

## Purpose

This execution traces the local DB/schema alignment step approved for
`organization-auth-test-owned-db-schema-alignment-execution-2026-06-28`.

It verifies that a named local dev/disposable target can support `org_auth.edition`, `auth_upgrade`, organization admin
context, direct advanced authorization, standard fallback, active upgrade, and revoked/expired upgrade fallback behavior.

## Source Mapping

| Source                                                                                                      | Requirement used                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`                           | Source authorization rows carry original `edition`; `auth_upgrade` records upgrade facts; `effectiveEdition` is derived.                                       |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                         | Organization authorization supports direct standard/advanced issuance and operations-managed upgrade through `auth_upgrade`.                                   |
| `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`                        | Covers `EAA-ORG-STANDARD-CREATION`, `EAA-ORG-ADVANCED-CREATION`, `EAA-ORG-MANUAL-UPGRADE`, `EAA-UPGRADE-EXPIRED-FALLBACK`, and `EAA-UPGRADE-REVOKED-FALLBACK`. |
| `docs/01-requirements/traceability/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md` | Defines the safe future execution scope and evidence redaction rules consumed by this task.                                                                    |

## Execution Decision

The repository already contained the reviewed migration
`drizzle/20260621024911_add_edition_aware_authorization.sql`. No new migration was generated and no schema file was
edited.

The local target had the pre-existing gap recorded by the prior proof. The reviewed migration was applied locally to
align the target.

## Acceptance Mapping

| Scenario                                  | Local proof result | Evidence mode                        |
| ----------------------------------------- | ------------------ | ------------------------------------ |
| `org_auth.edition` exists                 | Passed             | Column existence boolean only        |
| `auth_upgrade` exists                     | Passed             | Table/column existence booleans only |
| `org_standard_admin` organization context | Passed             | Role label and count only            |
| `org_advanced_admin` organization context | Passed             | Role label and count only            |
| Standard fallback                         | Passed             | Scenario label and count only        |
| Direct advanced                           | Passed             | Scenario label and count only        |
| Active upgrade                            | Passed             | Scenario label and count only        |
| Expired upgrade fallback                  | Passed             | Scenario label and count only        |
| Revoked upgrade fallback                  | Passed             | Scenario label and count only        |

## Boundaries Preserved

- No source code or test file change.
- No new migration or schema file change.
- No package, lockfile, or `.env*` change.
- No `drizzle-kit push`.
- No browser, dev server, e2e, Provider, Cost Calibration, staging/prod/deploy, payment, OCR, export, external-service,
  PR, force push, release readiness, or final Pass.
- Transaction-scoped synthetic fixture proof ended with rollback and left zero fixture rows by the recorded aggregate
  cleanup check.
