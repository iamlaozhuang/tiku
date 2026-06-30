# 2026-06-30 UI Token Layout Small Repair Acceptance

## Acceptance Criteria

- The task plan is created before any UI source or test edit.
- State and queue materialize the task scope, branch, allowed files, blocked files, boundaries, validation commands, evidence redaction, and closeout policy.
- A focused static unit test is added before source repair and fails for the current duplicated modal-shell condition.
- The source repair is limited to a single low-risk UI token/layout extraction.
- Local validation passes before commit, merge, push, and short-branch cleanup.

## Acceptance Status

- Task plan before UI source/test edit: pass.
- State and queue materialization: pass.
- RED focused static guard before source repair: pass.
- GREEN focused static guard after source repair: pass.
- Source repair completed: pass.
- Package/lockfile/dependency changes: none.
- DB, Provider/AI, browser/e2e, release readiness, final Pass, and Cost Calibration actions: none.
- Sensitive evidence capture: none recorded.
- Local governance validation: focused unit guard, lint, typecheck, format, diff check, blocked-path diff, and Module Run v2 final gates passed.

## Result

- UI token/layout small repair passed with the repeated admin resource confirmation modal shell extracted into one local component and covered by a focused static unit guard.

## Boundaries

- No deployment, staging/prod/cloud access, release readiness, final Pass, Cost Calibration, Provider/AI execution, DB access/mutation, browser/e2e runtime, dependency change, PR, or force-push action was performed.
