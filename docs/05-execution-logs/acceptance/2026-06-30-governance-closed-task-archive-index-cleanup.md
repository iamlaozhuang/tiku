# 2026-06-30 Governance Closed Task Archive Index Cleanup Acceptance

## Acceptance Criteria

- The task plan is created before archive/index cleanup.
- State and queue materialize the task scope, branch, allowed files, blocked files, boundaries, validation commands, evidence redaction, and closeout policy.
- The queue cleanup confirms a current governance gap before moving task blocks.
- Only terminal task blocks outside the recovery window are moved.
- Every moved task id has a history-index entry.
- Local validation passes before commit, merge, push, and short-branch cleanup.

## Acceptance Status

- Task plan before archive/index cleanup: pass.
- State and queue materialization: pass.
- Governance gap confirmation: pass.
- Terminal-only archive movement: pass.
- History-index entries for moved task ids: pass.
- Package/lockfile/dependency/source/test changes: none.
- DB, Provider/AI, browser/e2e, release readiness, final Pass, and Cost Calibration actions: none.
- Sensitive evidence capture: none recorded.
- Local governance validation: scoped formatting, diff checks, blocked-path diff, and Module Run v2 gates passed.

## Result

- Governance closed task archive/index cleanup passed with eligible terminal task blocks moved to the June archive and indexed.

## Boundaries

- No deployment, staging/prod/cloud access, release readiness, final Pass, Cost Calibration, Provider/AI execution, DB access/mutation, browser/e2e runtime, dependency change, PR, or force-push action was performed.
