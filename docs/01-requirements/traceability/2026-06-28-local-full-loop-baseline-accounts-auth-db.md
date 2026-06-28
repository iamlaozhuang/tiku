# Local Full Loop Baseline Accounts Auth DB Traceability

## Task

- Task id: `local-full-loop-baseline-accounts-auth-db-2026-06-28`
- Sprint: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-full-loop-baseline-20260628`
- Result: `pass_local_full_loop_role_account_auth_db_baseline`

## Requirement Sources

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`

## Coverage Map

| Requirement surface                  | Local baseline evidence                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Student login baseline               | `student` role local session API smoke passed.                                                                          |
| Content admin baseline               | Dedicated `content_admin` local seed account and session API smoke passed.                                              |
| Ops admin baseline                   | Dedicated `ops_admin` local seed account and session API smoke passed.                                                  |
| Organization standard admin baseline | Dedicated `org_standard_admin` account retained standard organization authorization context.                            |
| Organization advanced admin baseline | Dedicated `org_advanced_admin` account retained advanced organization authorization context.                            |
| Employee baseline                    | `employee` local seed account is login-capable and returns employee plus organization context.                          |
| Edition-aware authorization          | Existing DB-backed local authorization e2e remained green after seed expansion.                                         |
| API contract                         | Smoke asserts standard `{ code, message, data }` envelope, camelCase JSON keys, and no raw `id` key in session payload. |

## Implementation Summary

- Added deterministic local dev seed coverage for distinct `content_admin`, `ops_admin`, and login-capable `employee`.
- Kept existing student and organization admin seed behavior compatible with existing focused tests.
- Added a scoped localhost e2e smoke for six local full-loop baseline roles.
- Reused the local dev DB and existing localhost server; no staging/prod, Provider, Cost Calibration, payment, OCR/export, package/lockfile, or `.env*` change.

## Residual Scope

- This task establishes account/auth/DB baseline only.
- Knowledge/RAG maintenance, AI generation, answer flow, AI explanation, organization analytics, and organization AI generation remain successor tasks in the same sprint.
- No release readiness or final Pass is claimed.
