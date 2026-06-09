# Module Run v2 Idle And Hygiene Hardening Audit Review

## Verdict

APPROVE for local mechanism hardening.

After validation, the user approved local commit, fast-forward merge to `master`, push `origin/master`, and cleanup of
this short-lived local branch if suitable. Suitability checks passed, so this review approves that exact Git closeout
path.

This review does not approve unrelated branch cleanup, unrelated run-registry cleanup, worktree cleanup, scheduled
automation unpause, product implementation, dependency changes, env/secret work, provider calls, real local Docker DB
operations, project resource reads for tests, schema/migration, e2e, deploy, payment, external-service actions, PR
creation, force push, or Cost Calibration Gate execution.

## Scope Review

Changed scope is limited to:

- Module Run v2 readiness, hygiene, schema, candidate, local capability, thread bridge, and autopilot helper scripts;
- smoke fixture updates needed by the changed candidate wording;
- automation SOP, durable schema, source-of-truth index, project state, task queue, task plan, evidence, and audit review.

No `package.json`, lockfile, env file, product source, schema, migration, e2e, material, `paper`, or `paper_asset` file
was changed.

## Findings

No blocking findings.

## Safety Review

- Terminal tasks now return explicit idle diagnostics instead of executable readiness signals.
- Expired active registry cleanup is narrower than broad worktree cleanup: `expired_active_terminal_registry` removes
  only the registry file and only when the task is terminal or missing from the active queue, the worktree is not dirty,
  and no redacted handoff is attached.
- Startup branch hygiene is advisory only and does not delete branches.
- Local tooling readiness is diagnostic only and does not install dependencies.
- Local Docker DB capability was checked only as an adapter declaration; no DB operation was executed.
- Thread launch policy and bridge were checked in same-thread mode and did not create a thread.

## Evidence Review

Evidence records RED/GREEN, validation outputs, cleanup deferral, branch cleanup deferral, and the runner pre-evidence
gate behavior. It also records that Cost Calibration Gate remains blocked.

Final evidence records lint, typecheck, formatting, diff, and anchor checks.

## Residual Risk

The current run registry still contains historical cleanup candidates and one interactive heartbeat from the diagnostic
runner call. Startup currently ignores the interactive primary-worktree heartbeat and continues the current task. Cleanup
should remain a separate approved action.

## Closeout Boundary

The durable task `closeoutPolicy` is now:

- local commit approved;
- fast-forward merge to `master` approved;
- push to `origin/master` approved;
- current short-lived local branch deletion approved;
- worktree cleanup not approved.

The next safe action after final validation is to execute that exact closeout path and report the resulting commit and
push state in the final handoff.
