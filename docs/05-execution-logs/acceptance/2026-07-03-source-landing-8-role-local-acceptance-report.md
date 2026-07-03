# 2026-07-03 Source Landing 8 Role Local Acceptance Report

## Scope

- Task ID: `source-landing-8-role-local-acceptance-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-2026-07-03`
- Mode: approved local acceptance execution with localhost Playwright only.
- Evidence policy: redacted command/status/assertion summaries only. No screenshots, traces, DOM dumps, credentials, sessions, cookies, env values, DB rows, Provider payloads, Prompt text, AI input/output, full content, PII, or plaintext `redeem_code` are recorded.

## Overall Result

- Overall status: `blocked_after_first_role_failure`
- First non-pass point: `personal_standard_student`
- Classification: `acceptance_harness_contract_drift`
- Product readiness claim: not made.
- Final Pass claim: not made.
- Production usability claim: not made.

The run stopped after the first role failure, per the approved stop rule. Remaining roles are recorded as not executed, not as pass.

## Role Results

| Order | Role                                 | Result | Execution Summary                                                                                                                                                                                                                                      | Evidence                                                                       |
| ----- | ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 0     | baseline local account/session smoke | pass   | Existing credential-backed baseline spec logged in six local role fixtures and verified redacted role/session summaries.                                                                                                                               | `e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`, exit `0`, `1 passed`. |
| 1     | `personal_standard_student`          | fail   | Existing student UI flow timed out waiting for the restart request after clicking the resume-panel restart button. Source inspection shows that button now opens a confirmation panel; the restart request is sent only after the confirmation button. | `e2e/student-practice-mock-entry.spec.ts`, exit `1`, timeout at restart wait.  |
| 2     | `personal_advanced_student`          | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 3     | `org_standard_employee`              | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 4     | `org_advanced_employee`              | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 5     | `org_standard_admin`                 | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 6     | `org_advanced_admin`                 | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 7     | `content_admin`                      | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |
| 8     | `ops_admin`                          | block  | Not executed because role 1 failed and the stop rule requires repair split before continuing.                                                                                                                                                          | Stop rule.                                                                     |

## Failure Details

- Failing command: `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`
- Failing assertion category: restart request emission after resume-panel restart action.
- Redacted error summary: test timeout while waiting for `POST /api/v1/practices/{redacted}/restart`.
- Source comparison:
  - `practice-resume-restart-button` currently calls `onRequestRestartPractice`.
  - `onRequestRestartPractice` only reveals `practice-restart-confirmation`.
  - The restart request is triggered by the confirmation action wired to `onConfirmRestartPractice`.
  - The existing spec waits for the request immediately after the first click, so it is not aligned with the current UI contract.

## Repair Split

- Split task: `repair-student-practice-restart-acceptance-harness-2026-07-03`
- Scope: repair the existing local acceptance harness for the student practice restart confirmation contract, then rerun the 8-role local acceptance from the beginning.
- Product source change: not authorized by this run.
- Test source change: deferred to the split repair task.
