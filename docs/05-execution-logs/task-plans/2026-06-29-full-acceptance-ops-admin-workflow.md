# Full Acceptance Ops Admin Workflow Plan

- Task id: `full-acceptance-ops-admin-workflow-2026-06-29`
- Branch: `codex/full-acceptance-ops-admin-workflow-20260629`
- Plan status: executed_with_partial_followup
- Date: `2026-06-29`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` only for test-owned `ops_admin`
  login input, with no credential evidence.

## Execution Plan

1. Confirm local app availability on `localhost` or `127.0.0.1`.
2. Establish a test-owned `ops_admin` session without recording credentials or session material.
3. Verify operations workspace discoverability and route access.
4. Verify user, organization, employee, `org_auth`, import, `redeem_code`, resource/knowledge, audit log, and AI call log
   surfaces by visible labels/status/counts only.
5. Verify denial/unavailable boundaries for content authoring, organization training, organization analytics,
   organization AI generation, Provider config, Cost Calibration, payment, deploy, OCR/export, and external services.
6. Record redacted evidence and any blocker/follow-up task.
7. Run scoped formatting, diff, Module Run v2 precommit, closeout, and prepush gates before closeout.

## Execution Result

- Browser/account/runtime evidence was recorded as redacted route/workflow/status/count summaries only.
- `ops_admin.employee_import` remains partial because the observed import action stayed disabled after the safe route/detail
  probe.
- Follow-up task candidate: `fix-ops-admin-employee-import-entry-state-2026-06-29`.

## Validation Commands

- `browser_ops_admin_workflow_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-ops-admin-workflow.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-ops-admin-workflow.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-ops-admin-workflow.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-ops-admin-workflow.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-ops-admin-workflow.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-ops-admin-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-ops-admin-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-ops-admin-workflow-2026-06-29 -SkipRemoteAheadCheck`
