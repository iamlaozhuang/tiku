# Module Run v2 Auto-Seed Bridge Evidence

## Task

- Task id: `module-run-v2-auto-seed-bridge`
- Branch: `codex/module-run-v2-auto-seed-bridge`
- Goal slice: implement three-layer auto-seed bridge and verify it closes the `no_executable_task -> idle` mechanism gap.
- result: pass
- Batch range: Module Run v2 auto-seed bridge mechanism batch.
- RED: old runner behavior ended at `idle_no_pending_task` when startup returned `no_executable_task`.
- GREEN: new runner behavior returns `seed_proposal_available` without approval, and reaches `prepare_next_task` after approved seed transaction plus self-review in fixture smoke.
- Commit: `409ae324` baseline checkpoint before this task's local commit.
- localFullLoopGate: L2 mechanism smoke plus lint/typecheck.
- threadRolloverGate: no new thread required for this mechanism task before closeout.
- nextModuleRunCandidate: after this mechanism closes, the next candidate can be produced through seed proposal rather than idle.
- blocked remainder: high-risk provider/env/secret/schema/deploy/payment/external-service work remains blocked.
- Cost Calibration Gate remains blocked.

## Changed Mechanism

Added three guarded layers:

- Seed proposal: `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- Seed transaction: `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- Seed self-review: `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

Runner bridge:

- `Invoke-ModuleRunV2AutopilotRunner.ps1` now routes `startupDecision: no_executable_task` through seed proposal.
- Without `-AllowAutoSeed`, runner returns `runnerDecision: seed_proposal_available` and does not write queue entries.
- With `-AllowAutoSeed` plus `AutoSeedApprovalStatement` containing `autoDriveLocalImplementationApproval`, runner applies the seed transaction, runs self-review, then retries startup readiness.
- If the seed transaction creates pending tasks, startup then returns `prepare_next_task`.

## Self-Check Findings

- The prior gap was confirmed: old runner returned `idle_no_pending_task` on `no_executable_task`.
- The new bridge is guarded:
  - no pending or in-progress task is required before proposal;
  - proposal is read-only;
  - apply mode requires explicit `autoDriveLocalImplementationApproval`;
  - seeded tasks are `pending`, not `done`;
  - self-review checks coverage, required metadata, safe allowed/blocked files, validation commands, redaction, and blocked gate wording.
- A follow-up gap was found and fixed: seeded task templates now include `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` in validation commands, so the existing planning-to-implementation gate remains in the task execution path.

## Commands

### Pre-Edit Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-auto-seed-bridge -PlannedFiles scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1,scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1,scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1,scripts/agent-system/New-ModuleRunV2ImplementationSeed.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1,scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1,scripts/agent-system/Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1,scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1,scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1,scripts/agent-system/Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1,docs/04-agent-system/sop/automated-advancement-governance.md,docs/04-agent-system/sop/code-stage-task-seeding-governance.md,docs/04-agent-system/state/autodrive-control-schema.yaml,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/04-agent-system/state/mechanism-source-of-truth-index.yaml,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-auto-seed-bridge.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-auto-seed-bridge.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-auto-seed-bridge.md
```

Result:

- `work readiness passed`

### Smoke Tests

Commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1
```

Results:

- `Module Run v2 implementation seed proposal smoke passed`
- `Module Run v2 implementation seed transaction smoke passed`
- `Module Run v2 implementation seed self-review smoke passed`
- `Module Run v2 autopilot runner smoke passed`
- `autodriveAcceptanceDecision: accepted_with_guardrails`
- `autoSeedBoundary: proposal_transaction_self_review`
- `Module Run v2 autodrive control-loop acceptance smoke passed`
- `Module Run v2 autodrive schema readiness smoke passed`
- `Module Run v2 implementation auto-seed readiness smoke passed`

### Current-State Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1
```

Result:

- `startupDecision: continue_current_task`
- Warnings only:
  - current worktree lacks `node_modules`;
  - branch hygiene cleanup candidates exist;
  - repository SHA values are accepted ancestor checkpoints;
  - current task commit SHA is a placeholder before closeout.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-auto-seed-bridge
```

Result:

- `autodriveSchemaDecision: can_autodrive`

### Plan-Only Safety Probe

Commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1
```

Results:

- Current in-progress task prevents accidental seeding:
  - `seedProposalDecision: executable_task_exists`
  - `seedTransactionDecision: executable_task_exists`

### Done-State Bridge Probe

After task status moved to `done`, startup and runner were rerun.

Commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -PlanOnly -MaxSteps 2
```

Results:

- `startupDecision: no_executable_task`
- `seedProposalDecision: proposal_available`
- `seedModule: authorization-and-access`
- `seedCandidateTaskCount: 4`
- `runnerDecision: seed_proposal_available`
- `runnerNextAction: request_auto_seed_approval`

### Lint And Typecheck

The isolated worktree has no `node_modules`. No dependency installation was performed. Validation used the existing root workspace tooling by prepending `D:\tiku\node_modules\.bin` to `PATH` for the command process only.

Commands:

```powershell
$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; npm.cmd run lint
$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; npm.cmd run typecheck
```

Results:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass

### Formatting And Diff

Commands:

```powershell
node D:\tiku\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown docs\04-agent-system\sop\automated-advancement-governance.md docs\04-agent-system\sop\code-stage-task-seeding-governance.md docs\04-agent-system\state\autodrive-control-schema.yaml docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-auto-seed-bridge.md
git diff --check
Select-String -Path scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1,scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1,scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1,scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1,docs\04-agent-system\sop\automated-advancement-governance.md,docs\04-agent-system\sop\code-stage-task-seeding-governance.md,docs\04-agent-system\state\autodrive-control-schema.yaml -Pattern 'seedProposalDecision','seedTransactionDecision','seedSelfReviewDecision','seed_proposal_available','autoDriveLocalImplementationApproval','Cost Calibration Gate remains blocked'
```

Results:

- Prettier check: pass after scoped write of this task plan.
- `git diff --check`: pass
- `Select-String` anchor check: pass.

## Blocked Gates

Still blocked:

- dependency/package/lockfile changes;
- schema/migration/destructive DB operations;
- env/secret writes or reads;
- provider calls;
- staging/prod/cloud/deploy;
- payment/external-service work;
- Cost Calibration Gate execution;
- unpausing Codex automation before closeout and final user-approved activation.

## Conclusion

The three-layer auto-seed bridge is implemented and verified in fixture and current-state checks. The mechanism now has a guarded path from `no_executable_task` to seed proposal, approved seed transaction, seed self-review, and renewed task claiming.
