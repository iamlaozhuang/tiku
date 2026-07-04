# 2026-07-04 Full-chain Scenario 5 Employee Import Harness Repair Evidence

## Scope

- Task id: `full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-5-advanced-org-package-2026-07-04`
- Result: blocked
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Repair Result

- BLOCKED: source-contract verification stopped because the focused employee import unit test expectation is stale
  against the current product response shape.
- ROOT CAUSE: the current product response includes a redacted generated-password aggregate field, while the existing
  focused unit expectations omit it.
- PASS: harness contract correction is identified as CSV `content` plus `sourceFormat` for the Scenario 5 rerun.
- NOT RUN: local app startup.
- NOT RUN: browser/e2e.
- NOT RUN: DB connection, read, write, migration, seed, cleanup, or reset.
- NOT RUN: source/test/dependency/package/lockfile changes.
- NOT RUN: Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production usability.

## Harness Contract

| Label                                      | Value                             |
| ------------------------------------------ | --------------------------------- |
| `employee_import_request_shape`            | `csv_content_and_source_format`   |
| `employee_import_header_shape`             | `identity_profile_org_target`     |
| `employee_import_authorization_columns`    | `forbidden`                       |
| `future_rerun_restart_node`                | `scenario_5_employee_import_node` |
| `repo_private_value_output_count`          | 0                                 |
| `browser_runtime_execution_count`          | 0                                 |
| `direct_db_connection_or_mutation_count`   | 0                                 |
| `provider_staging_prod_cost_release_count` | 0                                 |

## Validation

- FAIL: `npm.cmd run test:unit -- tests/unit/phase-20-ra-01-04-employee-import.test.ts src/server/validators/employee-account.test.ts`
- PASS: `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- PASS: `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- PASS: `git diff --check`
- PASS: `git diff --name-only -- <blocked paths>`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-5-employee-import-harness-repair-2026-07-04 -SkipRemoteAheadCheck`

## Boundary Confirmation

- No credential, password, phone number, email address, connection string, token, session, cookie, `localStorage`,
  Authorization header, raw DB row, internal id, screenshot, raw DOM, trace, Provider payload, raw Prompt, raw AI I/O,
  full material/question/paper content, plaintext card value, employee answer, private fixture content, or private CSV
  content is recorded here.
- Provider/staging/prod/Cost Calibration: not executed.
- Release readiness/final Pass/production usability: not claimed.

## Next Task

Split a minimal focused test-contract repair so employee import CSV tests acknowledge the existing redacted
`generatedInitialPasswords` response aggregate, then rerun this harness repair validation before Scenario 5 runtime
rerun.
