# Queue Drain Default Entry Rules Evidence

## Summary

- Result: pass.
- Task id: `queue-drain-default-entry-rules`.
- Scope: mechanism_maintenance.
- Product closure contribution: none; mechanism budget item.
- Changed surfaces: queue drain supervisor, queue drain supervisor smoke, operating manual, automated advancement SOP,
  mechanism source-of-truth index, project state, task queue, task plan, evidence, audit.
- Forbidden scope: no `.env*`, no secret/token/cookie/Auth header/DB URL, no provider/model call, no dependency or
  lockfile change, no schema/drizzle/migration, no staging/prod/cloud/deploy/payment/external-service, no PR or force
  push, no Cost Calibration Gate execution.
- Redaction: evidence records command names, pass/fail, and safe summaries only.

## Baseline

- `git switch master`: pass before branch creation; branch was up to date with `origin/master`.
- `git fetch --prune origin`: pass.
- `git status --short --branch`: pass; `## master...origin/master`.
- `git rev-parse HEAD master origin/master`: pass; all three were
  `c6f0e9fe8df51a1722c0f7cedb9312c14762bfb0`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: pass; no output.
- Work branch: `codex/queue-drain-default-entry-rules`.

## TDD Evidence

RED command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1
```

RED result: failed as expected because `queueDrainDefaultEntry: true` was not emitted by the supervisor.

GREEN command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1
```

GREEN result: pass; `Module Run v2 queue drain supervisor smoke passed`.

Behavior covered by smoke:

- ready task emits `queueDrainDefaultEntry: true`, entry contract, `moduleApprovalWindowDecision: approved`,
  `hardStopState: ready_task`, and `recoveryPacketRequired: false`.
- manifest records the same default-entry, approval-window, hard-stop, and recovery-packet fields outside the repository.
- budget stop emits `hardStopState: budget_stop` and `moduleApprovalWindowDecision: not_applicable`.
- runner hard block emits `hardStopState: hard_block_recovery`, `recoveryPacketRequired: true`,
  `recoveryPacketRule: generate_or_reuse_redacted_packet_before_resume`, and writes/reuses a redacted recovery packet.
- recovery/manual paths emit `hardStopState: needs_human_approval` and `moduleApprovalWindowDecision: approval_required`.
- closeout recovery plan-only emits `moduleApprovalWindowDecision: approved` and `hardStopState: ready_task`.

## Diagnostic Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
```

Result: pass. Summary:

- nested next action reported `nextActionDecision: seed_proposal_available`.
- nested next action reported `recommendedAction: request_auto_seed_approval:ops-governance-and-retention`.
- unified status reported `projectStatusDecision: seed_proposal_available`.
- `projectStatusAction: request_auto_seed_approval:ops-governance-and-retention`.
- `projectStatusRequiresHuman: true`.
- `projectStatusSafeToProceed: false`.
- `Cost Calibration Gate remains blocked`.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1
```

Result: pass. Summary:

- `nextActionDecision: seed_proposal_available`.
- `currentTask: queue-drain-default-entry-rules(closed)`.
- `executionProfile: docs_state_lite`.
- `seedModule: ops-governance-and-retention`.
- `seedRequiredApproval: autoDriveLocalImplementationApproval for module ops-governance-and-retention`.
- `recommendedAction: request_auto_seed_approval:ops-governance-and-retention`.
- `stopReason: auto_seed_approval_required`.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -RunManifestRoot <temp> -RecoveryPacketHandoffRoot <temp>
```

Result: expected non-zero hard stop because the active mechanism branch had uncommitted task-scoped changes. The
supervisor correctly emitted:

- `queueDrainDefaultEntry: true`.
- `moduleApprovalWindowDecision: not_applicable`.
- `hardStopState: hard_block_recovery`.
- `recoveryPacketRequired: true`.
- `recoveryPacketDecision: written`.
- `safeToContinueDrain: false`.

The recovery packet path was under a temporary directory outside the repository.

## Validation Commands

```powershell
git diff --check
```

Result: pass.

```powershell
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/automated-advancement-governance.md docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1 scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1 docs/05-execution-logs/task-plans/2026-06-17-queue-drain-default-entry-rules.md docs/05-execution-logs/evidence/2026-06-17-queue-drain-default-entry-rules.md docs/05-execution-logs/audits-reviews/2026-06-17-queue-drain-default-entry-rules.md
```

Initial result: failed on `docs/04-agent-system/sop/automated-advancement-governance.md`.

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/automated-advancement-governance.md docs/04-agent-system/state/mechanism-source-of-truth-index.yaml scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1 scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1 docs/05-execution-logs/task-plans/2026-06-17-queue-drain-default-entry-rules.md
```

Result: pass; SOP formatting repaired.

```powershell
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/automated-advancement-governance.md docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1 scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1 docs/05-execution-logs/task-plans/2026-06-17-queue-drain-default-entry-rules.md docs/05-execution-logs/evidence/2026-06-17-queue-drain-default-entry-rules.md docs/05-execution-logs/audits-reviews/2026-06-17-queue-drain-default-entry-rules.md
```

Result: pass; all matched files use Prettier code style.

```powershell
npm.cmd run lint
```

Result: pass.

```powershell
npm.cmd run typecheck
```

Result: pass.

Post-evidence final validation:

- `Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`: pass.
- `git diff --check`: pass.
- scoped `npx.cmd prettier --check --ignore-unknown ...`: pass after formatting this evidence file.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.

## Changed File Boundary

Changed files are limited to:

- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-queue-drain-default-entry-rules.md`
- `docs/05-execution-logs/evidence/2026-06-17-queue-drain-default-entry-rules.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-queue-drain-default-entry-rules.md`

## Residual Risk

- This mechanism task does not itself resume automation or approve the next seed module.
- The next product advancement still requires `autoDriveLocalImplementationApproval for module
ops-governance-and-retention`.
- The live supervisor hard-stop validation intentionally observed a dirty worktree protection state before commit; final
  clean Git validation must be done after closeout.
- Cost Calibration Gate remains blocked.
