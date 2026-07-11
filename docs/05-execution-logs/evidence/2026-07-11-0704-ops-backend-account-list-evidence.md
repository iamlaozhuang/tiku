# 0704 Ops Backend Account List Evidence

## Metadata

- taskId: `0704-ops-backend-account-list-2026-07-11`
- roleLabel: `super_admin / ops_admin`
- routeLabel: `用户管理 / 后台账号`
- statusCategory: `localhost_ui_source_test_only`
- evidenceMode: `redacted_role_route_status_problem_fix_test_counts_only`

## Boundary

- previewPreparation: `paused`
- providerExecution: `blocked_not_executed`
- envSecretAccess: `blocked_not_executed`
- stagingProdDeploy: `blocked_not_executed`
- directDatabaseConnection: `blocked_not_executed`
- screenshotRawDomTrace: `existing_user_supplied_screenshot_reviewed_not_copied`
- packageOrLockfileChange: `false`
- schemaMigrationSeedChange: `false`

## Result

| routeLabel   | problemCategory           | fixSummary                                                                                                                                 | stateCategory            |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 用户管理     | account_domain_separation | Separated learner/employee and backend accounts into accessible tabs with independent list state.                                          | ready / loading / error  |
| 后台账号     | missing_list              | Added a server-scoped read-only list with keyword, role, status, organization, sort, page-size, reset, table, and pagination.              | ready / filtered / empty |
| 后台账号     | role_scope                | Cropped visible roles on the server before repository access; query parameters cannot widen the actor scope.                               | allowed / forbidden      |
| 后台账号     | sensitive_data            | Returned display fields and public operation references only; credentials, sessions, lock material, and numeric identifiers remain absent. | redacted                 |
| 用户管理     | failure_isolation         | Localized backend-list failures so learner and employee accounts remain usable.                                                            | partial_error            |
| 后台账号创建 | refresh                   | Preserved the existing create contract and refreshed the backend list after a successful create.                                           | success / error          |

## TDD And Verification

| commandCategory                    | result                                                 | count                         |
| ---------------------------------- | ------------------------------------------------------ | ----------------------------- |
| initial RED                        | expected_missing_GET_repository_tabs_and_list_failures | 4 files / 23 tests / 7 failed |
| failure-isolation RED              | expected_cross_domain_error_failure                    | 1 file / 1 failed             |
| focused GREEN                      | pass                                                   | 7 files / 33 tests            |
| lint                               | pass                                                   | 0 errors / 0 warnings         |
| typecheck                          | pass                                                   | tsc no emit                   |
| git diff check                     | pass                                                   | whitespace check              |
| Module Run v2 pre-commit hardening | pass                                                   | 16 files scanned              |
| Module Run v2 pre-push readiness   | pass                                                   | repository checkpoint aligned |

## Redaction Check

- credentials, passwords, sessions, cookies, tokens, authorization headers: `not_recorded`
- database URL, env values, raw rows, internal numeric identifiers: `not_recorded`
- card plaintext, full content, raw logs, raw prompts, raw AI output, Provider payloads: `not_recorded`
- screenshots, raw DOM, browser traces: `not_recorded`
