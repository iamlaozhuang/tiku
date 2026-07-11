# 0704 Ops Log Duty Split Evidence

## Metadata

- taskId: `0704-ops-log-duty-split-2026-07-11`
- branch: `codex/0704-ops-log-duty-split`
- statusCategory: `localhost_ui_source_test_only`
- evidenceMode: `redacted_role_route_status_problem_fix_test_counts_only`

## Scope

- previewPreparation: `paused`
- providerExecution: `blocked_not_executed`
- envSecretAccess: `blocked_not_executed`
- stagingProdDeploy: `blocked_not_executed`
- directDatabaseConnection: `blocked_not_executed`
- screenshotRawDomTrace: `not_recorded`
- packageOrLockfileChange: `false`
- schemaMigrationSeedChange: `false`

## UI Result

| roleLabel               | routeLabel             | stateCategory                 | problemCategory                                 | fixSummary                                                                                   |
| ----------------------- | ---------------------- | ----------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| super_admin / ops_admin | 运营后台 > 审计日志    | ready / loading / empty/error | audit log mixed with AI call and model surfaces | Added independent read-only audit log route with summary, filter, table, pagination, detail. |
| super_admin / ops_admin | 运营后台 > AI 调用日志 | ready / loading / empty/error | AI call log mixed with audit and model surfaces | Added independent AI call log route with call summary, filter, table, pagination, detail.    |
| super_admin / ops_admin | 运营后台导航           | ready                         | combined log menu hid duty boundary             | Split navigation into `审计日志` and `AI 调用日志` entries.                                  |
| super_admin / ops_admin | 运营工作台入口         | ready                         | combined log entry hid next action              | Split overview entries to route to the two dedicated log pages.                              |
| super_admin / ops_admin | 旧合并日志路由         | redirect                      | existing deep link compatibility needed         | Kept `/ops/ai-audit-logs` as compatibility redirect to `审计日志`.                           |

## Behavior Boundary

- Audit log runtime API contract: unchanged.
- AI call log runtime API contract: unchanged.
- Model provider/configuration service and mutation behavior: unchanged.
- Prompt template behavior: unchanged.
- Formal adoption review behavior: unchanged.
- Role guard and workspace authorization logic: unchanged.
- Provider execution: blocked and not executed.

## Verification Commands

| command                                                                                                                                                                                                                                 | result                             | count                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------- |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-role-overview-ui.test.ts tests/unit/admin-ops-summary-first-ui.test.ts` | red_expected_before_implementation | 4 files / 35 tests / 6 fails |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-role-overview-ui.test.ts tests/unit/admin-ops-summary-first-ui.test.ts` | pass_after_implementation          | 4 files / 35 tests           |
| `corepack pnpm@10.26.1 run lint`                                                                                                                                                                                                        | pass                               | 0 errors / 0 warnings        |
| `corepack pnpm@10.26.1 run typecheck`                                                                                                                                                                                                   | pass                               | tsc no emit                  |
| `git diff --check`                                                                                                                                                                                                                      | pass                               | whitespace check             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-log-duty-split-2026-07-11`                                                                      | pass                               | 15 files scanned             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-log-duty-split-2026-07-11 -SkipRemoteAheadCheck`                                                  | pass_after_checkpoint_update       | repository readiness passed  |

## Redaction Check

- credentials: `not_recorded`
- sessions/cookies/tokens/localStorage/auth headers: `not_recorded`
- DB URL/env values/raw DB rows/internal product ids: `not_recorded`
- full question/paper/material/resource/chunk content: `not_recorded`
- plaintext redeem_code: `not_recorded`
- raw prompt/raw AI output/provider payload: `not_recorded`
- screenshots/raw DOM/browser trace: `not_recorded`

## Non-Claims

- This task only claims localhost UI source optimization for operations log duty separation.
- This task does not claim staging readiness, production readiness, final release readiness, Provider readiness, deployment readiness, or Cost Calibration readiness.
