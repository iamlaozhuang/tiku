# Module Run v2 Mechanic Unattended Readiness Lines Evidence

## Summary

Passed: mechanism-only repair validated.

The latest primary visible autopilot run (`tiku-module-run-v2-autopilot-2`) stopped before task claim because
`Test-ModuleRunV2UnattendedReadiness.ps1` rejected YAML line arrays containing blank lines. After that was fixed, the
same startup path exposed a second mechanism mismatch: pending pre-claim tasks declared evidence/audit paths but the
readiness gate required those files to already exist before the serial executor could claim the task.

Fixes:

- YAML line/block/pattern parser parameters in unattended readiness now allow empty strings and empty collections.
- Pending pre-claim tasks now require declared evidence/audit paths, but do not require those files to exist until after
  claim and work execution.
- Unattended readiness smoke covers blank YAML separator lines and pending pre-claim evidence/audit declaration.
- Run registry heartbeat writes and active mechanism state now use `tiku-module-run-v2-autopilot-2`.
- Smoke execution no longer writes default registry files into the real `%USERPROFILE%\.codex\tiku\automation-runs`
  location.
- Pre-commit hardening now recognizes bounded `mechanic_repair` scope instead of forcing mechanic fixes through the
  previous business task's allowed file list.

## Boundary

- Mechanism-only repair.
- No business implementation task was claimed or edited.
- No dependency, package, lockfile, env, secret, provider, schema, migration, Docker DB, deploy, payment, PR, force-push,
  or Cost Calibration Gate action was performed.
- Cost Calibration Gate remains blocked.

## RED

- Latest primary autopilot memory recorded serial readiness failure for
  `batch-101-authorization-and-access-authorization-read-model-and-display-contrac`:
  `Cannot bind argument to parameter 'Lines' because it is an empty string.`
- Reproduced locally:
  `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId batch-101-authorization-and-access-authorization-read-model-and-display-contrac`
  exited non-zero with `HARD_BLOCK_ERROR` and `unattendedStopDecision: stop_for_hard_block`.
- After the blank-line fix, a no-write probe reached task evaluation and exposed the pre-claim evidence/audit hard block
  for the pending seeded task.

## GREEN

After the repair:

- Focused unattended readiness smoke passed.
- Real no-write readiness probe for `batch-101` with an allowed scoped file passed:
  `unattendedStopDecision: continue`.
- Startup readiness found the next pending task.
- Dispatcher mapped the runner result to `agentAction: claim_task`.
- Serial executor dry run returned `serialExecutorDecision: ready_to_claim`.

## Validation Results

| Command                                                                                                                             | Result | Evidence                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`                                                                                     | pass   | `Module Run v2 unattended readiness smoke passed`                        |
| `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId batch-101... -ChangedFiles src/server/models/authorization-read-model.ts -NoWrite` | pass   | `unattendedStopDecision: continue`                                       |
| `Test-ModuleRunV2AutomationStartupReadiness.ps1 -SkipLeaseCheck`                                                                    | pass   | `startupDecision: prepare_next_task`                                     |
| `Invoke-ModuleRunV2AgentActionDispatcher.ps1 -RunnerOutputPath <temp>`                                                              | pass   | `agentAction: claim_task`                                                |
| `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -AgentActionOverride claim_task -AgentActionTaskOverride batch-101...`               | pass   | `serialExecutorDecision: ready_to_claim`                                 |
| `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-101...`                                                                 | pass   | `autodriveSchemaDecision: can_autodrive`                                 |
| `Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 3 -AllowAutoSeed ...`                                                              | pass   | `runnerDecision: prepare_next_task`, `runnerNextTask: batch-101...`      |
| `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`                                                                                 | pass   | `Module Run v2 agent action dispatcher smoke passed`                     |
| `Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                                              | pass   | `Module Run v2 automation startup readiness smoke passed`                |
| `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`                                                                                | pass   | `Module Run v2 stopped automation hygiene smoke passed`                  |
| `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`                                                                                       | pass   | `Module Run v2 autopilot runner smoke passed`                            |
| `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                                                                                | pass   | `Module Run v2 autodrive schema readiness smoke passed`                  |
| `Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`                                                                          | pass   | `Module Run v2 autodrive control-loop acceptance smoke passed`           |
| `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`                                                                                      | pass   | `Module Run v2 pre-commit hardening smoke passed`                        |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                            | pass   | `preCommitScopeMode: mechanic_repair`, `pre-commit hardening passed`     |
| `git diff --check`                                                                                                                  | pass   | no output                                                                |
| `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <changed files>`                                            | pass   | `All matched files use Prettier code style!`                             |
| `npm.cmd run lint`                                                                                                                  | pass   | passed after temporary `node_modules` junction to `D:\tiku\node_modules` |
| `npm.cmd run typecheck`                                                                                                             | pass   | passed after temporary `node_modules` junction to `D:\tiku\node_modules` |

Initial `npm.cmd run lint` and `npm.cmd run typecheck` attempts with only `D:\tiku\node_modules\.bin` on `PATH` failed
because package resolution still starts from the current worktree. No dependency install was performed; a temporary
junction to `D:\tiku\node_modules` was created and removed.

## Post-Merge Smoke Fixture Hardening

After fast-forward merging the first mechanism commit to local `master`, the focused unattended readiness smoke exposed a
second mechanism-only test fixture defect:

- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` expected
  `OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR master`.
- The fixture used repository `origin/master` state directly, so a legitimate local `master...origin/master [ahead 1]`
  closeout state made the post-closeout handoff case fail closed even though the readiness logic was healthy.

Follow-up repair:

- Added explicit `MasterShaOverride` and `OriginMasterShaOverride` test seams to the readiness script, matching existing
  branch and remote-ahead override patterns.
- Updated the smoke to use real local `HEAD`/`HEAD~1` SHAs as a synchronized repository fixture.
- Re-ran `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`: pass,
  `Module Run v2 unattended readiness smoke passed`.

## Accepted Checkpoint Readiness Alignment

The final next-autopilot takeover probe found one more mechanism gap before push:

- `Test-ModuleRunV2AutomationStartupReadiness.ps1 -AllowProtectedBranch -SkipLeaseCheck` accepted
  `repository.shaSemantics: accepted_ancestor_checkpoint` and returned `startupDecision: prepare_next_task`.
- The serial `Test-ModuleRunV2UnattendedReadiness.ps1` check for pending `batch-101` still required exact
  `lastKnownMasterSha` / `lastKnownOriginMasterSha` equality and hard-blocked with `HARD_BLOCK_REPOSITORY_SHA_DRIFT`.

Follow-up repair:

- `Test-ModuleRunV2UnattendedReadiness.ps1` now accepts repository SHA drift only when
  `shaSemantics: accepted_ancestor_checkpoint` is explicitly present and the recorded state SHA is a real Git ancestor
  of the current `master` or `origin/master`.
- Invalid or non-ancestor SHAs still hard-block.
- Added smoke coverage for a pending task under accepted ancestor checkpoint semantics.
- Re-ran the real no-write readiness probe for `batch-101`: pass,
  `OK_REPOSITORY_SHA_ANCESTOR_CHECKPOINT master`,
  `OK_REPOSITORY_SHA_ANCESTOR_CHECKPOINT origin/master`, and `unattendedStopDecision: continue`.

## Post-Commit Advisory Blank-Line Repair

The successful follow-up commit surfaced a non-blocking post-commit advisory defect:

- `Test-ModuleRunV2PostCommitReadiness.ps1` emitted
  `ADVISORY_ERROR Cannot bind argument to parameter 'Lines' because it is an empty string.`
- Root cause matched the original readiness failure: YAML files with blank separator lines were passed into helper
  parameters that did not allow empty string array elements.

Follow-up repair:

- Added empty-string and empty-collection tolerance to the post-commit advisory YAML helper parameters.
- Added smoke coverage with blank lines in temporary `project-state.yaml` and `task-queue.yaml` fixtures.
- Re-ran `Test-ModuleRunV2PostCommitReadiness.Smoke.ps1`: pass,
  `Module Run v2 post-commit readiness smoke passed`.
- Re-ran the real post-commit advisory: pass, `post-commit advisory completed`.

## Orphan Active Registry Cleanup Repair

The final startup proof after smoke validation found a stale cleanup lifecycle gap:

- Stopped-automation hygiene identified a stale clean worktree and removed the Git worktree registration, but a fresh
  `active` run registry with `cleanupPolicy: none` remained after the worktree became an unregistered empty directory.
- Startup could continue, but the mechanic closeout contract requires leaving no stale run registry for the next
  autopilot.

Follow-up repair:

- `Test-ModuleRunV2StoppedAutomationHygiene.ps1` now treats an `active`/`cleanupPolicy: none` registry as a safe cleanup
  candidate when its worktree path is inside the automation root, is not a registered Git worktree, and either is missing
  or has no Git metadata.
- Cleanup removes the orphan active registry and, when present, the paired non-Git orphan worktree directory.
- Added smoke coverage for a fresh active orphan registry with an unregistered worktree path.
- Re-ran `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`: pass,
  `Module Run v2 stopped automation hygiene smoke passed`.
- Ran real hygiene cleanup: removed the stale active run registry; current `runRegistryJsonCount=0`.
- Re-ran startup readiness: `startupDecision: prepare_next_task`.

## Next Autopilot Takeover

Current durable state is ready for the next primary autopilot startup:

- primary visible autopilot id: `tiku-module-run-v2-autopilot-2`
- primary visible mechanic id: `tiku-module-run-v2-mechanic-2`
- historical ids remain archival compatibility state only
- run registry count: `0`
- lease: missing
- handoff root: no active handoff blocker
- startup decision: `prepare_next_task`
- next expected action: task claim
- next task: `batch-101-authorization-and-access-authorization-read-model-and-display-contrac`
- dispatcher result: `agentActionDecision: ready`, `agentAction: claim_task`
- serial executor dry run: `ready_to_claim`
- pushed `origin/master`: `89c369f8308d2a2e401a718b796874576cc9d455`
- post-push stopped-automation hygiene: `stoppedAutomationHygieneDecision: clean`
- post-push startup readiness: `startupDecision: prepare_next_task`
- post-push Git status: `master...origin/master` with no staged, unstaged, or untracked repository files

Residual local state:

- `git worktree list` contains only `D:\tiku` at `89c369f8308d2a2e401a718b796874576cc9d455`.
- Empty non-Git directories remain under `C:\Users\jzzhu\.codex\worktrees\{0d5b,15eb,2660,34e4,827f}\tiku` because
  Windows held directory handles during cleanup. Each path has `count=0`, is not registered by `git worktree list`, and
  both stopped-automation hygiene and startup readiness report clean/non-blocking status.
