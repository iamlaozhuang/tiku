# 2026-07-03 Source Landing 8 Role Local Account Data Fixture Readiness

## Scope

- Task ID: `source-landing-8-role-local-account-data-fixture-hardening-2026-07-03`
- Target matrix: `2026-07-03-source-landing-8-role-credential-backed-fixture-target-matrix.md`
- Status: closed.

This readiness package prepares the next credential-backed local rerun. It does not execute acceptance, start a dev
server, run a browser, connect to a database, call a Provider, or change source/test/fixture files.

## Account Fixture Readiness

| Role                        | Required account marker | Redacted private fixture check | Next rerun readiness                     |
| --------------------------- | ----------------------- | ------------------------------ | ---------------------------------------- |
| `personal_standard_student` | required                | present                        | ready for credential-backed runtime use  |
| `personal_advanced_student` | required                | present                        | ready for credential-backed runtime use  |
| `org_standard_employee`     | required                | present                        | ready for credential-backed runtime use  |
| `org_advanced_employee`     | required                | present                        | ready for credential-backed runtime use  |
| `org_standard_admin`        | required                | present                        | ready for credential-backed runtime use  |
| `org_advanced_admin`        | required                | present                        | ready for credential-backed runtime use  |
| `content_admin`             | required                | present                        | ready for credential-backed workflow use |
| `ops_admin`                 | required                | present                        | ready for credential-backed workflow use |

## Data Fixture Readiness

| Data area                   | Redacted readiness position                                                               | Runtime rerun implication                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Personal authorization      | ready with runtime verification; no DB or raw account value inspection in this task.      | Next rerun must prove standard/advanced `personal_auth` behavior through runtime assertions. |
| Organization authorization  | ready with runtime verification; org role markers present, DB state not inspected.        | Next rerun must prove standard/advanced `org_auth` and role boundaries through runtime.      |
| Organization training       | ready with runtime verification; no seeded row or assignment content inspected.           | Next rerun must prove allowed advanced training and standard denial.                         |
| Organization analytics      | ready with runtime verification; no raw employee answer or aggregate row inspected.       | Next rerun must use redacted aggregate assertions only.                                      |
| Content resources           | ready with runtime verification; content data not read or copied.                         | Next rerun must prove content admin route/workflow boundary without full content evidence.   |
| Content AI drafts           | ready with runtime verification; no Provider, Prompt, AI I/O, or full draft inspected.    | Next rerun must keep Provider disabled or separately gated.                                  |
| Ops authorization workbench | ready with runtime verification; no plaintext `redeem_code` or private ops data recorded. | Next rerun must prove eligible ops surfaces without secret evidence.                         |
| Audit/log summaries         | ready with runtime verification; no raw log rows inspected.                               | Next rerun may record only redacted status/count summaries.                                  |

## E2E Source Marker Readiness

Read-only role-marker counts over the existing local specs show that credential-backed rerun work can reuse current spec
surfaces, while the next task must still prove actual runtime role/session behavior:

| Spec file                                                                             | Redacted role marker summary                              |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`                               | 4 admin/organization markers.                             |
| `e2e/student-practice-mock-entry.spec.ts`                                             | no role marker; covers student practice flow by route.    |
| `e2e/personal-ai-generation-local-request.spec.ts`                                    | no role marker; covers learner AI route by local request. |
| `e2e/edition-aware-authorization-local-flow.spec.ts`                                  | `super_admin` marker only; not a primary role substitute. |
| `e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts` | 3 organization/ops markers.                               |
| `e2e/admin-role-denial-browser.spec.ts`                                               | 2 content/ops markers.                                    |
| `e2e/role-separated-account-fixture-supplement.spec.ts`                               | 7 role-separated fixture supplement markers.              |

## Stop Rule

No required role marker is absent. This task does not create a repair task. The next task may materialize the
credential-backed runtime rerun boundary, but it must still stop on the first runtime fail/block.
