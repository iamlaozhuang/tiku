# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration

## Scope

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration`
- Branch: `codex/advanced-organization-training-admin-organization-schema`
- Task kind: schema migration.
- User approval: explicit approval in the current thread to execute the recommended schema task.
- Baseline: `master == origin/master == eecc06f4b33d1b5cdfb428372a4a7f65c6d780a6`.
- Goal: add the schema-backed `admin_organization` assignment source for organization-admin visible organization scope.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision.md`
- `docs/05-execution-logs/evidence/2026-06-16-module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-schema-migration-capability-state-normalization-admin-organization-scope.md`
- `src/db/schema/auth.ts`
- `src/db/schema/auth.test.ts`
- `src/server/models/auth.ts`
- Latest migration style under `drizzle/`.

## Capability Gate

- `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration -Capability schemaMigration -Intent use_capability`
- Result before edits: `capability_ready`.
- The gate's adapter action is `schema_migration_plan_ready_no_execution`; this task must not execute real DB commands, migration execution, or `drizzle-kit push`.

## Implementation Plan

1. Write a failing schema test in `src/db/schema/auth.test.ts` for the `admin_organization` assignment source:
   - table name `admin_organization`;
   - columns `id`, `admin_id`, `organization_id`, `created_at`;
   - uniqueness on `(admin_id, organization_id)`;
   - indexes `idx_admin_organization_admin_id` and `idx_admin_organization_organization_id`.
2. Run `npm.cmd run test:unit -- src/db/schema/auth.test.ts` and record RED.
3. Add `adminOrganization` to `src/db/schema/auth.ts` using existing schema helpers and relations.
4. Export `AdminOrganizationRow` and `NewAdminOrganizationRow` from `src/server/models/auth.ts`.
5. Add a reviewed migration SQL file under `drizzle/` for the table and constraints. Do not execute the migration.
6. Re-run the focused unit test and full declared validation commands.
7. Write evidence and audit review, then run Module Run v2 closeout gates.

## Migration Plan

- Add table `admin_organization`.
- Columns:
  - `id` bigint generated identity primary key;
  - `admin_id` bigint not null, FK to `admin.id`, `ON DELETE CASCADE`;
  - `organization_id` bigint not null, FK to `organization.id`, `ON DELETE RESTRICT`;
  - `created_at` timestamp with time zone default now not null.
- Indexes:
  - `udx_admin_organization_admin_id_organization_id`;
  - `idx_admin_organization_admin_id`;
  - `idx_admin_organization_organization_id`.
- Recovery boundary: if a later approved migration rehearsal finds a problem, the local reviewed recovery is to drop
  `admin_organization` and its indexes/constraints before any repository/runtime task depends on it. No DB action is
  executed in this task.

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution, migration execution, `drizzle-kit push`, destructive data operation, row/private data access, provider/model call, dependency/package/lockfile change, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate.
- No route/service/repository/API runtime/contract/mapper/validator/UI changes.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration -Capability schemaMigration -Intent use_capability
npm.cmd run test:unit -- src/db/schema/auth.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration
```
