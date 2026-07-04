# 2026-07-04 Full-chain Scenario 5 Advanced Org Package Evidence

## Scope

- Task id: `full-chain-scenario-5-advanced-org-package-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-org-package-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_5_advanced_org_package`
- Advanced org admin selector label: `fc_org_advanced_admin_created_by_ops`
- Advanced employee selector label: `fc_org_advanced_employee_batch`
- Result: blocked
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Runtime Result

- PASS: local app startup completed against the isolated target label via process-level DB override.
- PASS: `ops_admin` browser/runtime session was established.
- PASS: advanced organization package creation reached product route success for all required expanded scopes.
- PASS: `org_advanced_admin` creation and organization binding reached product route success.
- BLOCKED: advanced employee import stopped at the import request-shape gate before employee creation.
- ROOT CAUSE: the acceptance harness used the existing-user binding JSON shape for new employee account import. The
  product route requires new employee account import to use CSV/TSV `content` plus `sourceFormat`.
- PASS: local app process was stopped and port cleanup completed.

## Aggregate Evidence

| Label                                               | Count |
| --------------------------------------------------- | ----- |
| `advanced_org_branch_metadata_preflight`            | pass  |
| `advanced_org_admin_input_metadata_preflight`       | pass  |
| `advanced_employee_input_metadata_preflight`        | pass  |
| `advanced_org_auth_created_count`                   | 5     |
| `org_advanced_admin_created_count`                  | 1     |
| `admin_organization_advanced_binding_count`         | 1     |
| `advanced_employee_imported_count`                  | 0     |
| `advanced_employee_rejected_count`                  | 0     |
| `advanced_org_admin_allowed_advanced_surface_count` | 0     |
| `advanced_org_admin_denied_global_surface_count`    | 0     |
| `standard_org_admin_denied_advanced_surface_count`  | 0     |
| `provider_execution_count`                          | 0     |
| `staging_prod_cost_release_execution_count`         | 0     |
| `repo_private_value_output_count`                   | 0     |

## Validation

- PASS: `powershell.exe -NoProfile -Command <redacted Scenario 5 private metadata and DB target preflight>`
- PASS: `powershell.exe -NoProfile -Command <local app startup with redacted runtime env>`
- BLOCKED: `node - <redacted Scenario 5 browser and product API flow>`
- PASS: `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- PASS: `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- PASS: `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- PASS: `git diff --check`
- PASS: `git diff --name-only -- <blocked paths>`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-advanced-org-package-2026-07-04`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-5-advanced-org-package-2026-07-04 -SkipRemoteAheadCheck`

## Boundary Confirmation

- No credential, password, phone number, email address, connection string, token, session, cookie, `localStorage`,
  Authorization header, raw DB row, internal id, screenshot, raw DOM, trace, Provider payload, raw Prompt, raw AI I/O,
  full material/question/paper content, plaintext card value, employee answer, or private fixture content is recorded
  here.
- Provider/staging/prod/Cost Calibration: not executed.
- Release readiness/final Pass/production usability: not claimed.

## Next Task

Split a harness repair task to correct the Scenario 5 employee import request shape to the product-supported
CSV/`sourceFormat` path. After that repair closes, rerun Scenario 5 from the employee import node because advanced
`org_auth` and `org_advanced_admin` were already created through product flow and verified by aggregate counts.
