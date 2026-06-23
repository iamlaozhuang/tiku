# Acceptance Role Separated Account Seeded Local Runtime Run Plan

taskId: acceptance-role-separated-account-seeded-local-runtime-run-2026-06-23
status: closed
createdAt: "2026-06-23T07:23:48-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23

## Purpose

Collect redacted local runtime evidence for the eight mandatory role-separated account rows after laozhuang approved the
seeded local runtime scope package.

This task may use the in-app browser against `http://127.0.0.1:3000` or `http://localhost:3000` only. Codex may observe
visible UI state and route/guard behavior, but must not read password documents, enter credentials, inspect cookies,
inspect localStorage/sessionStorage, record tokens, create accounts, reset accounts, seed or write a database, edit
`.env*`, change source/e2e/schema/dependencies, call Provider, run Cost Calibration, deploy staging/prod, touch payment
services, or claim final MVP Pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-seeded-local-runtime-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-runtime-walkthrough.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-test-fixture-runtime-run.md`

## Runtime Scope

Rows in scope:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

For each row, record only:

- role row name;
- local route or workflow label;
- allowed behavior result;
- denied behavior result;
- row status as `pass`, `fail`, or `blocked`;
- short redacted runtime health summary.

## Execution Plan

1. Connect to the current in-app browser and confirm the target remains local.
2. Observe the currently logged-in session without reading credential material.
3. For the current role, sample one allowed route/workflow and one denied route/workflow.
4. If a different role is required, ask laozhuang to log in manually with that role and then continue observation.
5. Mark a row `blocked` if the account/session is unavailable or if proving it would require account creation, reset,
   seed, database write, credential-document access, or any other blocked action.
6. Write redacted evidence and audit review documents.
7. Update project state and task queue.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-seeded-local-runtime-run-2026-06-23`

## Validation Result

The seeded local runtime run was executed within the approved local browser boundary and closed as `Blocked`.

No mandatory row produced complete separated-role runtime evidence. The next step is not another browser check; it is an
owner decision about whether to provision or seed separated local accounts, accept explicit MVP exclusions, or continue
with the role-separated account gate blocked.

## Stop Conditions

Stop and record `blocked` rather than continuing if:

- laozhuang has not logged in with the role needed for the row;
- the visible account cannot be mapped to one exact role row;
- the route/workflow is unavailable;
- the app requests credentials from Codex;
- the task would require account, seed, database, env, schema, source, e2e, Provider, staging/prod, payment, or final
  acceptance action.
