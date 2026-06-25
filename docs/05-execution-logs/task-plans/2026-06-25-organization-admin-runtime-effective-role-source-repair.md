# Task Plan: organization-admin-runtime-effective-role-source-repair-2026-06-25

## Task

- Task id: `organization-admin-runtime-effective-role-source-repair-2026-06-25`.
- Branch: `codex/org-admin-effective-role-source-repair-20260625`.
- Entry head: `5f15f8279a3bcd77384dc9c3747f29ad325de491`.
- Scope: runtime role/session source tests plus `local-session-runtime` role and organization binding repair.
- Closeout approval: current user fresh approval for local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup.

## Required Reads

- `AGENTS.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.

## Requirement / Role / Acceptance Mapping

| Role                 | Required behavior                                                                                                                         | Source boundary under repair                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `org_standard_admin` | Login/current session must expose `adminRoles: ["org_standard_admin"]`, land in organization workspace, and not be treated as global ops. | `local-session-runtime` default admin login and active-session account lookup.     |
| `org_advanced_admin` | Login/current session must expose `adminRoles: ["org_advanced_admin"]`, organization workspace access, and advanced organization entries. | Same default admin lookup path.                                                    |
| Organization scope   | Org admin session should carry a defensible `organizationPublicId` when `admin_organization` binds the admin to an organization.          | `admin_organization -> organization.public_id` hydration in local session runtime. |

This task does not prove real private account rows or browser runtime acceptance. DB inspection, seed execution/mutation, and browser rerun remain separate approval-gated tasks.

## Implementation Plan

1. Add focused red tests in `src/server/auth/local-session-runtime.test.ts` that exercise the default database-backed admin paths, not only injected repositories.
2. Cover both login response and GET current-session hydration for organization admin accounts.
3. Repair `src/server/auth/local-session-runtime.ts` so admin account queries join `admin_organization` and `organization`, then map organization admin roles to `organization_public_id`.
4. Keep `super_admin`, `ops_admin`, and `content_admin` from gaining organization scope merely because an `admin_organization` row exists.
5. Run red/green focused unit validation, then lint/typecheck/diff/pre-commit/pre-push gates.
6. Record evidence and audit, mark task ready/closed, then commit, fast-forward merge to `master`, push, and delete the short branch.

## Allowed Files

- `src/server/auth/local-session-runtime.ts`.
- `src/server/auth/local-session-runtime.test.ts`.
- `src/server/contracts/user-auth/session-boundary.test.ts` if an existing boundary assertion needs tightening.
- `tests/unit/admin-dashboard-layout-navigation.test.ts` if an existing guard assertion needs tightening.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.

## Blocked

- `.env*`, private account files, credential documents, credential entry by Codex, direct DB connection or row inspection, schema/migration, seed execution or mutation, package/lockfile changes, `e2e/**`, dev server, browser runtime rerun, Provider, Cost Calibration, staging/prod/deploy, payment/external service, PR/force push, and final MVP Pass claim.

## Validation Commands

- Red test: `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts`.
- Green focused test: `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npx.cmd prettier --check --ignore-unknown src/server/auth/local-session-runtime.ts src/server/auth/local-session-runtime.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-repair.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-2026-06-25`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-2026-06-25 -SkipRemoteAheadCheck`.

## Risk Controls

- Keep all tests local unit tests with fake query-chain objects; do not connect to a real database.
- Do not alter schema or seed source in this task.
- Do not change UI guards unless the runtime tests prove a contract gap outside `local-session-runtime`.
- Evidence records command names, pass/fail, and summarized assertions only; no credentials, tokens, DB URLs, row dumps, or screenshots.
