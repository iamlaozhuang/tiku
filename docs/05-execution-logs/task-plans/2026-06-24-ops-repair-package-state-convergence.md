# Task Plan: ops-repair-package-state-convergence-2026-06-24

## Task Metadata

- Task id: `ops-repair-package-state-convergence-2026-06-24`.
- Branch: `codex/ops-repair-state-convergence-20260624`.
- Task kind: `docs_state_only`.
- Execution profile: `docs_state_only_ops_repair_package_convergence`.
- Approval source: current user approval on 2026-06-24 to first run a queue/state convergence task, then a separate
  no-final-Pass acceptance gap planning task, with commit, merge, push, and short-branch cleanup after each task.
- Non-claim: this task does not declare standard/advanced MVP final Pass.

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
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Decision Map

- `2026-06-24-role-separated-mvp-requirement-alignment.md` is the active SSOT for the repair package closure labels and
  explicitly keeps strict role-separated runtime acceptance blocked until all 8 role rows pass fresh redacted runtime
  observation.
- `role-experience-fulfillment-matrix.md` records the role-separated runtime addendum and keeps affected role rows in
  `release_blocked` status until runtime evidence closes them.
- `edition-aware-authorization-acceptance-matrix.md` provides the operations authorization acceptance rows for
  `redeem_code`, `org_auth`, manual upgrade, multi-scope bundle direction, employee import, and redacted audit evidence.
- `task-queue-archival-and-index-governance.md` says archive movement requires a separate archive/index task with exact
  candidate ids. This task records `archiveCandidateCount: 56` only and does not move entries.

## Requirement Mapping

- R1/R2/R8 backend workspace separation: closed as implementation repair tasks in the current package, but runtime
  acceptance remains blocked until future redacted role walkthrough evidence.
- R5/R6 learner AI and organization training entries: closed as local implementation repair support, but not final
  role runtime Pass.
- R7 content and organization backend AI entries: closed as discoverable entry repair support, with Provider and formal
  adoption gates still blocked.
- R9/R10/R11/R12/R13/R14/R15 operations authorization package: closed through scoped implementation, docs planning, and
  validation packets; multi-scope remains design/planning until separately approved implementation.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R1/R2/R5/R6/R7/R8/R9/R10/R11/R12/R13/R14/R15 from the role-separated alignment
  and to the operations authorization supplemental scenarios in the edition-aware authorization matrix.
- Role Mapping Result: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`,
  `org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin` remain subject
  to future strict role-separated runtime acceptance; this state-only task only summarizes repair closure.
- Acceptance Mapping Result: queue/state convergence can close as a docs/state-only governance task. Standard/advanced
  MVP final Pass, browser/e2e runtime, Provider, staging/prod, payment, schema/migration/database, dependencies, and
  Cost Calibration remain out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-multi-scope-design.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md`.
- Read-only diagnostics: `Get-TikuProjectStatus.ps1` and `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`.

## Conflict Check

- No conflict was found between the requirement SSOT and the observed queue state.
- The ops repair package can be recorded as closed, but strict role-separated acceptance remains blocked. This task must
  not infer final Pass from local implementation/unit evidence.
- `archiveCandidateCount: 56` is a diagnostic signal only. Archive movement is intentionally blocked in this task
  because archive apply requires exact candidates, archive target files, and a separate archive/index scope.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-repair-package-state-convergence.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-repair-package-state-convergence.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-repair-package-state-convergence.md`.

## Blocked Files And Work

- No product source, tests, e2e, scripts, archive files, task-history index, schema, migration, database, package,
  lockfile, `.env*`, Provider, Cost Calibration, staging/prod/cloud/deploy, payment, external-service, PR, force push,
  browser runtime, or final MVP Pass claim.
- No queue archive movement in this task.
- Evidence must remain redacted and command/status-summary only.

## Implementation Plan

- Register this docs/state-only task in `task-queue.yaml`.
- Update `project-state.yaml` with a compact repair package state convergence block.
- Create task plan, evidence, and audit review.
- Record the closed repair task list, diagnostic archive candidate baseline, and next candidate tasks.
- Validate formatting, diff, project status, queue slimming diagnostic, pre-commit hardening, and pre-push readiness.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-repair-package-state-convergence.md docs/05-execution-logs/evidence/2026-06-24-ops-repair-package-state-convergence.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-repair-package-state-convergence.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-repair-package-state-convergence-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-repair-package-state-convergence-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if validation requires source/test/runtime implementation, queue archive movement, env/secret access, Provider,
  schema/migration/database, dependency or lockfile change, browser/e2e runtime, staging/prod/deploy, payment,
  external service, PR, force push, Cost Calibration, or final acceptance Pass.
