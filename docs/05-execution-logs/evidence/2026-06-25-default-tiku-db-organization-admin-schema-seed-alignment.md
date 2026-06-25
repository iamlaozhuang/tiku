# Evidence: default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25

## Scope

- Task id: `default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25`.
- Branch: `codex/default-tiku-db-schema-seed-align-20260625`.
- Approval consumed: current user serial approval on 2026-06-25 for task 3 schema/migration/seed.
- Target: local Docker default database `tiku`.
- Boundary preserved: no `.env*`, no database URLs, no staging/prod/cloud DB, no destructive reset/drop/truncate, no Provider, no dependency changes, no payment/external service, no PR/force push, and no final MVP Pass claim.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-state-reconciliation.md`.
- `drizzle/20260616113718_add_admin_organization.sql`.
- `drizzle/20260625030100_add_organization_admin_roles.sql`.
- `src/db/dev-seed.ts`.

## Pre-State

Default `tiku` DB aggregate before task 3:

- Tables existed for the main runtime model, but `admin_organization` was missing.
- `admin_role` enum contained only `super_admin`, `ops_admin`, and `content_admin`.
- Org admin dev seed auth/admin rows and bindings were not present as usable organization admin accounts.
- Existing Drizzle CLI and dev seed script were not used because they read `.env.local`.

## Schema Alignment

Executed non-destructive local Docker `psql` SQL against database `tiku`:

- Added `org_standard_admin` to `admin_role` if missing.
- Added `org_advanced_admin` to `admin_role` if missing.
- Created `admin_organization` if missing.
- Added foreign key constraints and indexes if missing.

Result: `default_tiku_schema_alignment=pass`.

## Seed Alignment

Executed targeted local Docker `psql` seed alignment:

- Ensured one local dev organization row exists.
- Upserted two local dev org admin `auth_user` rows.
- Upserted two local dev org admin `auth_account` rows.
- Upserted two local dev org admin `admin` rows.
- Inserted two `admin_organization` bindings.

The first seed attempt failed because default `tiku.auth_user.email_verified` is `timestamp with time zone`, not boolean. The seed SQL was corrected to use timestamp values and then passed. No partial seed rows from the failed statement were used as evidence.

Result:

- `default_tiku_seed_alignment=pass`.
- `default_tiku_admin_organization_binding=pass`.

## Post-State

| Check                                   | Result                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `admin_role` enum                       | `super_admin`, `ops_admin`, `content_admin`, `org_standard_admin`, `org_advanced_admin` |
| `admin_organization` table present      | yes                                                                                     |
| `admin_organization` total rows         | 2                                                                                       |
| org admin `auth_user` rows              | 2                                                                                       |
| org admin `auth_account` rows           | 2                                                                                       |
| org admin `admin` rows                  | 2                                                                                       |
| org admin `admin_organization` bindings | 2                                                                                       |

Role/binding aggregate:

| Role                 | Active/admin rows | Organization binding rows |
| -------------------- | ----------------: | ------------------------: |
| `org_standard_admin` |                 1 |                         1 |
| `org_advanced_admin` |                 1 |                         1 |
| `super_admin`        |                 1 |                         0 |

## Validation

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md docs/05-execution-logs/evidence/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md docs/05-execution-logs/audits-reviews/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25 -SkipRemoteAheadCheck`: pass.

## Taste Compliance Checklist

- Existing project terminology and role identifiers preserved.
- Existing migration intent reused without modifying source or migration files.
- No dependency, package, Provider, UI, or API changes.
- Evidence is aggregate-only and avoids password hashes, phones, emails, publicId values, raw rows, database URLs, credentials, tokens, cookies, screenshots, and traces.
- No final Standard/Advanced MVP Pass claim.
