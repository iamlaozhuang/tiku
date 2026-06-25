# Task Plan: organization-admin-role-persistence-schema-seed-approval-2026-06-24

## Task Metadata

- Task id: `organization-admin-role-persistence-schema-seed-approval-2026-06-24`.
- Branch: `codex/org-admin-role-persistence-schema-seed-20260625`.
- Task kind: `implementation_schema_migration_seed`.
- Product closure contribution: `organization`.
- Approval consumed: current user approved Track B scope on 2026-06-25.
- Fresh approval boundary: `src/db/schema/auth.ts`, Drizzle migration, necessary `src/server/models/auth.ts` type
  propagation, local dev seed / role account fixture updates, focused tests, local commit, fast-forward merge to
  `master`, push to `origin/master`, and short-branch cleanup.
- Final Pass claim: blocked.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- ADR-002: runtime source must flow through model/repository/service boundaries, not UI-only role strings.
- ADR-004/ADR-005: dev/staging/prod remain isolated; this task creates migration files but does not run staging/prod or
  destructive database work.
- ADR-007: authorization and role-derived capability checks must be source-of-truth driven; UI visibility is not an
  authorization boundary.
- `2026-06-24-role-separated-mvp-requirement-alignment`: `org_standard_admin` and `org_advanced_admin` are first-class
  role rows and cannot be proven by reusing `ops_admin`.
- `role-experience-fulfillment-matrix`: both organization admin rows remain release-blocked until real session/account
  mapping can carry the required roles.

## Requirement Mapping

| Requirement                             | Mapping in this task                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R1/R2 backend workspace separation      | Persisted admin role enum must represent organization admins before routing can land them in the organization workspace. |
| R3 standard organization admin boundary | `org_standard_admin` must be a real account/session role for employee and auth-status-only runtime proof.                |
| R4 advanced organization admin boundary | `org_advanced_admin` must be a real account/session role for enterprise training and organization AI entry proof.        |
| Edition-aware authorization             | Local seed must keep organization authorization source data separate from admin role identity.                           |

## Role Mapping Result

| Role row             | Required source fact                                                           | Planned proof                                       |
| -------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `org_standard_admin` | Drizzle enum, model type, and local seed can persist and emit this admin role. | Focused enum/model test plus dev seed fixture test. |
| `org_advanced_admin` | Drizzle enum, model type, and local seed can persist and emit this admin role. | Focused enum/model test plus dev seed fixture test. |
| `ops_admin`          | Remains global operations; not a substitute for organization admins.           | Existing role remains in enum and model tests.      |

## Acceptance Mapping Result

- Scope acceptance: pass only when schema enum, migration metadata, model tests, and local seed fixtures can represent the
  two organization admin roles.
- Runtime acceptance: not executed by this task; later owner-entered credential runtime rerun remains required.
- Chinese UI acceptance: not executed by this task; later runtime rerun must include visible Chinese UI checks.
- Final standard/advanced MVP Pass: explicitly not claimed.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.

## Conflict Check

- No conflict found between requirement SSOT and red-test evidence.
- Source-only repair is insufficient because `admin_role` cannot currently persist `org_standard_admin` or
  `org_advanced_admin`.
- Drizzle default config reads `.env.local`; this task will not run any command that requires reading or recording env
  secrets. If explicit-flag `drizzle-kit generate` cannot run without config/env access, create a reviewed minimal
  migration file and metadata instead, and record the limitation in evidence.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `src/db/schema/auth.ts`.
- `src/db/schema/auth.test.ts`.
- `src/server/models/auth.ts`.
- `src/server/models/auth.test.ts`.
- `src/db/dev-seed.ts`.
- `src/db/dev-seed.test.ts`.
- `drizzle/20260625030100_add_organization_admin_roles.sql`.
- `drizzle/meta/_journal.json`.
- `drizzle/meta/20260625030100_snapshot.json`.

## Blocked Files And Actions

- `.env*`, package files, lockfiles, Provider configuration, staging/prod/cloud/deploy, payment, external services, PR,
  force push, and Cost Calibration Gate are blocked.
- `drizzle-kit push`, destructive database operations, and actual database migration execution are blocked in this task.
- Browser runtime, dev-server startup, credential entry, credential document reads, and final acceptance Pass are blocked.

## Implementation Approach

1. RED: update focused enum/model tests so `adminRoleValues` must include `org_standard_admin` and
   `org_advanced_admin`; run the focused test and record the expected failure if the enum is still unchanged.
2. GREEN schema/model: add the two role values to `src/db/schema/auth.ts`; let `src/server/models/auth.ts` propagate via
   the existing exported tuple type unless compile evidence proves a direct edit is needed.
3. Migration: add a reviewed enum-value migration and Drizzle metadata snapshot for the new admin roles.
4. Seed fixture: extend local dev seed with deterministic standard and advanced organization admin accounts and
   idempotent `admin_organization` bindings, without running seed or database writes.
5. Validation: run focused model/schema/seed tests, then lint, typecheck, scoped Prettier, `git diff --check`,
   pre-commit hardening, and pre-push readiness.

## Risk Defenses

- Keep role persistence change minimal: enum values only, no new permission service semantics.
- Keep organization authorization source data separate from admin role identity.
- Evidence must redact credential values, password hashes, raw DB rows, tokens, `.env` content, Provider payloads,
  plaintext `redeem_code`, and browser/session artifacts.
- If broad tests expose unrelated failures, record them as residual risk only after focused tests pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/models/auth.test.ts`
- `npm.cmd run test:unit -- src/db/schema/auth.test.ts src/db/dev-seed.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md src/db/schema/auth.ts src/db/schema/auth.test.ts src/server/models/auth.ts src/server/models/auth.test.ts src/db/dev-seed.ts src/db/dev-seed.test.ts drizzle/meta/_journal.json drizzle/meta/20260625030100_snapshot.json`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-role-persistence-schema-seed-approval-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-role-persistence-schema-seed-approval-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if implementation requires `.env*`, database connection, seed execution, destructive operation, Provider,
  dependency, staging/prod, payment, external service, PR, force push, or Cost Calibration work.
- Stop if changed files exceed allowed scope.
- Stop if focused tests fail for reasons unrelated to the planned red/green change after three attempts.
