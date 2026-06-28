# Active Queue Slimming Archive After Organization Workspace UX

## Task

- Task id: `active-queue-slimming-archive-after-organization-workspace-ux-2026-06-28`
- Branch: `codex/queue-slimming-archive-org-ux-20260628`
- Task kind: `mechanism_docs_state_queue_archive`
- Execution profile: `docs_state_archive_index_apply`
- Approval source: current user approval on 2026-06-28 for serial batch item 1 with commit, merge, push, and cleanup after each task.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

## Requirement Decision Map

- This is a docs/state archive task. It does not change product requirements or runtime behavior.
- `docs/01-requirements/00-index.md` and `unified-standard-advanced-source-index.md` are read to preserve the standard/advanced blocked-gate boundary.
- `task-queue-archival-and-index-governance.md` is the controlling SOP for moving terminal task blocks.
- ADR-004, ADR-005, ADR-006, and ADR-007 keep environment, staging, dependency, Provider, `authorization`, quota, and Cost Calibration boundaries blocked.

## Requirement Mapping

- Mapping result: `governance_only_queue_archive`.
- Runtime claims: none.
- Local validation ladder: L0 docs/state governance only.
- The task may improve recovery by reducing active queue size and updating the history index. It must not claim that organization workspace UX, `authorization`, Provider, staging, prod, payment, OCR, export, or Cost Calibration work became release-ready.

## Evidence-Only Sources

- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- Existing task plan, evidence, and audit paths referenced by the moved task entries.

These are read as recovery and validation evidence, not as requirement SSOT.

## Conflict Check

- No conflict between requirement SSOT and archive SOP was found.
- The queue slimming diagnostic reported 17 archive candidates because `project-state.yaml` still pointed at the previous terminal browser-validation task.
- This task will move 19 old terminal task blocks so that, after this task closes and becomes the current recovery pointer, the active queue keeps a terminal recovery window of 8 tasks: 7 retained old terminal tasks plus this task.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-28-active-queue-slimming-archive-after-organization-workspace-ux.md`
- `docs/05-execution-logs/evidence/2026-06-28-active-queue-slimming-archive-after-organization-workspace-ux.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-active-queue-slimming-archive-after-organization-workspace-ux.md`
- `docs/05-execution-logs/acceptance/2026-06-28-active-queue-slimming-archive-after-organization-workspace-ux.md`

Blocked files and actions:

- `src/**`, `tests/**`, `e2e/**`
- schema, drizzle, migration, seed
- `package.json`, lockfiles, `.env*`
- browser, dev server, e2e, DB connection or mutation
- Provider call or configuration
- Cost Calibration
- staging, prod, deploy, payment, OCR, export, external service
- PR, force push, release readiness, final Pass

## Planned Archive Movement

Archive path: `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`

Index path: `docs/04-agent-system/state/task-history-index.yaml`

Task blocks to move from active queue to archive:

1. `standard-advanced-backend-ux-design-first-contract-2026-06-27`
2. `backend-workspace-shell-source-only-2026-06-27`
3. `content-ops-organization-nav-entry-source-only-2026-06-27`
4. `backend-workspace-role-guard-contract-tdd-2026-06-27`
5. `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`
6. `standard-advanced-backend-role-browser-validation-2026-06-27`
7. `standard-advanced-next-ux-polish-queue-planning-2026-06-28`
8. `organization-workspace-state-polish-source-only-2026-06-28`
9. `organization-workspace-polish-permission-contract-tdd-2026-06-28`
10. `organization-workspace-polish-local-browser-validation-2026-06-28`
11. `standard-advanced-ux-polish-queue-planning-2026-06-28`
12. `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`
13. `organization-workspace-page-states-polish-source-only-2026-06-28`
14. `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`
15. `organization-workspace-ux-polish-local-browser-validation-2026-06-28`
16. `standard-advanced-edition-experience-optimization-planning-2026-06-27`
17. `archive-staging-infrastructure-readiness-planning-2026-06-27`
18. `residual-active-queue-archive-index-cleanup-after-staging-infra-planning-2026-06-27`
19. `acceptance-role-separated-account-local-account-runtime-rerun-scope-approval-2026-06-23`

Retained old terminal recovery window:

- `acceptance-role-separated-account-local-account-runtime-rerun-2026-06-23`
- `learner-org-employee-home-entry-capability-discovery-repair-2026-06-25`
- `learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25`
- `learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`
- `learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25`
- `role-separated-mvp-requirement-alignment-2026-06-24`
- `active-queue-slimming-archive-apply-2026-06-27`

## Implementation Approach

1. Add this task plan before state edits.
2. Add a task entry with task-level closeout policy to `task-queue.yaml`.
3. Move the 19 terminal task blocks to the June archive without semantic edits.
4. Add history index entries for all moved task ids.
5. Update project state current task and archive metadata for recovery.
6. Write evidence, audit review, and acceptance summary.
7. Run scoped formatting and mechanism gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch under the user's fresh serial closeout approval.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-archive-after-organization-workspace-ux-2026-06-28`
- Closeout on `master`: `git diff --check`, `Test-GitCompletionReadiness.ps1 -BaseBranch master`, `Test-AgentSystemReadiness.ps1`, `Get-TikuProjectStatus.ps1`

## Risk Defenses

- Preserve archived task blocks exactly except for relocation.
- Do not archive non-terminal tasks.
- Do not archive a task without an existing evidence path and audit path.
- Ensure active non-terminal task dependencies remain resolvable through active queue or history index.
- Keep evidence redacted and summary-only.
- Keep Cost Calibration Gate blocked.

## Stop Conditions

Stop before commit if:

- any moved task id is ambiguous;
- a required evidence or audit path is missing;
- active dependencies become unresolvable;
- changed files exceed allowed scope;
- validation fails without a clear docs-only fix;
- any blocked gate action becomes necessary.
