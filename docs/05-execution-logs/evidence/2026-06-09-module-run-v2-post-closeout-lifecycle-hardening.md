# Module Run v2 Post-Closeout Lifecycle Hardening Evidence

Status: validated

Batch range: Module Run v2 post-closeout lifecycle hardening.

Commit: `fa00ad4b0978dcc0a9a85ff6d479549e6071c816` is the pre-closeout base checkpoint; final closeout commit is produced
after this evidence is recorded.

## Scope

Mechanism-only hardening for post-closeout lifecycle, accepted ancestor checkpoints, startup/recovery loop decisions,
compact hygiene summaries, validation lifecycle metadata, source-of-truth alignment, and paused automation guidance.

## Authorization Boundary

The user authorized organizing and executing a serial task to fix the identified Module Run v2 mechanism gaps. Approved
actions are limited to local mechanism scripts, smoke tests, SOP/state/schema/index updates, evidence, audit review,
paused automation prompt alignment, local commit, fast-forward merge to `master`, push `origin/master`, and short-branch
cleanup after validation.

Forbidden without fresh explicit approval remains blocked: product implementation, dependency/package/lockfile changes,
env/secret writes, real provider calls, real local Docker DB operations, project material/paper/paper_asset resource
reads for tests, schema/migration, e2e, staging/prod/cloud/deploy, payment, external-service, PR/force push,
destructive DB operation, and Cost Calibration Gate execution.

## RED

- RED: `Invoke-ModuleRunV2PostCloseoutStateReconcile.ps1 -Execute` previously wrote current `master`/`origin/master`
  and `currentTask.commitSha` into committed `project-state.yaml`, creating a self-referential SHA invariant that becomes
  stale after the state commit.
- RED: `Test-ModuleRunV2AutomationStartupReadiness.ps1` previously returned `startupDecision: closeout_recovery` for a
  clean closed task with no pending successor, causing unnecessary recovery loops.
- RED: `Invoke-ModuleRunV2RecoverySelfRepair.ps1` still modeled accepted post-closeout drift as
  `reconcile_post_closeout_state_sha`, a writable repair.
- RED: stopped automation hygiene and branch hygiene could emit long per-artifact reports during scheduled wakeups.
- RED: `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1` treated all `validationCommands` as runnable validation, so
  pre-edit entry gates could be rerun after implementation or closeout.
- RED: branch hygiene could classify the current working `codex/` branch as a cleanup candidate when its branch ref was
  still an ancestor of `master`.

## GREEN

- GREEN: post-closeout state now uses `accepted_ancestor_checkpoint` semantics. Dry-run returns
  `checkpoint_accepted`; `-Execute` returns `checkpoint_confirmed` without writing self-referential state SHAs.
- GREEN: startup now emits `startupStateCheckpoint: accepted_ancestor_checkpoint` as a warning, not a repair loop.
  Clean closed/no-pending state returns `startupDecision: no_executable_task`.
- GREEN: recovery self-repair now uses `repairAction: confirm_post_closeout_checkpoint` and treats
  `no_executable_task` as `continue_without_repair`.
- GREEN: stopped automation hygiene and branch hygiene support `-SummaryOnly`; branch hygiene skips the current branch.
- GREEN: `validationCommandLifecycle` is supported by schema readiness, serial validation, closeout readiness, SOPs, and
  the current task. `pre_edit` is entry evidence only; `post_edit` and `closeout` are runnable completion validation.
- GREEN: the paused Codex automation `tiku-module-run-v2-autopilot` was updated and remains `status = "PAUSED"`.

## Validation Results

Passed:

| Command                                                                                                                                                      | Result | Notes                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-post-closeout-lifecycle-hardening`                                                   | pass   | Task scope, allowed files, blocked files, risk types, and plan/evidence/audit paths accepted.                      |
| `Invoke-ModuleRunV2PostCloseoutStateReconcile.Smoke.ps1`                                                                                                     | pass   | Verified `checkpoint_accepted`, `checkpoint_confirmed`, and no dirty worktree after `-Execute`.                    |
| `Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                                                                       | pass   | Verified `no_executable_task` for closed/no-pending and checkpoint warnings without reconcile recommendation.      |
| `Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`                                                                                                             | pass   | Verified `confirm_post_closeout_checkpoint` and idle no-task behavior.                                             |
| `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`                                                                                                         | pass   | Verified `-SummaryOnly` suppresses detailed cleanup candidate lines.                                               |
| `Test-ModuleRunV2BranchHygiene.Smoke.ps1`                                                                                                                    | pass   | Verified `-SummaryOnly` and current-branch skip behavior.                                                          |
| `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`                                                                                                        | pass   | Verified lifecycle-aware validation skips `pre_edit` and legacy commands when lifecycle metadata exists.           |
| `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                                                                                                         | pass   | Verified `validationLifecycleCommandCount` and lifecycle phase validation.                                         |
| `Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`                                                                                                          | pass   | Verified closeout readiness checks only `post_edit`/`closeout` lifecycle commands.                                 |
| `Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`                                                                                                               | pass   | Verified approved closeout now prints `postCloseoutStateCheckpoint: accepted_ancestor_checkpoint`.                 |
| `Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`                                                                                                   | pass   | Acceptance smoke passed.                                                                                           |
| `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`                                                                                                         | pass   | `autodriveAcceptanceDecision: accepted_with_guardrails`.                                                           |
| `Test-ModuleRunV2AutomationStartupReadiness.ps1`                                                                                                             | pass   | Current real startup returns `cleanup_stale_artifacts`; this is now a bounded self-repair route, not a hard block. |
| `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`                                                                                                  | pass   | Current real summary: hard blocks 0, cleanup candidates 89, compact grouped output.                                |
| `Test-ModuleRunV2BranchHygiene.ps1 -SummaryOnly`                                                                                                             | pass   | Current real summary: merged candidates 3, unmerged review 1, current branch skipped.                              |
| `Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 2`                                                                                                | pass   | Current runner decision is `cleanup_available`, next action `run_stopped_automation_hygiene_cleanup`.              |
| `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-post-closeout-lifecycle-hardening`                                                       | pass   | `autodriveSchemaDecision: can_autodrive`; lifecycle command count 22.                                              |
| `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -AgentActionOverride run_validation -AgentActionTaskOverride module-run-v2-post-closeout-lifecycle-hardening` | pass   | `validationLifecycleMode: phase_filtered`; command safety passed for post-edit/closeout commands.                  |
| `Test-ModuleRunV2UnattendedReadiness.ps1 -NoWrite -CloseoutRecovery -SkipRemoteAheadCheck`                                                                   | pass   | `runRegistryHeartbeat: skipped_no_write`; `unattendedStopDecision: continue`.                                      |
| `npm.cmd run lint`                                                                                                                                           | pass   | ESLint completed successfully.                                                                                     |
| `npm.cmd run typecheck`                                                                                                                                      | pass   | `tsc --noEmit` completed successfully.                                                                             |
| `git diff --check`                                                                                                                                           | pass   | No whitespace errors.                                                                                              |
| `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown ...`                                                                                 | pass   | Scoped prettier write completed.                                                                                   |
| `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...`                                                                                 | pass   | All matched docs/state files use Prettier code style.                                                              |
| `Select-String ... -Pattern 'accepted_ancestor_checkpoint','checkpoint_accepted','no_executable_task','SummaryOnly'...`                                      | pass   | Required mechanism anchors are present.                                                                            |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                         | pass   | Git readiness inventory completed; dirty files are task-scoped and unstaged before closeout.                       |

Automation prompt verification:

- `automation_update` updated `tiku-module-run-v2-autopilot` in place.
- The automation remains paused: `status = "PAUSED"`.
- Prompt now names `confirm_post_closeout_checkpoint`, `checkpoint_accepted`, `checkpoint_confirmed`,
  `validationCommandLifecycle`, and `-SummaryOnly`.
- Old writable `reconcile_post_closeout_state_sha` / `ready_to_reconcile` behavior is no longer the prompt contract.

## localFullLoopGate

localFullLoopGate: passed through targeted smokes, control-loop acceptance, schema readiness, serial validation safety,
startup readiness, unattended no-write readiness, lint, typecheck, and diff checks.

## threadRolloverGate

threadRolloverGate: no new Codex thread was created. The paused automation prompt still requires the thread bridge and
redacted handoff before any agent-layer `create_thread` or `send_message_to_thread` action.

## nextModuleRunCandidate

nextModuleRunCandidate: after this mechanism closeout, the next safe action is to let the paused automation remain
paused or explicitly unpause it for one guardian-first wakeup. Any real DB/resource/provider/env/e2e/schema task still
requires task-specific capability approval.

## Blocked Remainder

Cost Calibration Gate remains blocked. Env/secret/provider calls, real local Docker DB operations, project
material/paper/paper_asset reads for tests, schema/migration, e2e, dependency/package/lockfile changes, deploy,
payment, external-service, destructive DB operations, PR, and force push remain blocked without fresh explicit approval.
