# Module Run v2 Orphan Worktree Cleanup Hardening Evidence

Status: validated

Batch range: Module Run v2 orphan worktree cleanup hardening.

Commit: `0cb9300b4a359e464247a25096f8ed7868c3cb82` is the pre-task base checkpoint; final closeout commit is produced
after this evidence is finalized.

## Scope

Mechanism-only hardening for stopped-automation hygiene after partial `git worktree remove` cleanup. The goal is to make
cleanup converge instead of missing unregistered orphan automation worktree directories.

## Authorization Boundary

The user authorized organizing and executing a serial mechanism task to fix all remaining Module Run v2 control-loop
card points found during self-check. Approved actions are limited to local mechanism scripts, smoke tests,
SOP/state/schema/index updates, evidence, audit review, paused automation prompt alignment, safe cleanup of detected
automation-root residue through the governed hygiene script, local commit, fast-forward merge to `master`, push
`origin/master`, and short-branch cleanup after validation.

Forbidden without fresh explicit approval remains blocked: product implementation, dependency/package/lockfile changes,
env/secret writes, real provider calls, real local Docker DB operations, project material/paper/paper_asset resource
reads for tests, schema/migration, e2e, staging/prod/cloud/deploy, payment, external-service, PR/force push,
destructive DB operation, and Cost Calibration Gate execution.

## RED

- RED: `git worktree remove --force` failed on `C:\Users\jzzhu\.codex\worktrees\cph1\tiku` with `Directory not empty`.
  Git worktree registration was removed, but the directory remained without `.git` metadata.
- RED: the following read-only hygiene pass reported `stoppedAutomationHygieneDecision: clean` for the orphaned state
  because the directory was no longer in `git worktree list`.
- RED: a first orphan cleanup attempt hit a Windows `Remove-Item` `NullReferenceException` while removing a reparse
  point, making recursive cleanup non-robust for `node_modules` links.

## GREEN

- GREEN: stopped-automation hygiene now detects `orphan_worktree_directory` under the configured automation worktree
  root when the directory is no longer registered by Git, is not the current worktree, has no `.git` metadata, and looks
  like automation worktree residue.
- GREEN: orphan directories that still contain Git metadata hard-block for manual inspection.
- GREEN: cleanup uses a reparse-point-aware helper so directory links are removed without traversing targets.
- GREEN: smoke coverage now creates an orphan worktree fixture with a `node_modules` junction when supported and verifies
  dry-run detection plus cleanup.
- GREEN: real cleanup removed orphan automation worktree directories and expired missing-worktree registry residue. A
  follow-up hygiene summary returned `stoppedAutomationHygieneDecision: clean`.
- GREEN: startup readiness now returns `startupDecision: no_executable_task` instead of cleanup recovery after cleanup
  convergence.
- GREEN: paused Codex automation prompt now names `orphan_worktree_directory` and remains `status = "PAUSED"`.
- GREEN: local `node_modules` command shims and missing Babel package contents were restored from existing local package
  copies after cleanup exposed a broken local toolchain. No `package.json`, lockfile, dependency version, or install
  command changed durable repository state.

## Validation Results

Passed:

| Command                                                                                               | Result                     | Notes                                                                                                                              |
| ----------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`                                                  | pass                       | Verified orphan detection and cleanup, including reparse-point-aware path where supported.                                         |
| `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`                                           | pass                       | Before cleanup, detected orphan candidates; after cleanup, returned `stoppedAutomationHygieneDecision: clean`.                     |
| `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup -SummaryOnly`                                  | pass                       | Cleaned orphan automation worktree directories and expired active missing-worktree registry residue through the governed script.   |
| `Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                      | pass                       | Returned `no_executable_task` after cleanup before task registration, then `continue_current_task` after this task was registered. |
| `automation_update` for `tiku-module-run-v2-autopilot`                                                | pass                       | Prompt updated with orphan cleanup guidance and remained paused.                                                                   |
| `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`                                                    | pass                       | Task scope, allowed files, blocked files, and validation commands accepted.                                                        |
| `Test-ModuleRunV2AutodriveSchemaReadiness.ps1`                                                        | pass                       | `autodriveSchemaDecision: can_autodrive`; lifecycle command count 14.                                                              |
| `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`                                                  | pass                       | `autodriveAcceptanceDecision: accepted_with_guardrails`.                                                                           |
| `npm.cmd run lint`                                                                                    | pass                       | ESLint completed after local `.bin` and missing Babel package contents were restored without repository dependency changes.        |
| `npm.cmd run typecheck`                                                                               | pass                       | `tsc --noEmit` completed successfully.                                                                                             |
| `git diff --check`                                                                                    | pass                       | No whitespace errors.                                                                                                              |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...`                                           | pass                       | Scoped docs/state formatting completed.                                                                                            |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                           | pass                       | Touched docs/state files are formatted.                                                                                            |
| `Select-String ... orphan_worktree_directory ...`                                                     | pass                       | Required mechanism anchors are present.                                                                                            |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-orphan-worktree-cleanup-hardening` | pass after evidence update | Closeout readiness checks evidence structure and task validation records.                                                          |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                  | pass                       | Git readiness inventory completed; dirty files are task-scoped and unstaged before closeout.                                       |

## localFullLoopGate

localFullLoopGate: passed through stopped-automation hygiene smoke, real hygiene cleanup and clean recheck, startup
readiness, autodrive schema readiness, control-loop acceptance, lint, typecheck, diff, and formatting gates.

## threadRolloverGate

threadRolloverGate: no new Codex thread was created. The paused automation prompt still requires durable state recovery
and the Codex thread bridge before any thread creation or continuation.

## nextModuleRunCandidate

nextModuleRunCandidate: after this closeout, the next safe state is idle guardian startup. If the paused automation is
explicitly unpaused, it should start with startup readiness, see no stale cleanup candidates, and either continue an
approved current task or idle when no executable task exists.

## Local Toolchain Repair Note

The first attempted orphan cleanup exposed local `node_modules` damage: npm scripts could not find `.bin` shims, and
`@babel/core` / related Babel package contents were missing from the local pnpm tree. The repair was limited to ignored
local `node_modules` files:

- recreated minimal `.bin` shims for `eslint`, `tsc`, `prettier`, and `lint-staged`;
- restored `@babel/core@7.29.0` from an existing local Antigravity package copy;
- restored exact-version Babel packages from an existing local `D:\Vedio2Pic\node_modules` copy;
- did not run dependency installation;
- did not change `package.json`, `pnpm-lock.yaml`, or any lockfile.

## Blocked Remainder

Cost Calibration Gate remains blocked. Env/secret/provider calls, real local Docker DB operations, project
material/paper/paper_asset reads for tests, schema/migration, e2e, dependency/package/lockfile changes, deploy,
payment, external-service, destructive DB operations, PR, and force push remain blocked without fresh explicit approval.
