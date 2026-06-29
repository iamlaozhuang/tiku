# Fix Ops Admin Employee Import Entry State Plan

- Task id: `fix-ops-admin-employee-import-entry-state-2026-06-29`
- Branch: `codex/fix-ops-admin-employee-import-entry-state-20260629`
- Plan status: executed_no_source_change
- Date: `2026-06-29`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-ops-admin-workflow.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` only if a test-owned `ops_admin`
  session is required; no credential evidence.

## Execution Plan

1. Confirm local browser session or establish a test-owned `ops_admin` session without recording sensitive material.
2. Reproduce the employee import entry state using localhost only and aggregate counts only.
3. If the workflow is reachable through an existing precondition, record the required upload/status counts and close with
   no source change.
4. If the workflow remains disabled or undiscoverable, inspect existing ops organization/employee import code and add the
   smallest source/test repair that follows current patterns.
5. Run focused unit validation and redacted browser verification.
6. Record evidence, audit, acceptance, and closeout without claiming release readiness, final Pass, Provider readiness, or
   Cost Calibration.

## Validation Commands

- `browser_ops_admin_employee_import_reproduction_redacted`
- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-fix-ops-admin-employee-import-entry-state.md docs/05-execution-logs/task-plans/2026-06-29-fix-ops-admin-employee-import-entry-state.md docs/05-execution-logs/evidence/2026-06-29-fix-ops-admin-employee-import-entry-state.md docs/05-execution-logs/audits-reviews/2026-06-29-fix-ops-admin-employee-import-entry-state.md docs/05-execution-logs/acceptance/2026-06-29-fix-ops-admin-employee-import-entry-state.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-ops-admin-employee-import-entry-state-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-ops-admin-employee-import-entry-state-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-ops-admin-employee-import-entry-state-2026-06-29 -SkipRemoteAheadCheck`

## Execution Result

- Existing workflow was reachable after entering test-owned synthetic CSV content.
- Source/test repair was not needed.
- Existing unit coverage `tests/unit/admin-user-org-auth-ops-baseline.test.ts` passed.
