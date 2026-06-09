# Module Run v2 Approved Closeout Clean Ahead Support Evidence

## Scope

- taskId: `module-run-v2-approved-closeout-clean-ahead-support`
- branch: `codex/module-run-v2-stale-clean-worktree-autocleanup-routing`
- approval: user approved strengthening approved closeout for clean-ahead branches, then executing approved closeout with fast-forward merge to `master`, push `origin/master`, short-lived branch cleanup, and automation worktree parking.

## Initial Finding

- RED: `Invoke-ModuleRunV2ApprovedCloseout.ps1` stopped with `Approved closeout found no changed files.` even though the branch was clean and ahead of `master` by committed task work.

## Implementation Summary

- Batch range: single local mechanism hardening batch for task
  `module-run-v2-approved-closeout-clean-ahead-support`.
- Commit: `06164af2b810bc1c1e50e7c837544db092d3b673` was the recovered branch baseline before this task.
- Added `branchCommitsAhead` detection to approved closeout.
- Allowed the approved closeout path to continue when the worktree is clean and the short-lived branch has committed work ahead of the base branch.
- Preserved the previous hard stop for clean branches with no commits ahead.
- Extended smoke coverage with a clean-ahead branch fixture.

## Validation Log

Passed: scoped approved closeout clean-ahead validation completed.

| Command                                                                                                                                                                                                         | Result  | Notes                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-approved-closeout-clean-ahead-support -PlannedFiles ...` | pass    | Planned files matched allowed files.                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 ... -SkipRemoteAheadCheck`                                                              | pass    | Changed files matched allowed files.                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`                                                                                   | pass    | Covers dirty closeout and clean-ahead closeout.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                 | pass    | Returned `continue_current_task`.                                                        |
| `npm.cmd run lint`                                                                                                                                                                                              | pass    | ESLint passed.                                                                           |
| `npm.cmd run typecheck`                                                                                                                                                                                         | pass    | TypeScript `tsc --noEmit` passed.                                                        |
| `git diff --check`                                                                                                                                                                                              | pass    | No whitespace errors.                                                                    |
| `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown ...`                                                                                                                                    | pass    | Scoped prettier write completed.                                                         |
| `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...`                                                                                                                                    | pass    | Scoped prettier check passed.                                                            |
| `Select-String -Path ... -Pattern 'cleanAheadBranch',...`                                                                                                                                                       | pass    | Required clean-ahead closeout anchors present.                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-approved-closeout-clean-ahead-support`                        | blocked | First run correctly blocked on missing evidence anchors for closeout and git completion. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-approved-closeout-clean-ahead-support`                        | pass    | Rerun passed after evidence recorded all declared validation anchors.                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                             | pass    | GitCompletionReadiness inventory completed before local commit.                          |

GREEN: `Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1` passed after adding `cleanAheadBranch` and `branchCommitsAhead` handling.

localFullLoopGate: skipped by design for this mechanism-only task; product runtime, providers, DB, e2e, and external services remain blocked.

threadRolloverGate: no rollover required before approved closeout execution.

nextModuleRunCandidate: after approved closeout, rerun startup readiness and closeout recovery/dry-run handoff before selecting the next queue task.

## Blocked Remainder

PR creation, force push, deploy, env/secret, provider, dependency, schema/migration, e2e, and Cost Calibration Gate execution remain blocked.

Cost Calibration Gate remains blocked.
