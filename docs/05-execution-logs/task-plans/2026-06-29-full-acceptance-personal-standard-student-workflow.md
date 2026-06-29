# Full Acceptance Personal Standard Student Workflow Plan

- Task id: `full-acceptance-personal-standard-student-workflow-2026-06-29`
- Branch: `codex/personal-standard-student-acceptance-20260629`
- Status: closed
- Updated at: `2026-06-29T03:26:31-07:00`
- Approval consumed: `current_user_staged_local_execution_stage_a_stage_b_and_per_task_closeout_2026_06_28`

## Governance Materialization

Goal: verify scoped `personal_standard_student` standard learner and advanced-AI denial rows from the mandatory
owner-facing checklist, using localhost-only browser evidence.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-personal-standard-student-workflow.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-personal-standard-student-workflow.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-personal-standard-student-workflow.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-personal-standard-student-workflow.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-personal-standard-student-workflow.md`

Blocked files/actions:

- `.env*`, package/lockfiles, source, tests, DB schema, migrations, seed, scripts, e2e reports, `.next`.
- Direct DB access, schema/migration/seed, Provider execution/configuration, prompt execution, dependency changes,
  staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.

DB boundary: no direct database connection/read/write, no migration/seed/schema change, no raw row evidence.

AI/Provider boundary: no Provider call, no Provider config/credential read/write, no prompt payload, no raw AI IO, no
complete generated content in evidence.

Credential boundary: read-only test-owned login input for `personal_standard_student` only; no credential, session,
token, cookie, localStorage, or Authorization header evidence.

Evidence boundary: role/route/workflow/status/count summaries only.

## Required Read Confirmation

- Code taste commandments: read.
- ADR directory: read.
- Owner-facing role checklist: read, with `personal_standard_student` rows as mandatory scope.

## Execution Plan

1. Use the in-app browser on localhost only. Status: done.
2. Establish or switch to the test-owned `personal_standard_student` session without recording account material. Status:
   done.
3. Verify learner home and ordinary learner surfaces with redacted route/status/control counts. Status: done.
4. Verify learner AI training, `AI出题`, and `AI组卷` are denied, hidden, or standard-unavailable. Status: done.
5. Record only redacted evidence and update acceptance/audit/governance files. Status: done.
6. Run scoped formatting, diff, Module Run v2 gates, then commit, fast-forward merge to `master`, push `origin/master`,
   and clean up the short branch per closeout policy.

## Validation Commands

- `browser_personal_standard_student_workflow_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-personal-standard-student-workflow.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-personal-standard-student-workflow.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-personal-standard-student-workflow.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-personal-standard-student-workflow.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-personal-standard-student-workflow.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-personal-standard-student-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-personal-standard-student-workflow-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-personal-standard-student-workflow-2026-06-29 -SkipRemoteAheadCheck`
