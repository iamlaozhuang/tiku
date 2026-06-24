# Task Plan: role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24

## Task Metadata

- Task id: `role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24`.
- Branch: `codex/post-repair-runtime-rerun-scope-approval-20260624`.
- Task kind: `runtime_scope_approval_package`.
- Execution profile: `docs_runtime_scope_approval_no_runtime`.
- Approval source: current user approval on 2026-06-24 to execute the recommended scope-approval package task.
- Runtime execution: not approved by this task.
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

- The active role-separated requirement decision is
  `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- The role runtime acceptance baseline remains strict: all 8 mandatory rows must pass fresh runtime observation before
  any final Pass can be discussed.
- ADR-007 keeps `edition`, `auth_upgrade`, and `effectiveEdition` decisions in authorization source/service logic, not
  UI-only visibility.
- ADR-004 and ADR-005 keep env/secret, staging/prod, Provider, deployment, payment, and production-like actions blocked.

## Requirement Mapping

- R1/R2/R8: backend role-aware landing, visible logout, workspace separation, and unrelated backend route denial.
- R3/R4/R6/R7: organization standard/advanced admin and employee training/AI entry boundaries.
- R5: personal standard/advanced learner `AI训练` entry and direct-route denial/availability boundary.
- R9/R10/R11/R12/R13/R14/R15: operations `redeem_code`, `org_auth`, manual upgrade, multi-scope authorization, and
  employee import-template acceptance boundaries.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: this package maps R1-R15 to an approved future local runtime observation scope.
- Role Mapping Result: future runtime scope covers `personal_standard_student`, `personal_advanced_student`,
  `org_standard_employee`, `org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, and
  `ops_admin`.
- Acceptance Mapping Result: this task may close only an approval package. Runtime execution, browser/e2e, credential
  entry, account provisioning, source/test/schema/env/Provider work, and final Pass remain out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md`.

## Conflict Check

- No requirement conflict was found.
- The key boundary is freshness: local repair evidence is closed, but post-repair role runtime evidence has not been
  rerun.
- The runtime scope package must not become runtime execution approval. A later explicit approval must name
  `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24` before the actual rerun starts.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval-package.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md`.

## Blocked Files And Work

- No product source, tests, e2e, scripts, archive files, task-history index, schema, migration, database, package,
  lockfile, `.env*`, Provider, Cost Calibration, staging/prod/cloud/deploy, payment, external-service, PR, force push,
  browser runtime, dev server, owner credential entry, account action, seed, or final MVP Pass claim.

## Implementation Plan

- Register this scope-approval task in `task-queue.yaml` and `project-state.yaml`.
- Create the approval package under `docs/05-execution-logs/acceptance/`.
- The package will define the 8 role rows, allowed local targets, credential handling, redaction rules, allowed evidence
  fields, and explicit stop conditions.
- Optionally register the actual runtime rerun successor as blocked until fresh package approval is given.
- Validate formatting, diff, project status, pre-commit hardening, and pre-push readiness.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-post-repair-runtime-rerun-scope-approval-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if the next action would require browser/runtime/e2e execution, owner credential entry, account creation or
  modification, seed, database read/write, schema, migration, source/test/script edits, dependency or lockfile change,
  env/secret, Provider, staging/prod/deploy, payment, external service, PR, force push, Cost Calibration, or final
  acceptance Pass.
