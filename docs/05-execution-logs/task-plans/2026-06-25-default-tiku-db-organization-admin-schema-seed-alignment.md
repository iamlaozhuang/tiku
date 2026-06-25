# Task Plan: default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25

## Task Boundary

- Task id: `default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25`.
- Branch: `codex/default-tiku-db-schema-seed-align-20260625`.
- Approval source: current user serial approval on 2026-06-25 for task 3 schema/migration/seed.
- Scope: local Docker default `tiku` DB only. Align the missing organization admin role enum values, `admin_organization` schema, and minimal local dev org admin seed rows.
- Not approved: `.env*` reads/edits, staging/prod/cloud DB, destructive reset/drop/truncate, broad data rewrites, dependency changes, Provider, payment, external services, PR/force push, or final MVP Pass.

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

## Execution Plan

1. Record default `tiku` DB pre-state using aggregate/schema checks only.
2. Apply non-destructive schema alignment to default `tiku`:
   - Add org admin enum values if missing.
   - Create `admin_organization` if missing using existing migration structure.
3. Apply minimal targeted seed alignment:
   - Ensure the existing local organization row is available.
   - Upsert the two local dev org admin auth/admin rows and auth accounts.
   - Insert organization bindings for those two rows.
4. Record post-state aggregate.
5. Validate docs/state/evidence gates, commit, merge, push, and cleanup.

## Implementation Notes

- `drizzle.config.ts`, `drizzle-kit migrate`, and `scripts/db/Seed-DevDatabase.ps1` are not used because they read `.env.local`.
- SQL is executed through local Docker `psql` against database name `tiku`; no database URL is printed or recorded.
- Seed evidence must not record password hashes, phones, emails, publicId values, or raw rows.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`.
- `docs/05-execution-logs/evidence/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md docs/05-execution-logs/evidence/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md docs/05-execution-logs/audits-reviews/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId default-tiku-db-organization-admin-schema-seed-alignment-2026-06-25 -SkipRemoteAheadCheck`
