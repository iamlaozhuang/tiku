# Org Auth Schema Approval Package

**Date:** 2026-06-21
**Status:** docs-only schema approval package recorded; schema implementation plan recorded separately; schema
implementation remains blocked.
**Depends on:** `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`

## Approval Boundary

The user selected option A on 2026-06-21 for this follow-up package: create a docs-only `org-auth-schema-approval-package`.

This package may design the future `org_auth_scope` atomic child table and related coverage link table, including fields, constraints, indexes, migration safety, rollback, and redacted evidence rules. It does not approve schema source edits, migration generation, migration execution, seed, database connection, data backfill, authorization runtime behavior changes, source implementation, service/UI implementation, dependency changes, env/secret access, Provider calls, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.

## Current Schema Baseline

Static readback of `src/db/schema/auth.ts` shows the current model:

- `org_auth` stores one `profession`, one `level`, one `edition`, one `auth_scope_type`, quota fields, time-window fields, `status`, and `cancelled_at`.
- `org_auth` does not store `subject`.
- `org_auth_organization` links `org_auth` to covered `organization` rows for `specified_nodes`.
- Existing indexes include `udx_org_auth_public_id`, `idx_org_auth_purchaser_organization_id`, `idx_org_auth_status`, `idx_org_auth_profession_level`, and `idx_org_auth_expires_at`.
- Existing data must remain backward-compatible and is interpreted as covering both registered `subject` values, `theory` and `skill`, until a later approved migration path is implemented.

## Proposed Future Tables

The reviewed future schema direction is:

1. Keep `org_auth` as the bundle or purchase record.
2. Add a child table named `org_auth_scope` for atomic authorization scope rows.
3. Add a coverage link table named `org_auth_scope_organization` for `specified_nodes` coverage.
4. Keep the existing `org_auth_organization` table as compatibility data until a later migration and read-compatibility package retires it.

This is a design target only. No migration file or schema source edit is approved by this package.

The follow-up implementation planning package is recorded in
`docs/02-architecture/interfaces/2026-06-21-org-auth-schema-implementation-plan.md`. It splits future schema source,
migration generation, static migration validation, service adaptation, UI adaptation, compatibility, rollback, and
runtime verification into separate approval gates. It still does not approve actual schema source edits, migration
generation, migration execution, database access, data backfill, or runtime behavior changes.

## `org_auth_scope` Design

Future table name: `org_auth_scope`.

Proposed columns:

| column            | rule                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`              | BIGINT self-increment primary key, internal only.                                                                   |
| `public_id`       | Public identifier for API, logs, and evidence references.                                                           |
| `org_auth_id`     | Foreign key to `org_auth.id`, with restricted deletion unless a later migration package approves cascade semantics. |
| `auth_scope_type` | Organization coverage type only: `current_and_descendants` or `specified_nodes`.                                    |
| `profession`      | One registered `profession` value.                                                                                  |
| `level`           | One positive integer level.                                                                                         |
| `subject`         | One registered `subject` value: `theory` or `skill`.                                                                |
| `edition`         | One source authorization edition value.                                                                             |
| `account_quota`   | Quota owned by this atomic scope.                                                                                   |
| `used_quota`      | Usage attributed to this atomic scope.                                                                              |
| `starts_at`       | Scope start timestamp.                                                                                              |
| `expires_at`      | Scope expiry timestamp.                                                                                             |
| `status`          | Authorization status.                                                                                               |
| `cancelled_at`    | Nullable cancellation timestamp.                                                                                    |
| `created_at`      | Creation timestamp.                                                                                                 |
| `updated_at`      | Update timestamp.                                                                                                   |

Proposed constraints:

- `udx_org_auth_scope_public_id` unique on `public_id`.
- `idx_org_auth_scope_org_auth_id` on `org_auth_id`.
- `idx_org_auth_scope_status` on `status`.
- `idx_org_auth_scope_dimension` on `profession`, `level`, `subject`, and `edition`.
- `idx_org_auth_scope_window` on `starts_at` and `expires_at`.
- Check `level > 0`.
- Check `account_quota >= 0`.
- Check `used_quota >= 0`.
- Check `used_quota <= account_quota`.
- Check `expires_at > starts_at`.
- Check `cancelled_at` is present only when the approved status semantics require it.

The overlap rule spans organization coverage and time windows. Because descendant coverage depends on organization hierarchy, the first implementation should enforce overlap denial in the service layer with transaction-safe checks. A database exclusion constraint may be introduced only if a later schema implementation task proves the organization coverage model can express direct and descendant overlap safely.

## `org_auth_scope_organization` Design

Future table name: `org_auth_scope_organization`.

Proposed columns:

| column              | rule                                              |
| ------------------- | ------------------------------------------------- |
| `id`                | BIGINT self-increment primary key, internal only. |
| `org_auth_scope_id` | Foreign key to `org_auth_scope.id`.               |
| `organization_id`   | Foreign key to `organization.id`.                 |
| `created_at`        | Creation timestamp.                               |

Proposed constraints and indexes:

- `udx_org_auth_scope_organization_org_auth_scope_id_organization_id` unique on `org_auth_scope_id`, `organization_id`.
- `idx_org_auth_scope_organization_org_auth_scope_id` on `org_auth_scope_id`.
- `idx_org_auth_scope_organization_organization_id` on `organization_id`.

For `current_and_descendants`, the covered root organization should be resolved from the bundle purchase context or a later approved explicit root rule. For `specified_nodes`, this link table holds the selected coverage nodes.

## Compatibility And Migration Safety

No data migration is approved by this package.

Future implementation must follow a staged migration plan:

1. Add new tables without changing current reads or writes.
2. Add dual-read service behavior only after the service package is approved.
3. Keep existing `org_auth` rows without child rows as compatibility data.
4. Inventory existing `org_auth` and `org_auth_organization` rows with redacted aggregate counts only.
5. Prepare a dry-run backfill plan that proves how `theory` and `skill` compatibility will be represented without silently narrowing access.
6. Do not execute backfill until a later migration task has fresh approval and rollback evidence.

Quota migration is a separate decision. Because existing quota may have been interpreted at bundle level, a later migration package must decide whether to allocate quota per subject, share quota through bundle-level compatibility, or use another reviewed quota attribution rule. This package does not approve quota backfill.

## Rollback Requirements

Before any schema implementation task runs, it must define:

- exact migration filenames and generated SQL review path;
- backup or restore point requirements;
- rollback decision point;
- rollback SQL or restore procedure;
- drift check between reviewed schema and target database;
- redacted evidence format;
- rule that no internal numeric ids, raw rows, database URLs, session tokens, plaintext redeem_code values, Provider payloads, or private answer text enter evidence.

## Future Implementation Gate

The next `org_auth` implementation item may be `org-auth-effective-scope-service` only after a later fresh approval explicitly allows source implementation. The service package must consume this schema plan but cannot run against a real database unless database access is separately approved.

Remaining blocked work:

- schema source edits;
- migration generation or execution;
- seed or data backfill;
- database connection;
- runtime authorization changes;
- service/UI implementation;
- browser/dev-server/e2e runtime proof.
