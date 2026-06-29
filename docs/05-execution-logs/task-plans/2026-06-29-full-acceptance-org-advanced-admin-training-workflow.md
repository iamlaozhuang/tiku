# Full Acceptance Org Advanced Admin Training Workflow Plan

- Task id: `full-acceptance-org-advanced-admin-training-workflow-2026-06-29`
- Branch: `codex/org-advanced-training-workflow-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Execute a localhost-only owner-facing acceptance check for `org_advanced_admin.organization_training`, recording
redacted role/route/workflow/status/count evidence only.

## Authorization

This task consumes staged local execution approval:

- Stage A: test-owned local account/session switching for acceptance roles.
- Stage B: localhost-only UI/API mutation for test-owned acceptance data needed to verify workflow rows.
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
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Private input allowed after this plan is materialized:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Private input may be used only to enter or bootstrap a test-owned `org_advanced_admin` localhost session. No raw account
content, identifiers, credentials, cookies, tokens, sessions, localStorage, or Authorization headers may be recorded.

Safe local acceptance session bootstrap files may be read only to confirm the already-approved localhost request shape:
`src/app/api/v1/local-acceptance-sessions/route.ts`, `src/app/api/v1/sessions/route.ts`,
`src/server/services/local-acceptance-session-service.ts`, and `tests/unit/local-acceptance-session-bootstrap.test.ts`.
These source/test files remain blocked for edits in this task.

## Execution Steps

1. Connect to the in-app browser and verify localhost availability.
2. Establish a test-owned `org_advanced_admin` session using approved local account input or safe local session switching.
   If an existing localhost session contaminates role switching, clear only localhost browser session state without
   reading or recording cookie, token, session, localStorage, or Authorization-header values.
3. Navigate through organization workspace to organization training if discoverable; direct route may be used only as a
   fallback and must be recorded as such.
4. Record redacted counts/status for organization context, training list/status/empty states, scope labels, action
   affordances, and forbidden marker absence.
5. If the page offers safe app-normal draft/create/update/delete cleanup, execute only the minimal workflow required to
   prove it and record status/count summaries. If no safe path exists, record blocked/unsupported without forcing it.
6. Run scoped formatting/diff and Module Run v2 gates.
7. Commit, fast-forward merge, push, and cleanup if the task reaches a terminal evidence state.

## Validation Commands

- `browser_org_advanced_admin_training_workflow_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-org-advanced-admin-training-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-org-advanced-admin-training-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-org-advanced-admin-training-workflow-2026-06-29 -SkipRemoteAheadCheck`
