# Full Acceptance Org Advanced Employee AI Actions Rerun Plan

- Task id: `full-acceptance-org-advanced-employee-ai-actions-rerun-2026-06-29`
- Branch: `codex/org-advanced-employee-ai-actions-rerun-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Produce redacted role-specific localhost acceptance evidence for `org_advanced_employee` learner AI question generation,
learner AI paper generation, and generated-content practice/feedback after the shared learner AI action repair.

## Authorization

This task consumes the previously materialized staged local execution approval for Stage A, Stage B, and per-task
closeout. The current user also approved execution on `2026-06-29T04:57:04-07:00` for this seeded task.

## Mandatory Checklist

- Checklist: `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.
- Rows:
  - `org_advanced_employee.employee_ai_question_generation`
  - `org_advanced_employee.employee_ai_paper_generation`
  - `org_advanced_employee.generated_content_practice_feedback`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`

## Read-Only Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Redacted evidence and acceptance logs relevant to the rows above.
- Test-owned role login material from `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`,
  used only as login input and never recorded.

## Blocked

- Source, test, dependency, package, lockfile, schema, migration, seed, `.env*`, direct DB, Provider, Provider config,
  prompts, raw AI input/output, staging/prod/cloud/deploy, PR, force-push, release readiness, final Pass, and Cost
  Calibration.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, connection strings, raw DOM, screenshots,
  traces, raw DB rows, internal IDs, PII, email, phone, plaintext `redeem_code`, complete question/paper/material/resource
  content, and complete generated content in evidence.

## Execution Steps

1. Confirm localhost availability without printing env or secrets; start a local dev server only if required.
2. Use the test-owned `org_advanced_employee` login only as input.
3. Verify learner AI entry and route state on localhost.
4. Verify AI question controls and action result status/count summary without Provider execution.
5. Verify AI paper controls and action result/status/count summary without Provider execution.
6. Verify generated-content practice/feedback affordance status/count summary.
7. Record only redacted role/route/workflow/status/count evidence.
8. Run scoped Prettier, diff, and Module Run v2 gates.
9. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch if validation passes.

## Validation Commands

- `browser_org_advanced_employee_ai_actions_rerun_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-org-advanced-employee-ai-actions-rerun-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-ai-actions-rerun-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-ai-actions-rerun-2026-06-29 -SkipRemoteAheadCheck`
