# Module Run v2 Closeout Strictness Hardening Plan

## Summary

Strengthen `Test-ModuleRunV2ModuleCloseoutReadiness.ps1` so Module Run v2 closeout checks more than generic anchors.

## Implementation

- Read `moduleRunVersion` from the active queue task.
- For Module Run v2 evidence, require Batch evidence, RED and GREEN test records, Batch commit records,
  localFullLoopGate, blocked-remainder wording, threadRolloverGate, nextModuleRunCandidate, validation anchors, and
  approved audit review.
- Keep existing path, Cost Calibration Gate, validation, and audit approval checks.
- Update smoke tests to pass against the real authorization pilot evidence and fail when Batch evidence is missing.

## Validation

- `Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `git diff --check`
- scoped Prettier write/check with `--ignore-unknown`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
