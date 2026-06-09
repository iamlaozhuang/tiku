# Module Run v2 Post-Done Closeout Authorization Adoption Plan

## Task

- Task id: `module-run-v2-post-done-closeout-authorization-adoption`
- Task kind: `implementation`
- Approval: User explicitly requested a mechanism repair first, then automatic closeout of the current branch. User
  authorized committing work results, fast-forward merging to `master`, pushing to `origin/master`, and branch/worktree
  cleanup during mechanism operation.

## Recovery Context

- Current branch: `codex/module-run-v2-ai-task-lifecycle-local-contract`.
- Carried completed task: `module-run-v2-ai-task-lifecycle-local-contract`.
- Blocker: the completed task is already `done`; `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit` blocks editing that
  done task to backfill closeout approval.

## Goal

Add a narrow mechanism path that lets approved closeout scripts adopt a fresh user closeout authorization statement for a
completed dirty task without mutating that completed task's `humanApproval` field.

## Implementation Steps

1. Add failing smoke coverage for `-CloseoutAuthorizationStatement` on approved closeout and autopilot closeout recovery.
2. Extend `Invoke-ModuleRunV2ApprovedCloseout.ps1` to accept a redacted authorization statement and treat it as the
   approval source only when it explicitly contains commit, merge, push, and cleanup/parking language.
3. Extend `Test-ModuleRunV2UnattendedReadiness.ps1` and `Invoke-ModuleRunV2Autopilot.ps1` to pass that authorization
   statement into approved closeout during `-CloseoutRecovery`.
4. Validate the carried task remains task-scoped, then run focused smoke tests, carried task tests, lint, typecheck,
   diff check, scoped prettier, module closeout readiness, and Git readiness.
5. Run autopilot closeout recovery with the authorization statement so the current branch is committed, fast-forward
   merged to `master`, pushed to `origin/master`, and cleaned/parked by the existing approved closeout path.

## Stop Conditions

Stop if the repair requires env/secret, provider, dependency/package/lockfile, schema/migration, API/UI/e2e, deploy,
payment, external-service, Cost Calibration Gate execution, force push, non-fast-forward merge, or editing files outside
the task scope.

Cost Calibration Gate remains blocked.
