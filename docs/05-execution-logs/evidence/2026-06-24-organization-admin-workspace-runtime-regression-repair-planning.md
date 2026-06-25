# Evidence: organization-admin-workspace-runtime-regression-repair-planning-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-regression-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-runtime-regression-planning-20260625`.
- Task kind: `docs_requirement_alignment`.
- Product closure contribution: `organization`.
- Scope: plan the regression repair after both organization-admin runtime rows failed.
- Product source/test changes: none.
- Browser/runtime execution: none.
- Final MVP Pass claim: none.

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
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Mapping Result

- Result: `pass_regression_repair_plan_prepared_no_source_no_runtime_no_final_pass`.
- The plan maps the failed organization-admin rows to R1/R2/R3/R4 in the role-separated alignment.
- The plan rejects another UI-only repair path and requires a real session/account mapping reproduction before source
  repair.
- Final MVP Pass remains blocked.

## Role Mapping Result

| Role row             | Latest runtime result | Planning conclusion                                                                                           |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | fail                  | Must be separated from global ops at the real session/account source before organization UI can pass.         |
| `org_advanced_admin` | fail                  | Must be separated from global ops and must prove advanced organization entries after real role mapping works. |
| `ops_admin`          | n/a in this task      | Must stay global operations only and cannot be reused as organization admin proof.                            |
| `content_admin`      | n/a in this task      | Keep as unrelated-workspace denial regression guard.                                                          |

## Acceptance Mapping Result

- Planning acceptance: pass.
- Source/runtime acceptance: not executed.
- Chinese UI acceptance: carried forward as a mandatory later rerun check.
- No final Pass.

## Diagnostic Evidence

- Runtime rerun evidence shows both organization admin rows landed in or could access global operations surfaces and were
  denied from organization workspace routes.
- `src/server/contracts/user-auth/session-boundary.ts` already routes mocked organization roles to `/organization/portal`,
  so post-login routing alone is not the likely root cause.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` already treats `ops`, `content`, and `organization` as
  separate workspaces when the session contains the expected role strings.
- `tests/unit/student-login-ui.test.ts` and `tests/unit/admin-dashboard-layout-navigation.test.ts` cover mocked
  `org_standard_admin` and `org_advanced_admin`, but do not prove persisted local accounts return those roles.
- `src/db/schema/auth.ts`, `src/server/models/auth.ts`, and `drizzle/0000_nebulous_sugar_man.sql` define `admin_role`
  with `super_admin`, `ops_admin`, and `content_admin` only.
- `src/db/dev-seed.ts` seeds one `super_admin` and no role-separated organization admin accounts.
- The 2026-06-23 runtime audit already recorded that enterprise admin rows use `ops_admin` plus organization linkage
  because there is no first-class organization-admin enum.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.

## Validation Results

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`
   - Result: pass.
   - Output summary: scoped docs/state files formatted; state/queue unchanged, markdown planning files normalized.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`
   - Result: pass.
   - Output summary: `All matched files use Prettier code style!`.
3. `git diff --check`
   - Result: pass.
   - Output summary: no whitespace errors.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-regression-repair-planning-2026-06-24`
   - Result: pass.
   - Output summary: `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, all 6 changed files in task scope;
     pre-commit hardening passed.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-regression-repair-planning-2026-06-24 -SkipRemoteAheadCheck`
   - Result: pass.
   - Output summary: `OK_GIT_COMPLETION_READINESS`; evidence and audit paths present; pre-push readiness passed.

## Blocked Scope Confirmation

- Product source/test/e2e/script changes were not made.
- Schema, migration, dev seed, database read/write, account mutation, dev-server start, browser runtime, credential
  handling, `.env*`, dependency, Provider/model/cost, staging/prod/deploy, payment, external services, PR, force push,
  Cost Calibration Gate, and final Pass remain blocked.

## Next Step

- Recommended next task: `organization-admin-workspace-runtime-regression-repair-2026-06-24`.
- The next task must independently create a source repair plan and must stop for fresh approval if it needs
  `admin_role` enum expansion, Drizzle migration, dev seed mutation, or account mutation.
