# 2026-07-03 Source Landing 8 Role Local Acceptance Rerun Evidence

## Task

- Task ID: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Status: `closed`

## Redaction Statement

This evidence records only command names, exit status, role names, route categories, assertion categories, and concise pass/fail/block summaries. It does not record credentials, session values, cookies, headers, env values, DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full content, screenshots, traces, or DOM dumps.

## Execution Ledger

| Order | Command                                                                                                                                                              | Exit | Role Coverage                                           | Result     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------- | ---------- |
| 1     | `npm.cmd exec -- playwright test e2e/local-full-loop-baseline-accounts-auth-db.spec.ts --project=chromium --reporter=line --trace=off`                               | `0`  | preflight credential-backed local account/session smoke | `1 passed` |
| 2     | `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`                                             | `0`  | `personal_standard_student`                             | `1 passed` |
| 3     | `npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off`                                    | `0`  | learner AI surface without Provider submission          | `1 passed` |
| 4     | `npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off`                                  | `0`  | personal/org standard and advanced edition boundaries   | `3 passed` |
| 5     | `npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off` | `0`  | organization admin, employee, and ops runtime flow      | `1 passed` |
| 6     | `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off`                                               | `0`  | `content_admin` and `ops_admin` denial boundaries       | `2 passed` |
| 7     | `npm.cmd exec -- playwright test e2e/role-separated-account-fixture-supplement.spec.ts --project=chromium --reporter=line --trace=off`                               | `0`  | role-separated fixture-first allowed/denied contracts   | `6 passed` |

## Role Result Ledger

| Role                        | Result | Coverage Mode                                                                                                                                                                                                          |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | pass   | credential-backed learner UI/runtime flow: practice restart, answer, mock secrecy, report, mistake_book, redaction.                                                                                                    |
| `personal_advanced_student` | pass   | learner AI page runtime smoke plus edition-aware route-fulfilled advanced context and role-separated fixture-first allowed/denied contract; no Provider submission and no dedicated seeded advanced login was claimed. |
| `org_standard_employee`     | pass   | role-separated fixture-first standard employee allowed/denied contract plus organization employee runtime training flow coverage.                                                                                      |
| `org_advanced_employee`     | pass   | role-separated fixture-first advanced employee allowed/denied contract plus shared organization employee runtime training flow coverage.                                                                               |
| `org_standard_admin`        | pass   | credential-backed standard org admin login in organization flow, denied advanced training/analytics, plus role-separated fixture contract.                                                                             |
| `org_advanced_admin`        | pass   | credential-backed advanced org admin login in organization flow, training publish and analytics summaries, plus role-separated fixture contract.                                                                       |
| `content_admin`             | pass   | baseline credential-backed role/session smoke, admin denial browser boundary, and role-separated content allowed/denied fixture contract.                                                                              |
| `ops_admin`                 | pass   | credential-backed ops login in organization flow, employee envelope visibility, content denial browser boundary, and role-separated ops fixture contract.                                                              |

## Boundary Notes

- `super_admin` was not used as a primary role substitute.
- Fixture-first coverage is explicitly recorded where a dedicated seeded local account is not part of this run.
- No direct DB connection, env secret access, Provider call, schema migration, dependency change, staging/prod action, screenshot, trace, or DOM dump was used as evidence.
- Playwright `test-results/` artifacts were removed before commit.
- This is local 8-role acceptance evidence only. It is not release readiness, final Pass, or a production usability claim.

## Governance Validation

| Command                                                                                                                                                                                                     | Result                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                                                     | initially found 3 Markdown formatting changes.                 |
| `npm.cmd exec -- prettier --write --ignore-unknown ...`                                                                                                                                                     | pass; scoped to this task's Markdown files.                    |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                                                     | pass after scoped write.                                       |
| `git diff --check`                                                                                                                                                                                          | pass.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-8-role-local-acceptance-rerun-2026-07-03`                     | pass; scope, sensitive evidence, and terminology scans passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId source-landing-8-role-local-acceptance-rerun-2026-07-03 -SkipRemoteAheadCheck` | pass; evidence and audit paths were verified.                  |
