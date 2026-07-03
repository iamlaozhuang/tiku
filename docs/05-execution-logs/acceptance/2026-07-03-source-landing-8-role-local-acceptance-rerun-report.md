# 2026-07-03 Source Landing 8 Role Local Acceptance Rerun Report

## Scope

- Task ID: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Status: `closed`

## Role Result Ledger

| Order | Role                        | Result | Evidence                                                                                                                                                                                                                         |
| ----- | --------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `personal_standard_student` | pass   | `student-practice-mock-entry.spec.ts`                                                                                                                                                                                            |
| 2     | `personal_advanced_student` | pass   | `personal-ai-generation-local-request.spec.ts`, `edition-aware-authorization-local-flow.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`; fixture-first boundary recorded.                                          |
| 3     | `org_standard_employee`     | pass   | `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`                                                                                           |
| 4     | `org_advanced_employee`     | pass   | `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`                                                                                           |
| 5     | `org_standard_admin`        | pass   | `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`                                                                                           |
| 6     | `org_advanced_admin`        | pass   | `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`                                                                                           |
| 7     | `content_admin`             | pass   | `local-full-loop-baseline-accounts-auth-db.spec.ts`, `admin-role-denial-browser.spec.ts`, `role-separated-account-fixture-supplement.spec.ts`                                                                                    |
| 8     | `ops_admin`                 | pass   | `local-full-loop-baseline-accounts-auth-db.spec.ts`, `local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`, `admin-role-denial-browser.spec.ts`, `role-separated-account-fixture-supplement.spec.ts` |

## Overall

- Result: `local_8_role_acceptance_rerun_passed_with_recorded_fixture_first_boundaries`
- Fail/block found: no.
- Split repair task created: no.

No release readiness, final Pass, or production usability claim is made.
