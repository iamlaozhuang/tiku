# 2026-07-03 Stage B DB-Backed 8-Role Local Acceptance Evidence

## Task

- Task ID: `stage-b-db-backed-8-role-local-acceptance-2026-07-03`
- Branch: `codex/stage-b-db-backed-8-role-local-acceptance-2026-07-03`
- Status: completed local DB-backed Stage B 8-role acceptance execution

## Redaction Statement

This evidence may record only task IDs, file paths, role labels, route/surface labels, expected-shape labels, target labels, aggregate counts, status categories, and validation command status. It must not record credentials, passwords, tokens, cookies, sessions, Authorization headers, env values, connection strings, raw DB rows, internal IDs, PII, phone, email, plaintext `redeem_code`, Provider payloads, prompt text, AI input/output, full content, screenshots, traces, videos, raw DOM, or exports.

## Execution Boundary And Result Evidence

| Check                                             | Result                                                       |
| ------------------------------------------------- | ------------------------------------------------------------ |
| Branch                                            | `codex/stage-b-db-backed-8-role-local-acceptance-2026-07-03` |
| Fresh approval source                             | current user message on 2026-07-04                           |
| DB-backed Stage B acceptance executed             | yes                                                          |
| Browser/e2e executed                              | yes, local `127.0.0.1:3000` only                             |
| Playwright project / trace                        | Chromium / trace off                                         |
| Dev server started or restarted                   | no                                                           |
| Direct DB query executed                          | yes, selector-scoped read-only aggregate/status only         |
| Direct DB write/provisioning/cleanup/reset        | no                                                           |
| Local app workflow mutation via browser/e2e       | yes, test-owned positive workflow actions only               |
| Private fixture read                              | yes, in-memory login input only                              |
| Product source/test/dependency/schema/env changed | no                                                           |
| Provider/staging/prod/cost action executed        | no                                                           |

## Prerequisite Facts Carried Forward

| Fact                                 | Redacted value                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Local service label                  | `tiku-postgres`                                                                |
| Runtime DB label                     | `tiku_fresh_phase25_20260601_001`                                              |
| Private fixture path                 | `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` |
| Post-repair preflight status         | passed                                                                         |
| Roles preflighted                    | 8                                                                              |
| Preflight fail/block count           | 0 / 0                                                                          |
| Stage B DB-backed acceptance started | true                                                                           |

## Fresh Approval Evidence

Approved scope: local `127.0.0.1:3000` browser/e2e, Playwright Chromium trace off, selector-scoped read-only DB
aggregate/status query on `tiku-postgres` / `tiku_fresh_phase25_20260601_001`, private fixture in-memory login use, and
stop-on-fail.

## DB Selector Preflight

| Role                        | Result | User selector | Admin selector | Auth context | Fail | Block |
| --------------------------- | ------ | ------------- | -------------- | ------------ | ---- | ----- |
| `personal_standard_student` | pass   | 1             | 0              | present      | 0    | 0     |
| `personal_advanced_student` | pass   | 1             | 0              | present      | 0    | 0     |
| `org_standard_employee`     | pass   | 1             | 0              | present      | 0    | 0     |
| `org_advanced_employee`     | pass   | 1             | 0              | present      | 0    | 0     |
| `org_standard_admin`        | pass   | 0             | 1              | present      | 0    | 0     |
| `org_advanced_admin`        | pass   | 0             | 1              | present      | 0    | 0     |
| `content_admin`             | pass   | 0             | 1              | present      | 0    | 0     |
| `ops_admin`                 | pass   | 0             | 1              | present      | 0    | 0     |

Raw rows, internal IDs, login identifiers, credentials, and PII were not recorded.

## E2E Execution Ledger

| Order | Spec                                                                                  | Role / flow label                        | Result   |
| ----- | ------------------------------------------------------------------------------------- | ---------------------------------------- | -------- |
| 1     | `e2e/credential-backed-8-role-local-acceptance.spec.ts`                               | all 8 primary roles                      | 2 passed |
| 2     | `e2e/student-practice-mock-entry.spec.ts`                                             | `personal_standard_student`              | 1 passed |
| 3     | `e2e/personal-ai-generation-local-request.spec.ts`                                    | `personal_advanced_student`              | 1 passed |
| 4     | `e2e/edition-aware-authorization-local-flow.spec.ts`                                  | personal/org edition boundary supplement | 3 passed |
| 5     | `e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts` | org employee/admin/ops supplement        | 1 passed |
| 6     | `e2e/admin-role-denial-browser.spec.ts`                                               | content/ops denial boundary              | 2 passed |
| 7     | `e2e/role-separated-account-fixture-supplement.spec.ts`                               | all 8 primary role fixture supplement    | 6 passed |
| 8     | `e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts`                         | `content_admin` positive workflow        | 1 passed |

Stop-on-fail remained active. No fail or block occurred, so no repair task was split.

## Role Result Ledger

| Role                        | Local result | Fail | Block |
| --------------------------- | ------------ | ---- | ----- |
| `personal_standard_student` | pass         | 0    | 0     |
| `personal_advanced_student` | pass         | 0    | 0     |
| `org_standard_employee`     | pass         | 0    | 0     |
| `org_advanced_employee`     | pass         | 0    | 0     |
| `org_standard_admin`        | pass         | 0    | 0     |
| `org_advanced_admin`        | pass         | 0    | 0     |
| `content_admin`             | pass         | 0    | 0     |
| `ops_admin`                 | pass         | 0    | 0     |

## Artifact Handling

Generated Playwright artifacts under `test-results` / `playwright-report` and temporary command logs were deleted after
redacted status extraction. No screenshots, traces, videos, raw DOM, cookies, tokens, storage, or headers were committed.

## Stop-On-Fail Evidence Rule

The run was ordered and serial at the command level. It would have stopped on the first fail or block, recorded only
redacted reason categories, split a repair/provisioning/harness task, closed out that task, and restarted the full
8-role sequence from `personal_standard_student`. No stop condition occurred.

## Validation Log

| Command                                                                                                                                                                              | Result |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `npm.cmd exec -- prettier --write --ignore-unknown <task files>`                                                                                                                     | passed |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                     | passed |
| `git diff --check`                                                                                                                                                                   | passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-db-backed-8-role-local-acceptance-2026-07-03` | passed |

## Non-Claims

- This records a local DB-backed Stage B 8-role acceptance result only.
- No release readiness, final Pass, production usability, Provider readiness, staging readiness, or Cost Calibration result is claimed.
