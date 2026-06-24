# Task Plan: role-separated-mvp-post-repair-gap-planning-2026-06-24

## Task Metadata

- Task id: `role-separated-mvp-post-repair-gap-planning-2026-06-24`.
- Branch: `codex/role-separated-post-repair-gap-planning-20260624`.
- Task kind: `acceptance_gap_planning`.
- Execution profile: `docs_acceptance_gap_planning_no_runtime`.
- Approval source: current user approval on 2026-06-24 to run this task after the state convergence task.
- Non-claim: this task must not declare standard/advanced MVP final Pass.

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
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Decision Map

- The 2026-06-24 role-separated alignment is the active requirement decision for R1-R15.
- The role-experience matrix keeps the strict role-separated runtime gate blocked until all 8 rows pass fresh runtime
  observation.
- The edition-aware authorization matrix governs `redeem_code`, `org_auth`, `auth_upgrade`, employee import, redacted
  audit, and multi-scope authorization acceptance.
- ADR-007 keeps `edition` source-of-truth and `effectiveEdition` computation out of UI-only state.
- ADR-004 and ADR-005 keep env/secret, staging/prod, Provider, deployment, payment, and production-like data work
  blocked without fresh approval.

## Requirement Mapping

- R1/R2/R8: backend role landing, logout, workspace separation, and unrelated route denial.
- R5/R6: learner `AI训练` and employee `企业训练` discoverability and standard denial.
- R7/R4: content backend and organization backend `AI出题`/`AI组卷` discoverability and formal-content separation.
- R9/R10/R11/R12/R13/R14/R15: operations `redeem_code`, `org_auth`, manual upgrade, multi-scope authorization, employee
  import template, and inherited scope boundaries.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R1-R15 and the edition-aware authorization supplemental acceptance rows.
- Role Mapping Result: maps to `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`,
  `org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.
- Acceptance Mapping Result: planning may close only a gap list. Runtime acceptance, browser/e2e, owner credentials,
  Provider, staging/prod, payment, schema/migration/database, dependencies, Cost Calibration, and final Pass are out of
  scope.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-repair-package-state-convergence.md`.

## Conflict Check

- No requirement conflict was found.
- The key distinction is evidence freshness: local implementation/unit evidence closed repair packets, while strict
  runtime role acceptance remains unexecuted after those repairs. This task records that as a gap instead of claiming
  final Pass.
- Manual `org_auth` upgrade and multi-scope authorization have planning/design evidence, but full runtime
  implementation likely requires source/schema/API work and fresh approvals before acceptance.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-mvp-post-repair-gap-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-mvp-post-repair-gap-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-mvp-post-repair-gap-planning.md`.

## Blocked Files And Work

- No product source, tests, e2e, scripts, archive files, task-history index, schema, migration, database, package,
  lockfile, `.env*`, Provider, Cost Calibration, staging/prod/cloud/deploy, payment, external-service, PR, force push,
  browser runtime, owner credential entry, account action, or final MVP Pass claim.

## Implementation Plan

- Register this planning task in `task-queue.yaml` and `project-state.yaml`.
- Create a post-repair gap analysis under `docs/05-execution-logs/acceptance/`.
- Classify gaps as repaired-but-unaccepted, still-required implementation/design, or fresh-approval-needed.
- Record the recommended next serial tasks without starting runtime work.
- Validate formatting, diff, project status, pre-commit hardening, and pre-push readiness.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md docs/05-execution-logs/task-plans/2026-06-24-role-separated-mvp-post-repair-gap-planning.md docs/05-execution-logs/evidence/2026-06-24-role-separated-mvp-post-repair-gap-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-mvp-post-repair-gap-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-mvp-post-repair-gap-planning-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-mvp-post-repair-gap-planning-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if the next step requires runtime browser/e2e, owner credentials, account creation or modification, schema,
  migration, database write, dependency or lockfile change, env/secret, Provider, staging/prod/deploy, payment,
  external service, PR, force push, Cost Calibration, or final acceptance Pass.
