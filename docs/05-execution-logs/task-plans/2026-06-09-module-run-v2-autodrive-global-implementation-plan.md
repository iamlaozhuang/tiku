# Module Run v2 Unattended Autodrive Global Implementation Plan

> For agentic workers: use the repository Module Run v2 gates before implementing any phase. Execute phases as reviewable tasks with separate evidence, audit, and commits.

## Goal

Build a guarded unattended local autodrive system that can advance low-risk local development without repeatedly stopping for recoverable conditions, while preserving hard safety boundaries for high-risk actions.

## Architecture

The system is a layered local control plane:

1. Startup readiness protects the lane and exits when a healthy active owner exists.
2. Autopilot runner consumes startup, hygiene, closeout, parallel, handoff, and stop decisions.
3. Agent action dispatcher maps runner decisions to explicit agent-layer actions.
4. Serial executor and parallel coordinator perform only durable-approved work.
5. Validation, evidence, audit, and closeout transactions record every state transition.

## Current Baseline

- `Test-ModuleRunV2AutomationStartupReadiness.ps1` decides scheduler startup.
- `Invoke-ModuleRunV2Autopilot.ps1` orchestrates unattended readiness, closeout recovery, parallel readiness, handoff, and thread launch policy.
- `Invoke-ModuleRunV2AutopilotRunner.ps1` wraps startup and autopilot as a bounded local runner.
- `Test-ModuleRunV2ParallelReadiness.ps1` classifies parallel candidates and file locks.
- `Invoke-ModuleRunV2ApprovedCloseout.ps1` handles approved closeout but remains intentionally narrow.

## Phase 0: Baseline Convergence

Scope:

- Record that `codex/module-run-v2-autopilot-runner-control` has local commit `8cc557c1`.
- Keep merge, push, and cleanup blocked until explicit closeout approval.
- Continue implementation on `codex/module-run-v2-autodrive-phase-0-2`.

Acceptance:

- Current durable state names the Phase 0-2 task.
- Evidence records the stacked base and blocked closeout remainder.

## Phase 1: Durable Autodrive Schema

Scope:

- Add a durable schema contract for autodrive policy, capabilities, closeout, registry lifecycle, parallel batches, and evidence minimums.
- Add a read-only schema readiness gate that classifies a task as `can_autodrive`, `proposal_only`, or `stop_for_hard_block`.
- Keep missing advanced schema as a proposal-only condition, not a hard stop, when the base task metadata is otherwise safe.

Acceptance:

- A fixture task with full schema returns `autodriveSchemaDecision: can_autodrive`.
- A fixture task without autodrive policy returns `autodriveSchemaDecision: proposal_only`.
- A task with missing base metadata returns `autodriveSchemaDecision: stop_for_hard_block`.

## Phase 2: Agent Action Dispatcher

Scope:

- Add a dry-run dispatcher that consumes `runnerDecision` and `runnerNextAction`.
- Map safe runner decisions to explicit `agentAction` values without creating threads, claiming tasks, writing product code, or closing out branches.
- Run schema readiness before `claim_task`, `continue_task`, or `prepare_parallel_workers`.

Acceptance:

- `continue_current_task` maps to `agentAction: continue_task` when schema is safe.
- `prepare_next_task` maps to `agentAction: claim_task` only when target schema is safe.
- active owner and no task states exit cleanly as idle.
- hard blocks remain non-zero stop decisions.

## Phase 3: Serial Autodrive Executor

Scope:

- Add task claim transaction, task plan scaffold, evidence scaffold, validation command runner, scope scan, and local commit transaction.
- Leave merge, push, PR, cleanup, deploy, env, provider, dependency, schema, migration, and Cost Calibration Gate blocked without explicit task approval.

Acceptance:

- A low-risk mechanism task can go from `pending` to local commit with evidence.

## Phase 4: Parallel Coordinator And Worker Isolation

Scope:

- Add worker assignment manifest, file lock manager, worker handoff envelope, and serial integration executor.
- Default to serial execution unless durable approval and file locks justify parallel work.

Acceptance:

- Independent docs or script tasks can be planned as workers.
- Coordinator remains the only writer of project state and queue.
- Integration is serial and validated after each branch.

## Phase 5: Codex Thread Bridge

Scope:

- Use Codex thread tools only in the agent layer after launch policy approval.
- Communicate through external run registry, redacted handoff files, task evidence, and audit reviews.
- Exit quietly when another active owner has a fresh heartbeat.

Acceptance:

- A new thread can recover from durable handoff without chat memory.
- Scheduled automation does not interrupt a healthy active development thread.

## Phase 6: Local Capability Adapters

Scope:

- Add local Docker database readiness adapter.
- Add project resource read adapter for `material`, `paper`, and `paper_asset` with redacted evidence.
- Add provider key destination gate and provider call budget gate.

Acceptance:

- Default capability state is denied or task approval required.
- Approved local-only validation can use Docker and project resources without schema migration or secret leakage.

## Phase 7: Autodrive Monitor And Self-Healing

Scope:

- Classify recurring stops as `auto_repaired`, `safe_idle`, `manual_required`, or `hard_block`.
- Auto-repair only safe residue: stale clean worktree, cleanup-ready registry, dry-run handoff temp, evidence scaffold, formatting drift, and accepted state SHA ancestry.

Acceptance:

- Recoverable conditions are repaired before stopping.
- Unsafe dirty worktrees, high-risk gaps, and validation failures still stop.

## Phase 8: Low-Risk Business Trial

Scope:

- Select one small local-only business implementation task with no schema, env, provider, deploy, dependency, or e2e expansion.
- Run the full serial autodrive loop.

Acceptance:

- Task reaches local commit with evidence and audit.
- Residual high-risk work remains explicitly blocked.

## Global Stop Conditions

Stop for human decision when a task needs:

- env or secret writes;
- provider key use or real provider calls without task approval;
- database schema, migration, destructive data operation, or staging/prod connection;
- dependency, package, or lockfile change;
- merge, push, PR, cleanup, deploy, cloud, payment, external-service, or Cost Calibration Gate execution;
- dirty unknown worktree, file lock conflict, or failed validation outside the approved scope.
