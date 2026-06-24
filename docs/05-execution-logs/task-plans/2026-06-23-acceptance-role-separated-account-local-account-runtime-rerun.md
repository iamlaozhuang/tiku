# Acceptance Role Separated Account Local Account Runtime Rerun Plan

taskId: acceptance-role-separated-account-local-account-runtime-rerun-2026-06-23
status: in_progress
createdAt: "2026-06-23T09:48:37-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_LOCAL_ACCOUNT_RUNTIME_RERUN_SCOPE_2026_06_23

## Purpose

Run a local-only browser walkthrough using the role-separated local accounts that were provisioned in the prior task.

The purpose is to collect redacted runtime evidence for each mandatory role row. Evidence must show, in plain terms,
whether each role can reach the workflows it should reach and is blocked from workflows it should not reach.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-local-account-runtime-rerun-scope-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-seeded-local-runtime-run.md`

## Approved Boundary

Allowed:

- use only `http://127.0.0.1:3000` or `http://localhost:3000`;
- observe the current in-app browser;
- ask laozhuang to manually log in with each local account;
- record role labels, route or workflow labels, allowed/denied behavior, visible access-denied class if any, and row
  status;
- close each row as `pass`, `fail`, or `blocked`.

Blocked:

- reading the private credential handoff file;
- asking laozhuang to paste passwords into chat;
- Codex typing passwords or logging in on behalf of laozhuang;
- recording passwords, phone login values, tokens, cookies, browser storage, Authorization headers, database URLs, raw
  rows, raw AI prompts, raw AI outputs, raw answer text, or full paper content;
- changing source, tests, fixtures, schema, migrations, dependencies, package files, scripts, or `.env*`;
- account creation, account disablement, password reset, fixture mutation, seed rerun, or database write;
- Provider/model calls, Cost Calibration, staging/prod, deployment, payment, external services, or final MVP Pass.

## Runtime Rows

| Row                         | Plain-language expected positive proof                                                          | Plain-language expected negative proof                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `personal_standard_student` | Personal standard learner can enter learner-facing pages.                                       | Admin, content operations, system operations, and advanced-only proof are blocked.     |
| `personal_advanced_student` | Personal advanced learner can enter learner-facing pages and show advanced context if surfaced. | Admin, content operations, and system operations are blocked.                          |
| `org_standard_employee`     | Standard enterprise employee can enter employee-facing organization flow if surfaced.           | Admin, content operations, system operations, and advanced-only proof are blocked.     |
| `org_advanced_employee`     | Advanced enterprise employee can enter employee-facing organization flow if surfaced.           | Admin, content operations, and system operations are blocked.                          |
| `org_standard_admin`        | Standard organization-bound admin context is visible if surfaced.                               | Content-only authoring, unrelated system-wide actions, and advanced proof are blocked. |
| `org_advanced_admin`        | Advanced organization-bound admin context is visible if surfaced.                               | Content-only authoring and unrelated system-wide actions are blocked.                  |
| `content_admin`             | Content operations areas are reachable.                                                         | System operations areas are blocked if product permissions separate them.              |
| `ops_admin`                 | System operations areas are reachable.                                                          | Content authoring actions are blocked if product permissions separate them.            |

## Execution Steps

1. Confirm the browser target is local.
2. Ask laozhuang to open the private credential file locally. Codex must not open it.
3. For each role row, ask laozhuang to log out and then log in manually with that row's account.
4. After laozhuang confirms login, observe representative allowed and denied local routes.
5. Record only redacted role, route, and behavior evidence.
6. Mark the row `blocked` if laozhuang cannot log in with that account, if the visible session cannot be mapped to the
   row, or if proving the row would require a blocked action.
7. Write the final evidence and audit review.
8. If laozhuang adds post-observation repair requirements, record them as a redacted documentation artifact before
   implementation scoping.
9. Update state and queue, run validation commands, and commit locally.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-local-account-runtime-rerun-2026-06-23`

## Stop Conditions

Stop and record `blocked` rather than continuing if:

- a required account cannot be used by laozhuang;
- the app asks Codex to enter or reveal credentials;
- the evidence would need secrets, tokens, browser storage, database rows, or raw user/private content;
- the task would require source/test/schema/dependency/env changes, account mutation, database writes, Provider,
  staging/prod, payment, Cost Calibration, or final MVP Pass.
