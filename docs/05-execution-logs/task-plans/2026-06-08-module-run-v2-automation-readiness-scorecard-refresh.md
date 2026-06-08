# Module Run v2 Automation Readiness Scorecard Refresh Plan

## Summary

Refresh the automation readiness scorecard after the first real Module Run v2 pilot and the new hook hardening work.

## Inputs

- `project-state.yaml`
- `task-queue.yaml`
- `advanced-edition-domain-module-run-matrix.yaml`
- hook hardening evidence and audit reviews
- authorization pilot evidence and audit review

## Evaluation

- Score pre-work, pre-edit, pre-commit, post-commit, pre-push, and module-closeout implementation readiness.
- Keep `automation.mode` as `local_auto_candidate`.
- Record warnings that still require explicit task approval and redacted evidence.
- Keep `ai-task-and-provider` as nextModuleRunCandidate proposal only.

## Validation

- `git diff --check`
- scoped Prettier write/check
- anchor check for `local_auto_candidate`, `ready_with_warnings`, `nextModuleRunCandidate`, and Cost Calibration Gate
  blocked wording
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
