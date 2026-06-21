# Org Auth Schema Implementation Plan

**Date:** 2026-06-21
**Status:** docs-only implementation plan recorded; actual schema and migration work remains blocked.
**Depends on:** `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`

## Approval Boundary

The user selected option A on 2026-06-21 for this follow-up item: create an implementation plan package before any
schema or migration change.

This package may split the future implementation into reviewable packets for schema source edits, migration generation,
migration validation, service adaptation, UI adaptation, compatibility, rollback, and runtime verification. It does not
approve schema source edits, migration generation, migration execution, seed, database connection, data backfill,
authorization runtime behavior changes, source implementation, service/UI implementation, dependency changes, env/secret
access, Provider calls, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost
Calibration Gate work.

## Recorded Inputs

- Contract and security preflight is recorded in
  `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`.
- The schema approval package is recorded in
  `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`.
- The selected storage direction keeps `org_auth` as the bundle or purchase record and adds `org_auth_scope` plus
  `org_auth_scope_organization` as future atomic scope storage.
- Existing `org_auth` rows without atomic child rows remain compatibility data and must be interpreted as covering both
  registered `subject` values, `theory` and `skill`, until a later approved migration path exists.

## Implementation Packets

Future work must use separate tasks and commits in this order.

| order | packet id                                    | allowed after fresh approval                                                                                          | output                                                                                  | still blocked inside packet unless separately approved                                  |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1     | `org-auth-schema-source-implementation`      | Edit schema source for `org_auth_scope` and `org_auth_scope_organization`; add focused static schema checks.          | Reviewed source diff for tables, relations, indexes, constraints, and enum usage.       | Migration generation, migration execution, database connection, seed, backfill.         |
| 2     | `org-auth-migration-generation-review`       | Generate the migration file from the reviewed schema source and inspect generated SQL.                                | Migration file plus generated-SQL review evidence.                                      | Migration execution, database connection, seed, backfill, runtime behavior changes.     |
| 3     | `org-auth-migration-static-validation`       | Validate generated SQL shape, rollback shape, and compatibility assumptions using static review and redacted outputs. | Evidence for forward SQL, rollback plan, drift assumptions, and sensitive-data scan.    | Any database connection or migration execution.                                         |
| 4     | `org-auth-effective-scope-service`           | Implement atomic effective-scope read/write behavior behind reviewed contracts.                                       | Focused service and repository behavior with unit coverage and redacted audit evidence. | Schema or migration edits, database runtime proof, browser/dev-server/e2e verification. |
| 5     | `org-auth-admin-scope-builder-ui`            | Implement admin bundle builder and detail display against approved service contracts.                                 | Focused UI/service wiring with non-browser local validation.                            | Browser/dev-server/e2e proof and schema or migration edits.                             |
| 6     | `org-auth-compatibility-and-migration-guard` | Implement compatibility projections and prepare reviewed backfill guardrails.                                         | Redacted compatibility evidence and explicit migration guard decisions.                 | Backfill execution and database access unless the task approval allows them.            |
| 7     | `org-auth-runtime-verification`              | Verify admin and employee flows after source, schema, service, and UI prerequisites are stable.                       | Browser or e2e evidence only if runtime approval is granted.                            | Provider calls, deploy, cloud resources, PR, force-push.                                |

## Schema Source Packet Requirements

The future schema source packet must prove all of the following before closeout:

- `org_auth_scope` stores exactly one `profession`, one `level`, one `subject`, one `edition`, one quota rule, one
  status, and one time window per row.
- `org_auth_scope_organization` stores selected coverage nodes for `specified_nodes`.
- `auth_scope_type` remains organization coverage only and is not reused for `profession`, `level`, `subject`, or
  `edition` coverage.
- Index names follow glossary rules, including `idx_` and `udx_` prefixes.
- Existing `org_auth` and `org_auth_organization` compatibility rows are not removed or reinterpreted by source edits.
- Internal numeric `id` values remain internal and do not enter URLs, DTOs, logs, or evidence.

## Migration Generation Packet Requirements

The future migration generation packet must:

- run only the approved generation command declared in that task plan;
- keep the generated migration in a single reviewable commit;
- include static SQL review notes for table creation order, foreign keys, checks, indexes, and rollback shape;
- prove no database connection, seed, or data backfill was performed;
- keep any generated evidence redacted and free of database URLs, tokens, internal numeric ids, plaintext redeem_code
  values, Provider payloads, and private answer text.

## Compatibility And Quota Decisions

The schema implementation path does not decide quota backfill. A later migration guard packet must choose one reviewed
quota attribution rule before any data migration:

- allocate quota per generated atomic `subject` scope;
- preserve bundle-level quota as a compatibility projection until a formal migration is approved;
- or introduce another reviewed attribution rule with product and security sign-off.

Existing access must not narrow silently. Compatibility records without durable atomic scopes are interpreted as covering
both `theory` and `skill` until the approved migration guard changes that behavior with evidence.

## Rollback And Evidence Rules

Each future packet must include:

- exact file scope and blocked file scope;
- commands used for validation;
- generated SQL or source diff review path when relevant;
- rollback decision point and rollback procedure;
- redacted evidence format;
- audit review confirming no session token, database URL, internal numeric id, plaintext redeem_code value, raw prompt,
  Provider payload, or private answer text is included.

## Current Blockers

The following remain blocked after this package:

- schema source edits;
- migration generation or execution;
- seed, backfill, or database connection;
- service, repository, API, or UI implementation;
- authorization runtime behavior changes;
- browser/dev-server/e2e runtime proof;
- package or lockfile changes;
- deploy, PR, force-push, Provider calls, payment, external service, or Cost Calibration Gate work.
