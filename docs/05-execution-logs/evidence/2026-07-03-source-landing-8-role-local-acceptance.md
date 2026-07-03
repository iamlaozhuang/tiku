# 2026-07-03 Source Landing 8 Role Local Acceptance Evidence

## Task

- Task ID: `source-landing-8-role-local-acceptance-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-2026-07-03`
- Result: `blocked_after_first_role_failure`
- Stop rule applied: yes.

## Redaction Statement

This evidence records only role names, file paths, command names, exit status, assertion categories, and redacted failure summaries. It does not record credentials, session values, cookies, headers, env values, DB rows, internal numeric ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full generated content, full question/paper/material/resource/chunk content, screenshots, traces, or DOM dumps.

## Preflight

| Check                     | Result                                                    |
| ------------------------- | --------------------------------------------------------- |
| Branch                    | `codex/source-landing-8-role-local-acceptance-2026-07-03` |
| Initial status            | clean before task materialization                         |
| Playwright CLI            | available, version reported locally                       |
| Port 3000                 | no listener before first Playwright run                   |
| Product source edits      | none                                                      |
| Test source edits         | none                                                      |
| Direct DB action by agent | none                                                      |
| Env secret access         | none                                                      |
| Provider call             | none                                                      |

## Command Evidence

| Order | Command                                                                                                                                | Exit | Redacted Result                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `npm.cmd exec -- playwright test e2e/local-full-loop-baseline-accounts-auth-db.spec.ts --project=chromium --reporter=line --trace=off` | `0`  | `1 passed`; baseline local credential-backed role login/session smoke completed with redacted summaries.                             |
| 2     | `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`               | `1`  | `personal_standard_student` UI flow timed out waiting for `POST /api/v1/practices/{redacted}/restart` after the first restart click. |

Execution stopped after command 2.

## Root Cause Classification

- Failure type: `acceptance_harness_contract_drift`
- Evidence:
  - The UI source still contains the resume-panel restart button and restart handler.
  - The resume-panel restart button opens a confirmation panel.
  - The restart request is emitted only from the confirmation action.
  - The existing acceptance spec waits for the request immediately after the first click.
- Product defect claim: not made.
- Acceptance success claim: not made.

## Role Status Ledger

| Role                        | Status | Notes                                                                                       |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `personal_standard_student` | fail   | Existing UI acceptance harness does not complete the current restart-confirmation contract. |
| `personal_advanced_student` | block  | Not executed after first failure.                                                           |
| `org_standard_employee`     | block  | Not executed after first failure.                                                           |
| `org_advanced_employee`     | block  | Not executed after first failure.                                                           |
| `org_standard_admin`        | block  | Not executed after first failure.                                                           |
| `org_advanced_admin`        | block  | Not executed after first failure.                                                           |
| `content_admin`             | block  | Not executed after first failure.                                                           |
| `ops_admin`                 | block  | Not executed after first failure.                                                           |

## Generated Local Artifact Handling

Playwright generated local failure artifacts under `test-results/`. They are treated as forbidden evidence because they may contain raw page context. They were not referenced for acceptance conclusions and were removed before commit. Follow-up checks showed both `test-results/` and `playwright-report/` absent.

## Split Repair Task

- Task ID: `repair-student-practice-restart-acceptance-harness-2026-07-03`
- Reason: the 8-role acceptance cannot continue while the first student role flow is blocked by an acceptance harness contract drift.
- Next allowed work: update the acceptance harness or fixture contract in a dedicated repair task, then rerun the full 8-role local acceptance sequence from role 1.

## Governance Validation

| Command                                                                                                                                                                           | Result                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                           | failed initially for 4 new Markdown files.                     |
| `npm.cmd exec -- prettier --write --ignore-unknown ...`                                                                                                                           | pass; scoped to this task's docs/state files.                  |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                           | pass; all matched files use Prettier style.                    |
| `git diff --check`                                                                                                                                                                | pass.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-8-role-local-acceptance-2026-07-03` | pass; scope, sensitive evidence, and terminology scans passed. |

## Closeout Boundary

- Local commit: approved by current task boundary after evidence and gates.
- Fast-forward merge: not executed; fresh closeout approval required after blocked result.
- Push: not executed; fresh closeout approval required after blocked result.
- Branch cleanup: not executed; fresh closeout approval required after blocked result.
