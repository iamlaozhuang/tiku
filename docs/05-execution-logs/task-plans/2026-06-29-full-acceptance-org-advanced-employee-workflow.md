# Full Acceptance Org Advanced Employee Workflow Plan

- Task id: `full-acceptance-org-advanced-employee-workflow-2026-06-29`
- Branch: `codex/org-advanced-employee-workflow-20260629`
- Status: closed_blocked_evidence
- Date: `2026-06-29`

## Goal

Execute a localhost-only owner-facing acceptance check for `org_advanced_employee` enterprise training and learner AI
question/paper generation rows, recording redacted role/route/workflow/status/count evidence only.

## Authorization

This task consumes staged local execution approval:

- Stage A: test-owned local account/session switching for acceptance roles.
- Stage B: localhost-only app-normal non-Provider workflow checks when the UI provides a safe path.
- Existing per-task closeout approval: local commit, fast-forward merge to `master`, push `origin/master`, and short
  branch cleanup after validation.

This task does not consume Stage D direct DB read-only proof, Stage E dependency approval, Provider approval, schema
approval, release readiness, final Pass, PR, force-push, or Cost Calibration approval.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-remaining-coverage-audit.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-standard-employee-boundary-workflow.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Private input allowed after this plan is materialized:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Private input may be used only to enter a test-owned `org_advanced_employee` localhost session. No raw account content,
identifiers, credentials, cookies, tokens, sessions, localStorage, or Authorization headers may be recorded.

## Execution Steps

1. Connect to the in-app browser and verify localhost availability.
2. Establish a test-owned `org_advanced_employee` session using approved local account input. If an existing localhost
   session contaminates role switching, use normal login/session replacement without reading or recording cookie,
   token, session, localStorage, or Authorization-header values.
3. Record the post-login learner route and visible organization/learning/training/AI status counts.
4. Navigate to visible learner AI/training entries when discoverable; direct localhost routes may be used only as
   fallback and must be recorded as such.
5. For learner `AI出题` and `AI组卷`, record only safe control/status counts. Do not submit generation or call Provider.
6. For enterprise training, record assignment/status/progress/empty-state counts. Do not record raw answer or complete
   question content.
7. Run scoped formatting/diff and Module Run v2 gates.
8. Commit, fast-forward merge, push, and cleanup if the task reaches a terminal evidence state.

## Closeout Decision

- Enterprise training row reached scoped pass evidence.
- Employee AI question and AI paper rows reached blocked evidence because the learner detail workflows and required
  controls are missing.
- Repair is split to `repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`; this acceptance task did
  not change source or tests.

## Validation Commands

- `browser_org_advanced_employee_workflow_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-org-advanced-employee-workflow.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29 -SkipRemoteAheadCheck`
