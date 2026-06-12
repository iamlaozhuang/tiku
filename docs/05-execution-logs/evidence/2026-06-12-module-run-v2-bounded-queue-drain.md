# Module Run v2 Bounded Queue Drain Evidence

## Scope

Implement bounded queue drain P0/P1 mechanism tuning for low-risk Module Run v2 automation.

## Constraints

- Cost Calibration Gate remains blocked.
- Local automation TOML remains unchanged.
- No product code, dependency, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, or PR/force-push change.

## TDD Log

- RED:
  - `Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1` failed with missing `Test-ModuleRunV2QueueDrainEligibility.ps1`.
  - `Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1` failed with missing `Invoke-ModuleRunV2QueueDrainSupervisor.ps1`.
- GREEN:
  - Added queue drain eligibility gate.
  - Added queue drain supervisor with repo-external manifest and bounded stop decisions.
  - Added schema/SOP/manual/source-of-truth/acceptance registration.

## Validation Results

| Command                                                                                                                             | Result            | Notes                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`    | pass              | Covers eligible, missing policy, product-code single-task, high-risk conflict, fresh approval.  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`   | pass              | Covers PlanOnly next task, budget exhaustion, hard block, repeated blocker manifest handling.   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1` | pass              | Acceptance now records `queueDrainBoundary`.                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`        | pass              | Existing runner behavior remains compatible.                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`  | pass              | Existing dispatcher behavior remains compatible.                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` | pass              | Existing schema readiness behavior remains compatible.                                          |
| `npm.cmd run lint`                                                                                                                  | pass              | ESLint completed.                                                                               |
| `npm.cmd run typecheck`                                                                                                             | pass              | `tsc --noEmit` completed.                                                                       |
| `npm.cmd run format:check`                                                                                                          | pass              | Initial Markdown formatting warning was fixed, then final check passed.                         |
| `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown ...`                                                        | pass              | Formatted task plan, evidence, and audit review.                                                |
| `git diff --check`                                                                                                                  | pass              | No whitespace errors.                                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                          | expected exit `1` | Registration mismatch remains the human activation boundary; dirty worktree reflects this task. |

## Closeout Notes

- productClosureContribution: none; mechanism budget item.
- localFullLoopGate: mechanism.
- threadRolloverGate: continue_current_thread.
- nextModuleRunCandidate: batch-114-personal-learning-ai-local-e2e-smoke-planning after this mechanism task closes.
- Cost Calibration Gate remains blocked.

## Follow-up Review Fix Log

Review found three gaps before closeout:

- Eligibility task parsing could truncate a task block at nested task-local `- id:` entries.
- Queue drain changed-line budget counted unstaged diff only, missing staged diff and untracked file content.
- Closeout recovery PlanOnly output could omit `queueDrainNextTask` when runner output omitted `runnerNextTask`.

TDD RED evidence:

- `Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1` failed on the new nested `- id:` fixture with `drainEligible task has no allowedFiles`.
- `Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1` failed on the new closeout fixture because output lacked `queueDrainNextTask: closed-task`.

Fixes applied:

- `Test-ModuleRunV2QueueDrainEligibility.ps1` now splits only top-level tasks under `tasks:` using the first task item indentation, so nested list IDs remain inside the owning task block.
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` now counts unstaged numstat, staged numstat, and untracked file lines for `MaxChangedLines`; unreadable untracked files hard-stop through an overflow line count.
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` now resolves closeout target task from project-state `currentTask.id` when runner output omits `runnerNextTask`.

Follow-up validation:

| Command                                                                                                                             | Result            | Notes                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`    | pass              | Includes nested task-local `- id:` regression.                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`   | pass              | Includes closeout task fallback plus staged/untracked changed-line budget regressions.        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1` | pass              | Acceptance still records bounded queue drain boundary.                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` | pass              | Schema readiness remains compatible.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`        | pass              | Runner compatibility retained; fixture branch messages are from temporary smoke repositories. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`  | pass              | Dispatcher compatibility retained.                                                            |
| `npm.cmd run lint`                                                                                                                  | pass              | ESLint completed.                                                                             |
| `npm.cmd run typecheck`                                                                                                             | pass              | `tsc --noEmit` completed.                                                                     |
| `npm.cmd run format:check`                                                                                                          | pass              | Prettier check completed.                                                                     |
| `git diff --check`                                                                                                                  | pass              | No whitespace errors.                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                          | expected exit `1` | Registration mismatch and dirty worktree remain expected manual boundaries.                   |

## Second Follow-up Review Fix Log

Second review found two remaining gaps before closeout:

- Quoted or line-commented high-risk `riskTypes` values could bypass exact-match risk blocking.
- Same-prefix sibling manifest roots could be misclassified as repository-contained paths.

TDD RED evidence:

- `Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1` failed because `riskTypes: - "env_secret"` returned `queueDrainEligibilityDecision: eligible`.
- `Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1` failed because a sibling path such as `path-prefix-repo-sibling` was hard-blocked as if it were inside `path-prefix-repo`.

Fixes applied:

- `Test-ModuleRunV2QueueDrainEligibility.ps1` now normalizes YAML list scalars by trimming outer quotes and legal line comments before risk matching. High-risk matching is case-insensitive while paths and commands keep their original spelling.
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` now checks repository containment with a directory-separator boundary instead of a raw prefix.

Second follow-up validation:

| Command                                                                                                                             | Result            | Notes                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`    | pass              | Includes quoted and line-commented high-risk `riskTypes` regressions.                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`   | pass              | Includes same-prefix sibling manifest root regression.                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1` | pass              | Acceptance remains unchanged.                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` | pass              | Schema readiness remains compatible.                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`        | pass              | Runner compatibility retained; fixture branch messages are from temporary smoke repositories.  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`  | pass              | Dispatcher compatibility retained.                                                             |
| `npm.cmd run lint`                                                                                                                  | pass              | ESLint completed.                                                                              |
| `npm.cmd run typecheck`                                                                                                             | pass              | `tsc --noEmit` completed.                                                                      |
| `npm.cmd run format:check`                                                                                                          | pass              | Prettier check completed.                                                                      |
| `git diff --check`                                                                                                                  | pass              | No whitespace errors.                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                          | expected exit `1` | Registration mismatch and dirty worktree remain expected manual boundaries; Cost Gate blocked. |

## Closeout Scope Materialization

During closeout, the first `git commit` attempt was blocked by the pre-commit hardening hook because
`project-state.yaml` still pointed at the earlier `module-run-v2-mechanism-tuning-p0-p1` task. That older task did not
declare the bounded queue drain files in `allowedFiles`, so the hook correctly emitted `HARD_BLOCK_OUT_OF_SCOPE`.

Resolution:

- Added a dedicated `module-run-v2-bounded-queue-drain` task block to `task-queue.yaml`.
- Updated `project-state.yaml` `currentTask` to the bounded queue drain task with `status: closed`.
- Kept automation activation, product code, dependency, schema/migration, env/secret, provider, deploy/payment, PR,
  force-push, and Cost Calibration Gate outside scope.

## Master Post-Merge Verification

Timestamp: `2026-06-11T19:09:39.2179877-07:00`

Merge result:

- `git merge --ff-only codex/module-run-v2-bounded-queue-drain` succeeded on `master`.
- Fast-forward range: `a2ae08e5..c995e775`.
- No merge commit was created.

Post-merge validation:

| Command                                                                                                                             | Result            | Notes                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`    | pass              | Queue drain eligibility gate passed on `master`.                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`   | pass              | Bounded drain supervisor smoke passed on `master`.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1` | pass              | Acceptance reports bounded drain boundary and keeps Cost Calibration Gate blocked.          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` | pass              | Schema readiness smoke passed on `master`.                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`        | pass              | Runner compatibility retained; temporary fixture branch messages are expected smoke output. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`  | pass              | Dispatcher compatibility retained.                                                          |
| `npm.cmd run lint`                                                                                                                  | pass              | ESLint completed.                                                                           |
| `npm.cmd run typecheck`                                                                                                             | pass              | `tsc --noEmit` completed.                                                                   |
| `npm.cmd run format:check`                                                                                                          | pass              | Prettier check completed.                                                                   |
| `git diff --check`                                                                                                                  | pass              | No whitespace errors.                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                          | expected exit `1` | Repository clean and batch-114 executable; automation registration mismatch remains manual. |

Expected residual boundary:

- `Get-TikuProjectStatus.ps1` reports `projectStatusDecision: hard_block_registration` because local automation
  registration remains mismatched with the project ACTIVE expectation.
- `Cost Calibration Gate remains blocked`.
