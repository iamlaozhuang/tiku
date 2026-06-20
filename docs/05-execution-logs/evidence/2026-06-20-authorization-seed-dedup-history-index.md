# Authorization Seed Dedup History Index Evidence

## Summary

Task `mechanism-authorization-seed-dedup-history-index` repaired Module Run v2 implementation seed proposal selection so
completed authorization batches recorded in `task-history-index.yaml` and matrix `currentProgress.completedBatches` are
treated as completed/occupied work.

The real local proposal now skips `authorization-and-access` and proposes `ai-task-and-provider` starting at `batch-212`.

## Scope

- Changed `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`.
- Added seed proposal smoke coverage for archived `entries:` plus matrix `completedBatches`.
- Added next-action smoke coverage for the same de-dup path.
- Updated project-state/task-queue records and this evidence/audit trail.

## RED

`powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1`
failed before implementation with:

- `A parameter cannot be found that matches parameter name 'TaskHistoryIndexPath'.`

This proved the smoke covered the missing history-index path.

## GREEN

After implementation:

| Command                                                                                                                                                                                                                        | Result | Notes                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1`                                                                                           | pass   | Seed proposal smoke passed.                                                                                                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`                                                                                                                  | pass   | Next-action diagnostic smoke passed.                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`                                                                                                   | pass   | Seed transaction smoke passed.                                                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1 -TaskId active-queue-slimming-2026-06-20-batch-08 -MaxBatchCount 8`                              | pass   | Real proposal reports `seedModuleAlreadyComplete: authorization-and-access` and `seedModule: ai-task-and-provider`; candidate tasks start at `batch-212`. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1 -TaskId active-queue-slimming-2026-06-20-batch-08 -MaxBatchCount 8 -ApprovalStatement "...plan-only..."` | pass   | Plan-only seed transaction proposed `ai-task-and-provider`; no queue mutation was applied.                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`                                                                                                        | pass   | Current task was active during validation; next-action correctly reported closeout needed.                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory` after task closeout                                                                                    | pass   | Final next action is `request_auto_seed_approval:ai-task-and-provider`.                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1 -TaskId mechanism-authorization-seed-dedup-history-index -MaxBatchCount 8`                       | pass   | Final proposal still reports `seedModuleAlreadyComplete: authorization-and-access` and `seedModule: ai-task-and-provider`.                                |
| `npm.cmd run lint`                                                                                                                                                                                                             | pass   | ESLint completed with exit code 0.                                                                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                        | pass   | `tsc --noEmit` completed with exit code 0.                                                                                                                |
| `git diff --check`                                                                                                                                                                                                             | pass   | No whitespace errors.                                                                                                                                     |

## Boundary

- No `.env*` read or edit.
- No provider/model call or provider configuration.
- No schema, migration, drizzle, package, lockfile, dependency, deploy, payment, PR, force-push, or Cost Calibration Gate work.
- No product runtime source under `src/` changed.

## Next Action

After this task is closed, `Get-TikuNextAction.ps1` should surface the next seed approval as
`request_auto_seed_approval:ai-task-and-provider`, not `authorization-and-access`.
