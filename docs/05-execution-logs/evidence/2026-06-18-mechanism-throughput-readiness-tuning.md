# mechanism-throughput-readiness-tuning Evidence

## Scope

- Task: `mechanism-throughput-readiness-tuning`
- Branch: `codex/mechanism-throughput-readiness-tuning`
- Product closure contribution: `none; mechanism budget item`
- Result: `pass_for_implemented_scope`
- result: pass
- Self-check scope note: plan items 1-3 are implemented; item 4 remains advisory; item 5 has status metrics but not full
  queue slimming/self-repair automation.
- Cost Calibration Gate remains blocked.

## Module Run V2 Evidence Anchors

- Batch range: mechanism throughput readiness tuning single-task implemented-scope closeout.
- RED: current pre-commit hook initially blocked mechanism script/docs changes because durable currentTask still pointed
  at `standard-core-student-local-full-flow-validation`.
- GREEN: queued task scope was materialized for `mechanism-throughput-readiness-tuning`; `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-throughput-readiness-tuning` passed.
- Commit: `2089c2f6` is the pre-commit branch base; final local closeout commit is pending.
- localFullLoopGate: not applicable for docs/state/script mechanism maintenance; Browser/Playwright runtime remains
  outside this task.
- threadRolloverGate: no rollover requested for this closeout.
- nextModuleRunCandidate: `mechanism-guarded-goal-packet-v1`.

## Changed Surface

- Mechanism documentation:
  - `docs/04-agent-system/operating-manual.md`
  - `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
  - `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Mechanism scripts and smokes:
  - `scripts/agent-system/ModuleRunV2.Common.ps1`
  - `scripts/agent-system/Get-ModuleRunV2LocalExperienceNextTaskProposal.ps1`
  - `scripts/agent-system/Get-ModuleRunV2LocalExperienceNextTaskProposal.Smoke.ps1`
  - `scripts/agent-system/New-ModuleRunV2LocalExperienceTaskSeed.ps1`
  - `scripts/agent-system/New-ModuleRunV2LocalExperienceTaskSeed.Smoke.ps1`
  - `scripts/agent-system/Get-TikuNextAction.ps1`
  - `scripts/agent-system/Get-TikuProjectStatus.ps1`
  - `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
  - `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
  - `scripts/agent-system/Test-ModuleRunV2QueueDrainEligibility.ps1`
  - `scripts/agent-system/Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`
- Execution records:
  - `docs/05-execution-logs/task-plans/2026-06-18-mechanism-throughput-readiness-tuning.md`
  - this evidence file
  - audit review

## Behavior Evidence

`Get-TikuNextAction.ps1 -VerboseHistory` now reports the current blocked student chain as the next mechanism action:

- `nextActionDecision: local_experience_task_seed_required`
- `localExperienceCandidateTask: standard-core-student-local-full-flow-contract-repair`
- `localExperienceAffectedUseCaseCount: 5`
- `blockedWithRepairCandidate: true`
- `coverageRowsWaitingRepair: 5`
- `recommendedAction: request_local_experience_task_seed:standard-core-student-local-full-flow-contract-repair`

`Get-TikuProjectStatus.ps1` mirrors that decision:

- `projectStatusDecision: local_experience_task_seed_required`
- `projectStatusAction: request_local_experience_task_seed:standard-core-student-local-full-flow-contract-repair`
- `projectStatusReason: coverage and handoff identify a local experience repair candidate that is not seeded`

`Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-validation` now accepts the
existing blocked validation evidence:

- `evidenceResultClass: blocked`
- `OK_BLOCKED_EVIDENCE_CLOSEOUT_APPROVED`
- `OK_BLOCKED_FAILURE_SUMMARY_RECORDED`
- `OK_BLOCKED_NEXT_REPAIR_RECORDED`
- `module-closeout readiness passed`

Seed template self-check:

- Empty dependency lists are emitted as `dependencies: []`, not `dependencies: - none`, so seeded pending tasks do not
  create a fake missing dependency named `none`.
- Existing pending local-experience candidates are treated as claimable only when their dependencies are terminal. A
  pending candidate with missing dependencies reports `local_experience_task_blocked` instead of bypassing to unrelated
  ready work.

## Requirement Coverage Self-Check

| Planned item                                     | Coverage in this staged change | Evidence                                                                                   |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `mechanism-tuning-plan-capture-and-read-surface` | implemented                    | SOP third-round section, source-of-truth index entries, operating manual read-order update |
| `mechanism-closeout-readiness-normalization`     | implemented                    | common helper plus blocked evidence closeout readiness and smoke coverage                  |
| `mechanism-local-experience-routing-and-seeding` | implemented                    | next-task proposal, seed templates, current student repair seed recommendation             |
| `mechanism-guarded-goal-packet-v1`               | not implemented in this pass   | only documented as future work; `goalPacketEligibleCount` remains conservative `0`         |
| `mechanism-docs-queue-slimming-and-self-repair`  | partial only                   | status metrics added; no active queue rewrite/archive automation or missing-field repair   |

This evidence therefore supports closeout only for the implemented scope, not for the full five-item implementation
plan.

## Validation Results

| Command                                                                                                                                                                               | Result | Notes                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceNextTaskProposal.Smoke.ps1`                                             | pass   | proposal ranks blocked student repair ahead of admin pending               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2LocalExperienceTaskSeed.Smoke.ps1`                                                     | pass   | proposal-only/apply modes and no fake `- none` dependency                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`                                                                         | pass   | existing scenarios plus local-experience ready/blocked candidate routing   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1`                                                                      | pass   | status aggregator scenarios preserved                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`                                                      | pass   | `validationPolicy` compatibility and legacy `validationProfile` still pass |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`                                                    | pass   | blocked evidence closeout scenario covered                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-validation` | pass   | current blocked validation evidence accepted as blocked closeout           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-throughput-readiness-tuning`                 | pass   | task scope now covers mechanism docs/scripts and execution records         |
| `git diff --check`                                                                                                                                                                    | pass   | no whitespace errors                                                       |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                       | pass   | scoped changed docs/scripts check                                          |
| `npm.cmd run lint`                                                                                                                                                                    | pass   | ESLint passed                                                              |
| `npm.cmd run typecheck`                                                                                                                                                               | pass   | `tsc --noEmit` passed                                                      |

## Safety Boundary

- No product source repair was performed.
- No e2e spec was edited.
- No Browser, Playwright runtime, dev server, provider, dependency, schema, migration, env/secret, staging/prod, cloud,
  deploy, payment, external-service, destructive DB, PR, force-push, or Cost Calibration Gate work was performed.
- Local experience seed script defaults to proposal-only and requires explicit product `allowedFiles` before applying a
  product-source repair task.

## Self-Check Findings

- Fixed during self-check: the seed template initially emitted `dependencies: - none` for empty dependency lists. Existing
  dependency readers treat list entries as real task IDs, so this could have made seeded pending tasks blocked by a fake
  `dependency_missing:none`. The script and smoke now emit/assert `dependencies: []`.
- Fixed during self-check: local-experience pending candidates initially bypassed dependency-readiness checks. The next
  action selector now reports `local_experience_task_blocked` with dependency reasons when a coverage/handoff candidate
  is pending but not dependency-satisfied; smoke coverage asserts both blocked and ready candidate paths.
- Remaining mechanism work: guarded serial Goal v1 is not implemented in this pass; `goalPacketEligibleCount` remains a
  conservative diagnostic value of `0`.
- Remaining mechanism work: active queue slimming and self-repair automation are not implemented beyond new status
  metrics (`activeQueueNonTerminalCount`, `blockedWithRepairCandidate`, `coverageRowsWaitingRepair`,
  `coverageRowsWaitingClosure`).

## Next Recommendation

Proceed to `mechanism-guarded-goal-packet-v1`, then `mechanism-docs-queue-slimming-and-self-repair`, per the current
user-approved mechanism task sequence. After that mechanism sequence closes, return to seeding
`standard-core-student-local-full-flow-contract-repair` with explicit product allowedFiles and task-scoped approval.
