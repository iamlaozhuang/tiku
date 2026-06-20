# Module Run v2 Mechanic Seed Transaction Scope Evidence

## Summary

`tiku-module-run-v2-mechanic-2` updated pre-commit hardening so `tiku-module-run-v2-autopilot` can commit the current
seed transaction shape emitted by `New-ModuleRunV2ImplementationSeed.ps1`.

## RED

Before the mechanic change, `git commit` failed in `Test-ModuleRunV2PreCommitHardening.ps1` because the hook recognized
only the legacy three-file seed transaction and treated the generated approval/state/task-plan/seeded-template files as
out of scope.

## GREEN

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Result | Notes                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -ChangedFiles @('scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1','docs\05-execution-logs\task-plans\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md','docs\05-execution-logs\evidence\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md','docs\05-execution-logs\audits-reviews\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md') }"` | pass   | Mechanic repair scope and sensitive evidence scan passed. |
| `git diff --check -- scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 docs\05-execution-logs\task-plans\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md docs\05-execution-logs\evidence\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md docs\05-execution-logs\audits-reviews\2026-06-20-module-run-v2-mechanic-seed-transaction-scope.md`                                                                                                                                       | pass   | No whitespace errors in the mechanic repair files.        |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass   | ESLint completed with exit code 0.                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pass   | `tsc --noEmit` completed with exit code 0.                |

## Boundary

- No product runtime source changed.
- No provider/model call or provider configuration.
- No env, dependency, schema, migration, deploy, payment, PR, force-push, or Cost Calibration Gate work.
- Cost Calibration Gate remains blocked.
