# 2026-07-03 Source Landing 8 Role Credential-Backed Local Acceptance Rerun Evidence

## Task

- Task ID: `source-landing-8-role-credential-backed-local-acceptance-rerun-2026-07-03`
- Branch: `codex/source-landing-8-role-credential-backed-local-acceptance-rerun-2026-07-03`
- Status: blocked; repair task split

## Redaction Statement

This evidence records only file paths, role names, command names, exit status, route categories, assertion categories,
coverage modes, and concise pass/fail/block summaries. It must not record credentials, passwords, session values,
cookies, headers, localStorage, env values, connection strings, DB rows, internal ids, PII, plaintext `redeem_code`,
Provider payloads, Prompt text, AI input/output, full content, screenshots, traces, raw DOM, or exports.

## Execution Ledger

| Order | Command                                                                           | Exit | Role coverage                                  | Result                                                                      |
| ----- | --------------------------------------------------------------------------------- | ---- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | `credential-backed-8-role-local-acceptance.spec.ts`                               | 0    | all 8 primary roles                            | 2 tests passed; credential-backed login/session proof for all primary roles |
| 2     | `student-practice-mock-entry.spec.ts`                                             | 0    | `personal_standard_student`                    | 1 test passed; student practice/mock/report/mistake_book runtime flow       |
| 3     | `personal-ai-generation-local-request.spec.ts`                                    | 0    | learner AI path                                | 1 test passed; local learner AI request path without Provider               |
| 4     | `edition-aware-authorization-local-flow.spec.ts`                                  | 0    | personal/org edition boundaries                | 3 tests passed; route-fulfilled supplement                                  |
| 5     | `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts` | 0    | organization employee/admin and ops envelope   | 1 test passed; org training/analytics/AI local role flow                    |
| 6     | `admin-role-denial-browser.spec.ts`                                               | 0    | `content_admin`, `ops_admin` denial boundaries | 2 tests passed; cross-workspace denial browser checks                       |
| 7     | `role-separated-account-fixture-supplement.spec.ts`                               | 0    | all 8 primary roles                            | 6 tests passed; fixture supplement only                                     |
| 8     | `local-full-loop-knowledge-rag-maintenance-smoke.spec.ts`                         | 1    | `content_admin` positive content workflow      | blocked; stale harness expected client-visible session token after login    |

## Role Result Ledger

| Role                        | Result                        | Coverage mode                                                            | Redacted observed summary                                                                                                                                                                 |
| --------------------------- | ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | observed_pass                 | credential-backed plus runtime flow                                      | Credential-backed login/session proof and student practice/mock/report/mistake_book flow passed.                                                                                          |
| `personal_advanced_student` | observed_pass_with_supplement | credential-backed plus learner AI and edition supplement                 | Credential-backed login/session proof passed; learner AI local request and edition boundary supplements passed.                                                                           |
| `org_standard_employee`     | observed_pass_with_supplement | credential-backed plus organization training supplement                  | Credential-backed login/session proof passed; organization training role flow supplement passed.                                                                                          |
| `org_advanced_employee`     | observed_pass_with_supplement | credential-backed plus organization training/AI supplement               | Credential-backed login/session proof passed; organization advanced employee supplement passed.                                                                                           |
| `org_standard_admin`        | observed_pass_with_supplement | credential-backed plus org admin denial/edition supplement               | Credential-backed login/session proof passed; standard org admin boundary supplement passed.                                                                                              |
| `org_advanced_admin`        | observed_pass_with_supplement | credential-backed plus org training/analytics/AI supplement              | Credential-backed login/session proof passed; advanced org admin workflow supplement passed.                                                                                              |
| `content_admin`             | blocked                       | credential-backed login and denial only; positive workflow harness stale | Credential-backed login/session and denial boundary passed, but positive content resource/RAG workflow could not run because the existing harness expects a client-visible session token. |
| `ops_admin`                 | observed_pass_with_supplement | credential-backed plus ops envelope/denial supplement                    | Credential-backed login/session proof passed; ops envelope and content-denial supplements passed.                                                                                         |

## Fail / Block Detail

- Blocking command:
  `npm.cmd exec -- playwright test e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --project=chromium --reporter=line --trace=off`
- Exit: `1`.
- Redacted failure category: stale acceptance harness expects `data.token` to be a string after login; current secure
  session contract does not expose a client-visible session token.
- Sensitive evidence captured: no credential value, session value, cookie value, Authorization header, storage value,
  DB row, raw content, screenshot, trace, raw DOM, Provider payload, Prompt, or AI I/O was written to this evidence.
- Current acceptance decision: stop and split repair. Do not claim an 8-role credential-backed acceptance pass.
- Split repair task:
  `repair-content-admin-cookie-backed-acceptance-harness-2026-07-03`.

## Boundary Notes

- Runtime acceptance observation only.
- Direct DB access, Provider calls, env secret access, schema migration, dependency changes, staging/prod actions,
  screenshots, traces, raw DOM, and release/final/production claims remain blocked.
