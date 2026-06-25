# Task Plan: organization-admin-runtime-effective-role-source-repair-planning-2026-06-24

## Task Metadata

- Task id: `organization-admin-runtime-effective-role-source-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-effective-role-source-planning-20260625`.
- Task kind: `docs_state_only_runtime_role_source_diagnosis`.
- Execution profile: `read_only_source_diagnosis_no_source_no_runtime_no_db`.
- Entry date: `2026-06-25`.
- Entry Git state: `master` and `origin/master` were aligned at `c5a418e59b853f187f48a0f8d12c1ccbc01c9940`; working tree was clean before branch creation.
- Queue diagnostic at entry: `Get-TikuProjectStatus.ps1` reported `projectStatusDecision: idle_no_pending_task` and `nextExecutableTask: none`. Current user instruction provides the explicit low-risk diagnostic task scope; this plan records the mismatch instead of inferring final Pass or executing high-risk work.

## Goal

Identify, from durable evidence and source read-only tracing, which runtime role source still makes real `org_standard_admin` and `org_advanced_admin` sessions behave like global `ops_admin`, and define the next minimal repair task scope.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- ADR-002 requires runtime boundaries to keep route handlers thin and place business rules in service/repository/model layers.
- ADR-007 requires source authorization data and service-computed `effectiveEdition`; UI visibility is not an authorization boundary.
- Role-separated MVP alignment requires `org_standard_admin` and `org_advanced_admin` to land in a first-class `organization` workspace and be denied from unrelated global `ops` and `content` workspaces.
- Organization AI/training requirements require `org_standard_admin` to be standard-only and `org_advanced_admin` to receive organization training and organization `AI出题`/`AI组卷` entries only inside scoped organization workspace.

## Requirement Mapping

- User auth/session: trace login session payload, session service, cookie/local marker use, and logout repair boundary without reading credentials or browser storage values.
- Organization admin workspace: trace landing redirect and workspace guards to identify which role field they trust.
- Admin ops separation: trace `ops` guard separately and compare its trusted role source to the organization guard.
- Edition/authorization: distinguish admin role source from `effectiveEdition`; do not treat UI menu visibility as an authorization boundary.
- Acceptance: produce a root-cause hypothesis matrix, not a runtime Pass claim.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- Earlier role persistence, local DB runtime, session role mapping, and workspace runtime rerun evidence may be read only to reconstruct the repair history. They do not replace requirement SSOT.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.

## Read-Only Source Scope

- `src/app/(auth)/login/page.tsx`.
- `src/app/api/v1/sessions/route.ts`.
- `src/server/auth/session-route.ts`.
- `src/server/auth/session-cookie.ts`.
- `src/server/auth/local-session-runtime.ts`.
- `src/server/services/session-service.ts`.
- `src/server/repositories/session-repository.ts`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/server/contracts/auth-contract.ts`.
- `src/server/models/auth.ts`.
- `src/server/mappers/auth-mapper.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/organization/**`.
- `src/features/ops/**`.
- `src/features/content/**`.
- Focused unit tests may be read for existing behavior, but not modified.

## Blocked Scope

- No `.env*`, credentials, private account files, browser storage/cookies, database rows, or secret material.
- No database connection, migration, seed execution, schema edit, dev seed edit, or fixture mutation.
- No source, test, e2e, script, dependency, package, lockfile, Provider, Cost Calibration, staging/prod, payment, external-service, PR, force-push, or final Pass work.
- No dev server start and no browser/runtime rerun in this task.

## Investigation Steps

1. Confirm queue/state reality and record that the named planning task was not a pending queue entry at task entry.
2. Trace login submit, session creation, current session lookup, and admin account role mapping.
3. Trace landing redirect logic and identify the role field that decides `/ops/users` versus `/organization/portal`.
4. Trace `organization` workspace guard and `ops` workspace guard independently.
5. Compare runtime-visible failure facts against source role fields, including `adminRole`, session role, account type, workspace role, and `organization` binding.
6. Build a root-cause hypothesis matrix with `confirmed`, `pending`, and `excluded` states.
7. Recommend the next minimal repair task, allowed files, red tests, and validation commands.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-planning-2026-06-24`

## Conflict Check

- There is no requirement conflict: all SSOT sources require organization admins to use a scoped organization workspace and be denied from global operations.
- There is a mechanism fact conflict at entry: durable state expected this next task, but task queue did not contain a pending task and project status reported no executable task. This task will record that fact and avoid running a high-risk successor.
- Historical evidence shows logout/session invalidation improved, but the effective runtime role source remains wrong. This task must not continue UI-only repair without source-of-truth diagnosis.
