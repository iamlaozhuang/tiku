# Module Run v2 Start Gate Hardening Plan

## Summary

Turn `Test-ModuleRunV2WorkReadiness.ps1` from report-only startup advice into a hard startup gate for Module Run v2
pre-work and pre-edit checks.

## Implementation

- Require an explicit `-TaskId`; do not fall back to stale `currentTask`.
- Block protected branch work for `master` and `main`.
- Require the task to exist in `task-queue.yaml` and have status `pending` or `in_progress`.
- Require evidence and audit review path values.
- Resolve the task plan path from `project-state.yaml` when the TaskId is current, otherwise from allowed task-plan files;
  require the plan file to exist before code-stage edits.
- In `pre-edit`, require planned files and hard-block files outside allowed scope or inside blocked scope.
- Update the smoke test to prove missing TaskId, completed task, and blocked planned files fail.

## Validation

- `Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- `git diff --check`
- scoped Prettier write/check
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
