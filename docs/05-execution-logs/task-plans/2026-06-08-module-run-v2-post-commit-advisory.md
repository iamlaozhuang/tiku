# Module Run v2 Post-Commit Advisory Plan

## Summary

Add a post-commit advisory hook that records the last commit, changed-file inventory, and task evidence/audit inventory.

## Implementation

- Add `.husky/post-commit` that invokes `Test-ModuleRunV2PostCommitReadiness.ps1` and never blocks commit completion.
- Add a PowerShell advisory script that falls back to `project-state.yaml` currentTask when TaskId is omitted.
- Compare changed files in the last commit with current task allowed/blocked scope and print advisory findings only.
- Add a smoke test for the advisory output shape.

## Validation

- `Test-ModuleRunV2PostCommitReadiness.Smoke.ps1`
- `git diff --check`
- scoped Prettier write/check with `--ignore-unknown`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
