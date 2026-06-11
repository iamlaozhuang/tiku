# Automated Advancement Governance SOP

## Status

Active for Module Run v2 local automation governance.

This SOP defines the target automation mechanism for Tiku project advancement. It does not by itself approve product code implementation, code-stage queue seeding, dependency changes, env/secret work, provider work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

Current `project-state.yaml` `automation.mode` is `local_auto_candidate`. This label allows local-first Module Run v2
planning and guarded local implementation only when a queued task and explicit user approval define the scope.

## Purpose

Convert the existing semi-automation rules into a clearer, executable, and auditable automation governance model.

The mechanism must preserve:

- queue-first task selection;
- strict task type boundaries;
- evidence before conclusion;
- one focused task per reviewable commit by default;
- blocked gate enforcement;
- cross-session recovery from durable repository state;
- explicit human approval for high-risk actions.

## Startup Preconditions

An agent may start automated advancement only after it verifies:

- `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, `docs/02-architecture/adr/`, and relevant SOPs have been read;
- `git status --short --branch` is clean or all dirty files are task-scoped and explained;
- work is not being performed directly on `master` or `main`, except for read-only inspection or approved closeout;
- `project-state.yaml` and `task-queue.yaml` agree on the active recovery point;
- `repository.lastKnownMasterSha` and `repository.lastKnownOriginMasterSha` either match Git reality or the drift is recorded as the current task;
- long-lived blocked gates are known before task selection;
- the target task has concrete `allowedFiles`, `blockedFiles`, `riskTypes`, `taskKind`, `taskPlanPolicy`, and `validationCommands`.

If any precondition fails, stop before editing and record the blocker in evidence or the startup report.

## Automatic Task Claiming

Automatic claiming may only select a task when all conditions are true:

- status is `pending`;
- every dependency is `done`, `closed`, or `pushed`, with legacy `done` accepted only when evidence exists;
- task kind is allowed by the active approval scope;
- high-risk categories have explicit human approval before execution;
- `allowedFiles` excludes unrelated product surfaces;
- `blockedFiles` covers env/secret, dependency, schema, migration, deploy, and external-service surfaces when they are out of scope;
- no active branch or worktree already owns the same file scope;
- the previous completed task has either been committed or has evidence explaining why it remains uncommitted.

If no eligible task exists, the automation loop stops as a quiet idle state and records the next recommended action as
`no-executable-task-seed-or-approve-next-task`. This is not a failed development run and must not trigger retries,
thread creation, or speculative task claiming.

## Unattended Local Control Point

Before a Codex unattended automation loop claims work, continues after an interruption, or starts the next local step, it
must run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId <task-id>
```

The script is the local stop-decision surface for unattended execution. A passing result must include:

```text
unattendedStopDecision: continue
```

A failing result must include:

```text
unattendedStopDecision: stop_for_hard_block
```

The loop must stop on non-zero exit and hand off to the user instead of trying to broaden scope. The script hard-blocks
protected-branch edits, remote divergence, stale repository SHA recovery points, missing evidence or audit paths,
blocked risk gates, and changed files outside `allowedFiles` or inside `blockedFiles`.

This control point does not approve remote scheduling, thread creation, PR creation, push, provider, env/secret,
staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, or Cost Calibration Gate execution.

## Autopilot Orchestration Control

After the unattended local control point is available, a guarded Codex autopilot loop may use:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 -TaskId <task-id>
```

Routine wakeups after a completed or closed current task should use closeout recovery and dry-run handoff first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 -TaskId <task-id> -CloseoutRecovery -DryRunHandoff
```

`-DryRunHandoff` may write a temporary handoff outside the repository so the launch policy can validate handoff presence.
It must not modify `docs/05-execution-logs/handoffs/**`. Durable handoff writes are allowed only inside an approved
closeout or handoff task.

This orchestrator combines:

- `Test-ModuleRunV2UnattendedReadiness.ps1`;
- `Test-ModuleRunV2ThreadRolloverReadiness.ps1`;
- `New-ModuleRunV2ThreadHandoff.ps1`;
- `Test-ModuleRunV2ThreadLaunchPolicy.ps1`.

It emits a machine-readable `autopilotDecision`:

| Decision                        | Meaning                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `continue_current_thread`       | Continue the approved local task in the current thread.                                          |
| `closeout_executed`             | Approved commit/merge/push/cleanup finished; rerun startup for next task.                        |
| `prepare_handoff`               | Prepare handoff before continuing; no thread launch is approved.                                 |
| `prepare_handoff_then_continue` | Handoff is prepared and same-thread continuation remains controlled.                             |
| `prepare_parallel_workers`      | Parallel readiness approved candidate assignment; worker creation remains separately controlled. |
| `launch_new_thread`             | Codex may call `create_thread` with the generated handoff content.                               |
| `stop_for_hard_block`           | Stop immediately because a hard block was found.                                                 |
| `stop_for_human_handoff`        | Stop and wait for user decision because safe automation cannot proceed.                          |

`launch_new_thread` is not produced by chat memory alone. It requires a handoff file, a thread rollover decision, thread
tool availability, and launch approval in the active task or user instruction.

The PowerShell script does not directly create Codex threads. In Codex, the agent layer consumes `launch_new_thread` and
uses `create_thread` or `send_message_to_thread` only when the thread launch policy allows it.

Dry-run launch decisions are advisory unless a durable handoff was explicitly produced by an approved closeout flow.

When startup returns `startupDecision: cleanup_stale_artifacts`, automation must run the stopped-automation hygiene gate
before unattended readiness, handoff generation, or next-task selection. The cleanup command is limited to:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup
```

Only proceed when cleanup completes without hard blocks and startup readiness is rerun successfully afterward. If cleanup
fails, or startup still returns `cleanup_stale_artifacts`, stop and report the artifact class instead of broadening
cleanup scope.

## Autopilot Runner Control Loop

The one-shot autopilot orchestrator is wrapped by a bounded runner control loop:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -TaskId <task-id>
```

The runner is the local automation state machine. It repeatedly consumes:

- `nextActionDecision` from `Get-TikuNextAction.ps1` as a read-only preflight summary;
- `startupDecision` from `Test-ModuleRunV2AutomationStartupReadiness.ps1`;
- `stoppedAutomationHygieneDecision` from `Test-ModuleRunV2StoppedAutomationHygiene.ps1`;
- `autopilotDecision` from `Invoke-ModuleRunV2Autopilot.ps1`.

It emits `runnerDecision`, `runnerNextAction`, and `runnerStepCount`.

`Get-TikuNextAction.ps1` is diagnostic-only. The runner must echo it before startup readiness so humans and scheduled
automation can see the queue, status, evidence, drift, and blocked-gate summary that led into the step. The diagnostic
does not claim tasks, repair state, clean worktrees, merge, push, deploy, call providers, or execute Cost Calibration
Gate, and it does not override startup readiness, closeout readiness, local capability gates, schema gates, or blocked
gate decisions.

The runner may automatically continue only through these already-gated actions:

- leave the repository alone when `exit_active_owner_present` or an active lease owns the lane;
- run stopped-automation hygiene cleanup when startup returns `cleanup_stale_artifacts`;
- rerun startup after successful cleanup;
- route `manual_required_owner_recovery` to a human owner-recovery decision when a stale dirty active run is protected by
  `safeToAdopt: false`;
- route `closeout_recovery` to the bounded closeout recovery path only when there is an actionable closeout recovery
  transaction;
- treat `no_executable_task` as a quiet idle state when the current task is already closed and no pending task exists;
- execute approved closeout only through `Invoke-ModuleRunV2Autopilot.ps1` and the existing structured
  `closeoutPolicy`;
- surface `prepare_next_task`, `continue_current_task`, `prepare_parallel_workers`, `launch_new_thread`, or
  `prepare_handoff` for the Codex agent layer.

The runner does not itself write product code, claim tasks, create Codex threads, create worker worktrees, perform serial
branch integration, merge, push, deploy, write env files, call providers, run local database schema/migration actions, or
execute Cost Calibration Gate. Those remain agent-layer or task-specific actions that require separate approval and
evidence.

`exit_active_owner_present` and `no_executable_task` are normal no-op terminal decisions for scheduled automation. They
should not be treated as failed development work.

## Recovery Self-Repair Control

Before a recovery pass treats a startup finding as a stop, the agent layer may run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverySelfRepair.ps1 -TaskId <task-id>
```

The gate consumes `startupDecision` and emits `recoverySelfRepairDecision` plus `repairAction`:

- `self_repair_ready`: a bounded repair action is available, such as
  `repairAction: run_stopped_automation_hygiene_cleanup`,
  `repairAction: adopt_recoverable_run_after_redacted_handoff_audit`, `repairAction: open_recovery_plan`, or
  `repairAction: confirm_post_closeout_checkpoint`.
- `continue_without_repair`: startup can proceed without a repair step.
- `exit_active_owner_present`: another active owner or lease owns the lane; scheduled automation exits quietly.
- `manual_required`: recovery requires a human decision, including stale dirty active-owner worktrees protected by
  `safeToAdopt: false`; the repair action is `open_owner_recovery_plan`, and the mechanism must not adopt, clean,
  commit, or overwrite the owner worktree.
- `stop_for_hard_block`: the state is unsafe or blocked.

The gate is decision-only by default. `cleanup_stale_artifacts` is not a reason to stop indefinitely; it is routed to the
stopped-automation hygiene gate. Accepted post-closeout ancestor checkpoints are confirmable without writing new current
HEAD values back into committed state files. Dirty unknown worktrees, invalid leases, blocked gates,
provider/env/schema/deploy needs, and unsafe cleanup paths remain hard stops.

When the only repair action is `confirm_post_closeout_checkpoint`, execution is allowed only through:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2PostCloseoutStateReconcile.ps1 -TaskId <task-id> -Execute
```

That transaction confirms `project-state.yaml` repository SHAs and the current task commit SHA as accepted checkpoints.
It requires a clean Git worktree, `master` and `origin/master` alignment, current task status `done` or `closed`,
existing evidence/audit paths, and recorded SHAs that are equal to or accepted ancestors of Git reality. It must not write
self-referential current HEAD values into committed state, claim a new task, edit queue status, merge, push, clean
branches, create handoffs, or perform product implementation.

## Post-Closeout Checkpoint Model

Committed durable state cannot safely require `project-state.yaml` to contain the exact commit that stores
`project-state.yaml`; that invariant is self-referential and becomes stale after every state commit. Module Run v2 uses
`accepted_ancestor_checkpoint` semantics instead:

- `repository.lastKnownMasterSha` and `repository.lastKnownOriginMasterSha` are accepted ancestor checkpoints, not an
  exact current-HEAD assertion.
- `currentTask.commitSha` may be `pending-local-commit` before closeout or an accepted task closeout checkpoint after
  closeout.
- `Invoke-ModuleRunV2PostCloseoutStateReconcile.ps1` confirms the checkpoint and returns `checkpoint_accepted` or
  `checkpoint_confirmed`; it does not write new self-referential SHAs.
- Startup may warn with `startupStateCheckpoint: accepted_ancestor_checkpoint`, but that warning is not a repair loop.
- A clean closed task with no pending successor returns `startupDecision: no_executable_task` and scheduled automation
  exits quietly.

## Autodrive Control-Loop Acceptance

The local acceptance gate for the mechanism chain is:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1
```

It emits `autodriveAcceptanceDecision`:

- `accepted_with_guardrails`: required control-loop layers are present, local guardrail probes pass, and the mechanism is
  guardian-first.
- `stop_for_hard_block`: a required layer, safety boundary, or probe is missing or unsafe.

The gate checks these layers without executing business implementation: startup readiness, validation surface readiness,
recovery self-repair, agent action dispatch, serial executor, parallel coordinator, local capability gate, Codex thread
bridge, approved closeout, post-closeout state reconciliation, and branch hygiene. It also verifies that recoverable cleanup routes through
`repairAction`, provider calls remain blocked without task-specific approval, thread launch remains a bridge output
rather than a script-level thread-tool call, and local diagnostics can run without taking run-registry ownership.

Acceptance is not approval for product implementation, broad cleanup, unknown worktree deletion, provider/env/schema
work, DB/resource operations, dependency changes, deploy, PR creation, force push, Codex thread/worktree creation, or
Cost Calibration Gate execution.

## Durable Autodrive Schema And Agent Action Dispatch

Unattended local development may advance only when the target task carries a durable autodrive schema. The schema source
of truth is:

```powershell
docs\04-agent-system\state\autodrive-control-schema.yaml
```

Before the agent layer treats a runner decision as executable, it must run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId <task-id>
```

The schema gate emits `autodriveSchemaDecision`:

| Decision                     | Meaning                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `can_autodrive`              | The task has safe base metadata, explicit autodrive policy, capabilities, closeout, registry.   |
| `proposal_only`              | The task is not yet executable by unattended autodrive; propose schema repair or use manual.    |
| `not_executable_closed_task` | The named task is terminal and should be treated as idle diagnostic state, not executable work. |
| `stop_for_hard_block`        | Base task metadata, risk gates, or capability values are unsafe.                                |

Missing advanced autodrive fields are proposal-only when the base task metadata is otherwise safe. Missing base task
metadata, high-risk gates, unsafe capability values, and missing durable files remain hard blocks. Terminal task statuses
`done`, `closed`, `pushed`, and `merged` are valid audit targets but are not executable autodrive targets.

The runner-to-agent bridge is:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.ps1 -TaskId <task-id>
```

The dispatcher consumes `runnerDecision` and emits `agentAction`. It is a dry-run decision bridge by default. It may
surface these actions:

- `idle_active_owner_present`;
- `idle_no_executable_task`;
- `run_hygiene_cleanup`;
- `adopt_recoverable_run`;
- `open_recovery_plan`;
- `review_handoff`;
- `launch_new_thread`;
- `claim_task`;
- `continue_task`;
- `run_closeout_recovery`;
- `prepare_parallel_workers`;
- `propose_schema_repair`;
- `request_manual_decision`;
- `request_human_handoff`;
- `stop_for_hard_block`.

The dispatcher does not write product code, claim queue state, create branches, create worktrees, create Codex threads,
merge, push, clean branches, write env files, call providers, run database work, or execute Cost Calibration Gate. It
only tells the Codex agent layer which next action is permitted by existing gates. Agent-layer execution must still obey
the task queue, allowed files, blocked files, validation commands, evidence, and closeout policy.

## Codex Thread Bridge Control

When the dispatcher or autopilot surfaces `launch_new_thread`, the Codex agent layer must pass the thread bridge before
using any Codex thread-management tool:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CodexThreadBridgeReadiness.ps1 -ThreadRolloverDecision <decision> -HandoffPath <path> -ThreadLaunchApproved -ThreadToolAvailable
```

The bridge emits `threadBridgeDecision` and `codexThreadAction`. Only `threadBridgeDecision:
ready_for_agent_thread_launch` with `codexThreadAction: create_thread` is executable by the Codex agent layer, and even
then the script itself has not created a thread. `exit_active_owner_present` is a normal guardian no-op: automation
should leave the active development lane alone. `manual_required` and `stop_for_hard_block` must stop the run instead of
retrying with broader scope.

The bridge enforces durable-handoff minimums before launch readiness: latest task plan, evidence, audit review, blocked
gates, and recovery read order must be present; evidence redaction rules still apply. A launch hint never approves worker
worktree creation, branch creation, product implementation, closeout, merge, push, cleanup, env/secret/provider work,
local DB operation, schema/migration, dependency changes, deploy, external-service action, PR creation, force push, or
Cost Calibration Gate.

## Serial Autodrive Executor Control

The serial executor is the first bounded agent-action transaction layer:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -TaskId <task-id>
```

It consumes `agentAction` from the dispatcher and emits `serialExecutorDecision`. The executor is guardian-first:
advisory decisions are read-only by default, and state writes happen only when the caller passes `-Execute`. Validation
commands are executed only when the caller passes `-RunValidation`.

Supported decisions:

- `ready_to_continue`: same-thread continuation is allowed after schema and status checks.
- `ready_to_claim`: a pending task is schema-ready and dependency-complete, but queue/project state has not been
  written.
- `task_claimed`: `-Execute` updated the pending task to `in_progress` and synchronized `project-state.yaml`.
- `validation_ready`: validation commands passed the blocked-command safety filter, but were not executed.
- `validation_passed`: `-RunValidation` executed all safe validation commands successfully.
- `handoff_to_closeout_recovery`: closeout recovery is recognized, but the executor delegates to unattended readiness,
  approved closeout, and post-closeout state reconciliation gates.
- `blocked_command`: a validation command attempted an out-of-scope surface such as env/secret, provider, DB,
  migration, deploy, dependency mutation, Git push/merge, destructive cleanup, or Cost Calibration Gate.
- `idle`: another active owner exists or no executable task is available, so automation leaves the lane alone.
- `manual_required`, `proposal_only`, or `stop_for_hard_block`: the executor stops instead of widening scope.

`claim_task` requires `pending` status, completed dependencies, `can_autodrive` schema readiness, and explicit
`-Execute`. `continue_task` requires `in_progress` status and `can_autodrive`. `run_validation` reads only the target
task's declared `validationCommands` and blocks risky command text before execution.

The serial executor does not implement product code, launch threads, create worktrees, assign parallel workers, merge,
push, clean branches, write env files, call providers, operate Docker databases, read project resources, modify schema
or migrations, deploy, create PRs, or execute Cost Calibration Gate. Those actions remain separate phases or
task-specific approvals.

## Local Capability Authorization Model

To make local development close more loops without weakening safety, future tasks may grant specific local capabilities:

| Capability                       | Default runner state                    | Required approval before use                                                                 |
| -------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Local Docker database            | `task_approval_required`                | task-specific local DB validation approval, with schema/migration/destructive work separated |
| Destructive local Docker DB      | `blocked_without_task_approval`         | task-specific local dev target, operation kind, backup/disposable rationale, rollback        |
| Project `material`/`paper` input | `task_approval_required`                | read-only resource use approval and evidence redaction rules                                 |
| DeepSeek API key destination     | `env_destination_confirmation_required` | confirmed local env-file destination and secret handling approval                            |
| Real provider call               | `blocked_without_task_approval`         | provider validation approval, quota/cost statement, and redacted evidence                    |
| Schema or migration action       | `blocked_without_task_approval`         | migration plan, backup/rollback boundary, and explicit DB operation approval                 |

These approvals are not inferred from the runner existing. They must be recorded in the task queue, task plan, and
evidence before the corresponding local action is executed.

Before a task uses any local capability, the agent layer must pass the local capability gate:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId <task-id> -Capability <capability> -Intent <declare_adapter|use_capability>
```

Use `-Intent declare_adapter` when the task only defines capability-gate or adapter mechanics. Use `-Intent
use_capability` only when the task explicitly approves using that local capability in validation. Do not use an `-Action`
argument; the durable contract is capability plus intent.

The gate emits `localCapabilityDecision` and `adapterAction`:

- `adapter_contract_ready`: the adapter boundary may be documented or wired into later automation, but no real local
  action is approved.
- `capability_ready`: the task records the approved capability value. The script still performs no Docker, resource,
  env, provider, schema, migration, or external-service action.
- `manual_required`: task-specific approval, destination confirmation, quota/cost statement, or redaction rule is
  missing.
- `stop_for_hard_block`: the capability state is unsafe, unknown, or refers to a blocked gate.

`localDockerDatabase` readiness does not approve schema/migration, destructive data operations, or staging/prod
connections. `schemaMigration` readiness requires `approved_migration_plan`; it may consume
`standingLocalSchemaMigrationApproval` only when the task explicitly scopes `src/db/schema/**` or `drizzle/**`, records a
migration plan, rollback/recovery boundary, and redacted evidence, and keeps destructive DB, `drizzle-kit push`,
staging/prod/cloud, env/secret, provider, dependency, deploy, payment, external-service, and Cost Calibration Gate
blocked unless separately approved.

`destructiveLocalDockerDatabase` readiness is task-scoped only. It requires
`approved_destructive_local_dev_only`, a local Docker dev target alias, operation kind, backup/snapshot or disposable DB
rationale, rollback/recovery statement, and redacted evidence. It must never connect to staging/prod/cloud resources,
record database URLs, expose row data, or broaden to provider/env/deploy/payment/external-service work. This policy is
not a global standing destructive DB approval.

`projectResourceRead` readiness does not approve recording full `paper` content, raw answer text, or cleartext
`redeem_code`. `providerKey` readiness does not approve env/secret writes or secret output. `providerCall` readiness
does not approve real provider calls unless the task separately records local validation approval, quota/cost limits, and
evidence redaction rules. Cost Calibration Gate remains blocked.

## Parallel Coordinator Control Point

Codex automation is a guardian first and a worker launcher only when durable approval says so. When startup readiness or
run registry evidence shows another non-expired owner is actively progressing the same repository, the automation loop
must exit or adopt through the existing recovery path instead of running parallel assignment. It must not interrupt a
healthy active development thread.

Before any approved parallel batch assigns workers, the coordinator must run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ParallelReadiness.ps1 -CandidateTaskIds <task-a,task-b> -CoordinatorTaskId <coordinator-task>
```

The script is read-only and produces `parallelDecision`:

- `can_assign_workers`: continue to worker assignment only if the durable parallel approval schema is present.
- `use_serial_execution`: continue in the current coordinator thread, without creating workers.
- `stop_for_file_lock_conflict`: stop and repair the planned batch or use serial execution.
- `stop_for_blocked_gate`: stop for explicit human decision.
- `stop_for_hard_block`: stop because task metadata, durable state, or dependency readiness is invalid.

Parallel work must save enough elapsed time to justify coordination overhead. If the candidate set is small, touches
shared state, or would require repeated handoffs, the automation loop should choose `use_serial_execution` even when
the work is technically separable.

The parallel readiness gate does not approve thread creation, worktree creation, branch creation, closeout, cleanup,
merge, push, PR creation, dependency/package/lockfile changes, schema/migration work, provider/env/secret work,
staging/prod/cloud/deploy work, payment work, external-service work, product e2e work, or Cost Calibration Gate
execution.

When `Invoke-ModuleRunV2Autopilot.ps1` receives explicit parallel candidate ids, it must invoke this gate before thread
rollover or handoff preparation. `parallelDecision: can_assign_workers` maps to `autopilotDecision:
prepare_parallel_workers`. `parallelDecision: use_serial_execution` maps to `autopilotDecision:
continue_current_thread`. Any blocking parallel decision stops autopilot before worker launch. Autopilot still does not
create workers, branches, worktrees, or Codex threads from this decision alone.

When a parallel coordinator executor is present, it may turn `parallelDecision: can_assign_workers` into a
`workerAssignmentManifest` and `parallelCoordinatorDecision: assignment_manifest_ready`. This still does not launch
workers. It only gives the Codex agent layer a redacted, auditable assignment table that must pass the thread bridge and
worker isolation policies before any new thread or worktree action occurs.

## Task Kind Boundary Matrix

| taskKind             | May auto-advance with docs-only approval | Requires separate approval before execution |
| -------------------- | ---------------------------------------- | ------------------------------------------- |
| `read_only`          | inspect status, queue, evidence, audit   | writing files, push, deploy, env access     |
| `docs_only`          | SOP, plan, evidence, audit, state, queue | product behavior, scripts, dependency       |
| `blocked_gate`       | record blocked status and inputs         | executing the blocked action                |
| `local_verification` | local-only evidence when approved        | staging/prod/cloud/provider/env actions     |
| `implementation`     | no                                       | product code, API, service, UI, tests       |
| `dependency`         | no                                       | package or lockfile change                  |
| `closeout`           | local commit when approved by task       | merge, push, branch cleanup unless approved |
| `deploy`             | no                                       | staging/prod/cloud/deploy/public endpoint   |
| `external_service`   | no                                       | provider, payment, external-service action  |

Implementation tasks involving `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, or `ai_call_log` must also carry the security and evidence redaction requirements defined by the relevant SOPs.

## Planning-To-Implementation Autodrive Gate

After Module Run v2 planning succeeds, automation may continue into implementation only through
`implementationAutoSeedGate`.

The planning task may seed implementation tasks when all of these are true:

- planning evidence records `implementationAutoSeedGate`, `localExperienceClosureGate`, proposed implementation task
  ids, focused test targets, localFullLoopGate targets, and blocked remainders;
- each seeded implementation task records `autoDriveLocalImplementationApproval`;
- each seeded implementation task is independently reviewable and has allowed files, blocked files, risk types,
  validation commands, evidence path, and audit review path;
- safe local implementation surfaces stay within server models, contracts, validators, services, corresponding focused
  tests, and governance logs;
- API, Server Action, repository, mapper, UI/browser, role-flow, or e2e bridge surfaces require
  `localExperienceAcceptanceBridgeApproved`;
- dependency, package, lockfile, schema, migration, provider/env/secret, staging/prod/cloud/deploy, payment,
  external-service, and Cost Calibration Gate work remain blocked.

Before an automation run executes a seeded implementation task, it must run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId <planning-task-id> -CandidateTaskId <implementation-task-id>
```

If the gate fails, automation stops and reports the hard block. A passed gate is approval to continue only to the named
candidate task; it is not approval for unrelated implementation, high-risk surfaces, or cross-module work.

When startup returns `startupDecision: no_executable_task`, the autopilot runner may bridge into the three-layer
auto-seed path:

1. `Get-ModuleRunV2ImplementationSeedProposal.ps1` reads the matrix, queue, and project state and emits
   `seedProposalDecision`. It is read-only and may return `proposal_available` without writing durable state.
2. `New-ModuleRunV2ImplementationSeed.ps1` appends pending queue entries only when called with apply mode and an explicit
   `autoDriveLocalImplementationApproval` approval statement. Without apply, it is proposal-only.
3. `Test-ModuleRunV2ImplementationSeedSelfReview.ps1` hard-blocks if coverage, required task metadata, allowed/blocked
   files, validation commands, redaction anchors, or blocked gate wording are incomplete.

Seeded implementation tasks must include `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` in their validation
commands so the existing planning-to-implementation gate is rechecked before execution, not only at seed time.

Runner behavior is:

- no executable task plus proposal available but no explicit seed approval -> `runnerDecision: seed_proposal_available`;
- no executable task plus explicit seed approval -> seed transaction, seed self-review, then retry startup readiness;
- no candidate -> quiet `runnerDecision: no_executable_task`;
- any self-review or transaction failure -> hard block or manual decision.

This bridge is not approval to unpause Codex automation, start provider/env/secret work, change dependencies, change
schema or migrations, perform DB operations, deploy, or execute Cost Calibration Gate.

## Serial Batch Execution

A serial batch may advance multiple tasks in one run only when the user approval names the batch scope and every task is independently reviewable.

For each task in the batch:

1. Confirm dependency completion and blocked gate status.
2. Create or update a task plan before substantive edits.
3. Perform only the allowed file changes.
4. Run task-specific validation.
5. Write evidence with command outputs and residual gaps.
6. Write or update audit review when the task changes governance, scope, security, or evidence policy.
7. Commit the task separately when the batch approval includes local commit.
8. Stop before the next task if validation fails, scope drifts, approval is missing, or blocked gate wording becomes ambiguous.

A batch closeout review must confirm all task evidence, changed files, and Git inventory agree before merge or push is considered.

## Module-To-Module Automation Handoff

## Automation Startup Boundary

Every scheduled Codex automation wakeup must first run:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1
```

The startup gate coordinates:

- automation registration readiness: `project-state.yaml` `codexAutomationId`/`codexAutomationStatus` must match the local
  primary automation TOML, only `tiku-module-run-v2-autopilot` may be scheduled active, historical autopilot state is
  archive-only, and `mechanic-2` is on-demand emergency reference only;
- `D:\tiku` posture: clean detached or clean `master`/`main` is acceptable, clean stale detached is warning-only, clean
  merged `codex/*` routes to hygiene, and dirty `D:\tiku` is a hard stop;
- local automation lease readiness;
- protected branch and repository state;
- current task and pending task status from `task-queue.yaml`;
- Codex automation approval state from `project-state.yaml`;
- stale or dirty automation worktree detection;
- local JS tooling readiness detail for lint/typecheck/Prettier availability;
- local `codex/*` branch hygiene advisory counts;
- external run registry and redacted handoff envelope state under `%USERPROFILE%\.codex\tiku`;
- `stopTaxonomy` classification for terminal runner/startup/finalizer decisions;
- blocked gate anchors.

Automation may continue only when the startup gate returns one of these zero-exit decisions:

- `startupDecision: continue_current_task`;
- `startupDecision: prepare_next_task`;
- `startupDecision: closeout_recovery`.
- `startupDecision: adopt_recoverable_run`;
- `startupDecision: open_recovery_plan`;
- `startupDecision: cleanup_stale_artifacts`.

Automation must stop when the startup gate returns:

- `startupDecision: exit_active_owner_present`;
- `startupDecision: stop_existing_run_active`;
- `startupDecision: stop_for_hard_block`;
- `startupDecision: stop_for_manual_decision`;
- `startupDecision: manual_required_owner_recovery`;
- `startupDecision: no_executable_task`.

The startup gate does not create threads, write handoffs, delete worktrees, delete branches, or modify source files. It
only decides whether the automation wakeup is allowed to proceed to the existing autopilot orchestrator or to a
proposal-only planning step. Branch hygiene output from startup is advisory; cleanup still belongs to
`Test-ModuleRunV2BranchHygiene.ps1 -Cleanup` and requires an approved cleanup path.

Every startup and runner terminal decision should emit one `stopTaxonomy` value:

- `approval_missing`;
- `active_owner`;
- `hygiene_deferred`;
- `remote_divergence`;
- `validation_failed`;
- `no_task`;
- `registration_mismatch`;
- `closeout_pending`;
- `hard_block`.

This taxonomy is not an approval. It is a compact reason code so the next wakeup and the human operator can see why an
automation stopped without rereading full logs.

`Test-ModuleRunV2UnattendedReadiness.ps1` writes a `runRegistryHeartbeat` to
`%USERPROFILE%\.codex\tiku\automation-runs` for the current worktree. The registry entry is a redacted local control
record with `runId`, `automationId`, `threadRole`, `taskId`, `branch`, `worktreePath`, `status`, `heartbeatAtUtc`,
`phase`, `changedFiles`, `lastSafeCheckpoint`, `nextRecommendedAction`, `safeToAdopt`, `cleanupPolicy`, and
`redactedHandoffPath`. It must not contain secrets, provider payloads, raw prompts, raw generated AI content, DB URLs,
Authorization headers, plaintext `redeem_code`, or full `paper` content.

Diagnostic checks that should not claim ownership must pass `-NoWrite`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId <task-id> -NoWrite
```

With `-NoWrite`, the gate must emit `runRegistryHeartbeat: skipped_no_write`. Scheduled automation should write a
heartbeat only when it is actually entering or owning the current lane; recovery audits and human-invoked diagnostics
should prefer `-NoWrite`.

Before an automation thread exits on a terminal or owner-recovery state, it must run
`Set-ModuleRunV2RunRegistryFinalizer.ps1` for its current worktree. The finalizer writes the true `changedFiles`,
`phase`, `blockerKind`, `stopTaxonomy`, `severity`, `requiresHuman`, `evidencePath`, `auditReviewPath`,
`closeoutTransactionState`, `nextCommand`, `riskIfAutoContinued`, `stateWritten`, `noWriteReason`, `resumePointer`,
`safeToAdopt`, and `cleanupPolicy` fields. Idle, PlanOnly, and diagnostic no-op exits may choose `stateWritten: none`,
but they must emit a human-readable no-write reason and a resume pointer. A thread that stops after focused gates pass
but advisory baseline fails must finalize as
`status: stopped`, `safeToAdopt: false`, and `cleanupPolicy: none` unless a redacted handoff explicitly permits
adoption. A closed and clean run may finalize as `status: cleanup_ready` only after evidence proves merge/push/parking
completed. Every terminal envelope must give the operator the three-line conclusion: why it stopped, risk if it
auto-continued, and the next command or next decision point.

Clean stale automation worktrees are `recoverableAutomationWorktree` findings, not hard blocks. A stale worktree is
recoverable only when it is under the configured automation worktree root and `git status --porcelain` is clean. Dirty
automation worktrees are routed by the registry:

- fresh `status: active` heartbeat -> `exit_active_owner_present`;
- `status: active`, dirty worktree, `safeToAdopt: false`, and existing evidence/audit -> run the read-only
  validation-surface classifier before the heartbeat shortcut and
  return `manual_required_owner_recovery` when evidence shows validation-surface mismatch, unrelated baseline failure, or
  pending closeout transaction state;
- `status: recoverable|stopped|abandoned`, `safeToAdopt: true`, and existing redacted handoff ->
  `adopt_recoverable_run`;
- `status: recoverable|stopped|abandoned` without an adoptable handoff -> `open_recovery_plan`;
- no registry ownership -> `stop_for_manual_decision`;
- dirty worktree with an unsafe or inconsistent registry -> `stop_for_hard_block`.

Clean registry entries marked `status: cleanup_ready` with `cleanupPolicy: cleanup_ready` route startup to
`cleanup_stale_artifacts`. Clean stale automation worktrees under the Codex automation worktree root also route startup
to `cleanup_stale_artifacts` before next-task selection, because the stopped-automation hygiene gate can classify them as
`stale_clean_worktree` cleanup candidates. Expired `status: active` registry files whose heartbeat is stale and whose
worktree path is missing are classified as `expired_active_missing_worktree` cleanup candidates by stopped-automation
hygiene. Expired `active` registry files whose task is terminal or no longer present in the active queue, whose worktree
is clean or non-Git, and whose registry has no redacted handoff are classified as `expired_active_terminal_registry`
cleanup candidates; cleanup may remove only the registry file, not the worktree. Fresh active heartbeats remain
active-owner no-ops. Invalid paths, active leases, remote divergence, dirty worktrees, failed cleanup actions, and
non-ancestor state drift remain hard blocks unless a narrower post-closeout checkpoint exception applies.

If startup sees state SHA values that are accepted ancestors of current Git reality, it should emit a
`startupStateWarning` and `startupStateCheckpoint: accepted_ancestor_checkpoint` instead of blocking or starting a state
write loop. Placeholder current-task commit values such as `pending-local-commit` must not be copied into handoff
content; handoff generation should fall back to the current Git HEAD and mark the fallback.

After Module Run v2 closeout, automation may generate a `nextModuleRunCandidate` proposal. The proposal is a planning
artifact only; it is not approval to start implementation in the next module.

The proposal must read durable state:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`;
- `docs/04-agent-system/state/project-state.yaml`;
- `docs/04-agent-system/state/task-queue.yaml`;
- latest Module Run evidence;
- latest Module Run audit review.

Automation may:

- detect that all Batches in the current Module Run appear complete;
- propose the next execution module;
- draft the next Module Run plan outline;
- seed low-risk local implementation tasks after `implementationAutoSeedGate` passes and the three-layer auto-seed bridge
  passes proposal, transaction, and self-review;
- update handoff wording;
- mark provider, env/secret, staging/prod, deploy, payment, external-service, and Cost Calibration Gate work as blocked
  remainder.

The seed proposal must treat terminal queue tasks (`done`, `closed`, `pushed`, or `merged`) that match a Module Run v2
`seededExecutionModule` and `targetClosureItem` as already completed target closure items. It must not propose a
duplicate task for an already terminal closure item, and when every target closure item for a module is terminal it must
advance to the next dependency-satisfied execution module or return `no_seed_candidate`.

Automation must not:

- modify schema, migration, dependency, env/secret, provider configuration, deploy configuration, payment, or
  external-service surfaces;
- read or record secrets;
- execute Cost Calibration Gate;
- continue implementation across execution modules without a fresh Module Run plan and human approval.
- execute a seeded implementation task when `implementationAutoSeedGate` fails.

Module Run v2 automatic handoff should normally pair with a thread rollover decision. After closeout, the default
decision is `require_new_thread` before entering the next execution module.

When autopilot orchestration is approved for the current task, the closeout flow may generate a handoff and return
`autopilotDecision: launch_new_thread`. The new thread must still start with recovery audit and a fresh Module Run v2
plan before business implementation.

For routine scheduler wakeups where the current task is already `done` or `closed`, automation should run closeout
recovery before selecting the next task. If the closeout recovery sees a dirty worktree, remote divergence, missing
evidence, or stale state that is not an accepted closeout recovery point, it must stop rather than write a new handoff.

The only dirty-worktree exception is `approvedCloseoutContinuation`: the completed task itself must record explicit
approval for commit, merge, push, cleanup, and worktree parking. In that shape, unattended readiness may return
`closeout_recovery`. The dispatcher should return `agentAction: run_approved_closeout` only when a structured
`closeoutPolicy` is present, and execution must still go through `Invoke-ModuleRunV2ApprovedCloseout.ps1` to complete the
local Git closeout before startup selects the next pending task.

The primary autopilot may absorb only limited mechanism self-healing: stale clean worktree cleanup, superseded registry
cleanup, recoverable seed transaction closeout, automation registration mismatch reporting, and evidence/template gap
reporting. It must not absorb business code repair, dirty owner takeover, or high-risk capability execution.

Auto-seeded implementation tasks must be born with evidence and audit templates. The evidence template must include
`RED`, `GREEN`, `Commit`, `localFullLoopGate`, `threadRolloverGate`, `nextModuleRunCandidate`, and `Cost Calibration Gate
remains blocked` anchors. Placeholder values such as `GREEN: pending` and `Commit: pending` are intentional scaffolding,
not completion proof; module closeout readiness must reject them.

An accepted closeout recovery point may have `project-state.yaml` repository SHA values that are ancestors of the current
`master` and `origin/master`, because the final closeout, validation repair, merge, and push commits can only be known
after earlier evidence is written. This exception applies only when the current task is `done` or `closed`, Git is clean
and aligned, and the task evidence/audit paths are present. Non-ancestor SHA drift remains a hard block.

The same `postCloseoutHandoffSha` exception may be used by the next pending task when `project-state.yaml` still names a
durable current task that is `done` or `closed`, that current task's evidence and audit review exist, `master` and
`origin/master` are aligned, and the recorded SHAs are ancestors of current Git reality. This exception is only a handoff
rule; it does not waive task scope, blocked files, risk gates, or validation.

## Per-Task Review And Commit Rule

Each task must finish with:

- task plan;
- evidence;
- audit review when required;
- `git diff --check`;
- formatting check for changed docs;
- search validation for required blocked gate statements and project terms;
- Git inventory showing the changed files are task-scoped.

One task should normally produce one local commit. Dependency approval, dependency installation, implementation, and closeout evidence must be separate commits unless a task-specific approval says otherwise.

## Merge, Push, And Cleanup Boundary

Local commit, local merge, remote push, PR creation, branch cleanup, worktree deletion, and deployment are separate decisions.

Automation must not infer approval for one action from approval for another. Evidence must record:

- target branch;
- command result;
- commit SHA when applicable;
- push target when approved;
- cleanup result when approved;
- residual branch or worktree if cleanup is deferred.

Pushing `master`, creating or updating PRs, force-with-lease operations, deploy actions, and cloud changes require explicit human approval.

When a completed task explicitly authorizes commit, fast-forward merge into `master`, push `origin/master`, short-lived
branch cleanup, and automation worktree parking, guarded automation may execute that exact local closeout path. The
preferred durable approval is a structured task `closeoutPolicy`:

```yaml
status: ready_for_closeout
closeoutPolicy:
  localCommit: approved
  fastForwardMerge:
    approved: true
    targetBranch: master
  push:
    approved: true
    target: origin/master
  cleanup:
    deleteShortBranch: true
    parkWorktree: true
```

`ready_for_closeout` without this complete policy is not executable. A complete policy allows closeout from dirty
task-scoped files or from a clean short-lived branch that already has task commits ahead of the base branch. Automation
must still rerun module-closeout readiness, pre-push readiness, and scope checks first. It must not broaden to PR
creation, force push, dependency changes, provider work, env/secret work, deploy, payment, external-service action, or
Cost Calibration Gate execution.

Approved closeout may start from either a dirty task-scoped closeout worktree or a clean short-lived branch that already
has committed task work ahead of the base branch. A clean branch with no commits ahead of the base is not an executable
closeout candidate.

## Standing Unattended Local Closeout Approval

`project-state.yaml` may record a durable `automation.unattendedControl.standingUnattendedLocalCloseoutApproval`. This
approval is intentionally narrower than general automation approval. It applies only to low-risk Module Run v2 local
implementation tasks that were produced by the governed auto-seed transaction and that also carry
`autoDriveLocalImplementationApproval`.

The seed transaction may materialize this standing approval into each eligible seeded task as:

```yaml
closeoutPolicy:
  localCommit: approved
  fastForwardMerge:
    approved: true
    targetBranch: master
  push:
    approved: true
    target: origin/master
  cleanup:
    deleteShortBranch: true
    parkWorktree: true
```

This is the only allowed durable conversion from standing approval to executable commit/merge/push/cleanup authority.
The conversion must happen while the seed task is created, so later closeout scripts consume ordinary task-scoped
`closeoutPolicy` instead of chat memory.

The approval is executable only when all of these remain true:

- the task is `taskKind: implementation` and `seededImplementationTask: true`;
- high-risk capability values remain blocked or task-specific;
- `allowedFiles` and `blockedFiles` exclude out-of-scope and high-risk surfaces;
- validation evidence, audit review, module-closeout readiness, pre-push readiness, active-owner, lease, run registry,
  hygiene, and remote-divergence gates all pass;
- the closeout path uses repository scripts for local commit, fast-forward merge to `master`, push to `origin/master`,
  merged short-branch cleanup, and worktree parking.

The standing approval is not approval for mechanism repairs, non-seeded tasks, PR creation or update, force push,
dependency/package/lockfile changes, schema or migration work, env/secret work, provider calls or provider
configuration, destructive database work, e2e, external-service actions, deploy, payment, authorization model changes, or
Cost Calibration Gate execution. Those still require fresh task-specific approval and must pass the local capability
gate before any action.

## Blocked Gate Enforcement

The following remain blocked unless a task records fresh explicit approval:

- Cost Calibration Gate;
- provider cost measurement, model selection measurement, sample measurement, real provider call, provider quota, provider endpoint, or provider fallback configuration;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, API key, secret, token, password, or database URL;
- staging, prod, cloud, deploy, public endpoint, callback URL, TLS, object storage, or production-like resource;
- payment, pricing, invoice, refund, reconciliation, or external-service action;
- schema, migration, database destructive operation, data backfill, or `drizzle-kit push`;
- dependency, package, lockfile, CLI, SDK, or test framework changes;
- authorization permission model changes without an approval path;
- direct write from AI generated content or organization training into formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.

Blocked gates may be documented, clarified, or kept synchronized as docs-only tasks, but the blocked action itself must not be executed.

## Evidence, Audit, State, And Queue Sync

Every task must keep these surfaces aligned:

- `task-queue.yaml`: execution state, dependencies, allowed files, blocked files, risk types, validation commands, evidence path;
- `project-state.yaml`: current phase, current task, repository SHA recovery point, handoff, latest evidence path;
- task plan: intended scope and risk defenses;
- evidence: observed commands, changed files, approval boundary, blocked-work statement, redaction status;
- audit review: independent verdict, findings, residual risks, and gate review.

If Git reality and `project-state.yaml` disagree, the next docs-only task should reconcile the drift before claiming unrelated work.

Evidence must not record prompt, AI raw input/output, provider payload, secret, token, database URL, Authorization header, password, cleartext `redeem_code`, employee subjective answer text, full `paper` content, or raw generated AI content that should not be visible to ordinary operations views.

## Interruption And Cross-Session Recovery

On interruption or a new session:

1. Read `project-state.yaml`, `task-queue.yaml`, latest evidence, latest task plan, and latest audit review.
2. Verify current branch, `master` / `origin/master` alignment, unmerged branches, and worktree list.
3. Prefer durable state over chat memory.
4. If a commit, merge, push, or cleanup was partially completed, reconcile Git reality before new work.
5. If the same blocker recurs three times for one task, mark the task blocked and stop.

For Module Run v2 unattended continuation, run the unattended readiness script after the recovery read and before any
edit. If it returns `stop_for_hard_block`, stop even when the next local action looks obvious from chat context.

For Codex scheduled automation, run the automation startup readiness script before unattended readiness or autopilot
orchestration. If it returns `stop_existing_run_active`, another human or automation run owns the lane and the scheduler
must exit without editing or launching a new thread.

## Stopped Automation Hygiene

If a scheduled Codex automation wakeup stops because another run owns the lane, or because startup readiness finds a
stale automation artifact, the next recovery pass should run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1
```

This gate is read-only by default. It inventories:

- the configured automation lease file;
- run registry files under `%USERPROFILE%\.codex\tiku\automation-runs`;
- redacted handoff envelopes under `%USERPROFILE%\.codex\tiku\handoffs`;
- Codex automation worktrees under the configured worktree root;
- temporary dry-run handoff directories under the system temp root.

It returns `stoppedAutomationHygieneDecision: clean` when no residual artifact needs action, and
`stoppedAutomationHygieneDecision: cleanup_available` when all detected residual artifacts are safe cleanup candidates.
When `-Cleanup` attempts those safe candidates but Windows or another local filesystem owner keeps an otherwise safe
directory locked, it returns `stoppedAutomationHygieneDecision: cleanup_deferred` and records
`stoppedAutomationHygieneDeferredCleanupCount`. `cleanup_deferred` is not a hard stop by itself; the runner must rerun
startup readiness and may continue guarded dispatch when no active owner, dirty worktree, invalid lease, unsafe cleanup
path, or other hard block remains.
It returns hard-block decisions for active leases, invalid leases, dirty worktrees, or cleanup paths outside the approved
roots.

Cleanup is explicit:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup
```

`-Cleanup` may remove only expired clean lease files, run registry files explicitly marked `cleanup_ready`, expired
`active` registry files with stale heartbeat and missing worktree path, expired active terminal registry files that no
longer own executable work, their redacted handoff envelopes inside the configured handoff root, stale clean automation
worktrees inside the Codex automation worktree root, orphan automation worktree directories inside that root that are no
longer registered by Git and contain no `.git` metadata, and dry-run handoff temp directories named
`tiku-autopilot-handoff-*` inside the system temp root. It must not delete dirty worktrees, orphan directories that still
contain Git metadata, paths outside the approved roots, source files in the primary repository, env files, schema,
migration, or evidence logs.

If `git worktree remove --force` partially succeeds and leaves a non-Git orphan directory under the automation worktree
root, the hygiene gate must keep classifying it as `orphan_worktree_directory` until it is removed or blocked for manual
inspection. A later read-only pass must not report `clean` while such a residue still exists.

At the end of an automation-owned run, the current clean non-protected automation worktree should be explicitly parked
with `automationWorktreeParking`: detach the current worktree to `origin/master` or the configured parking target after
all evidence, validation, commit, merge, push, and branch cleanup decisions that are approved for the task are complete.
Parking must refuse dirty worktrees and protected `master` / `main` branches. A parked worktree is clean, detached, and
aligned with the target ref so the next Codex automation startup can safely ignore it as already接手-ready residue.

If the hygiene gate returns `stop_existing_run_active`, automation must leave the active run alone. If it returns
`stop_dirty_worktree`, `stop_invalid_lease`, or `stop_manual_cleanup_required`, automation must stop and report the
artifact class for manual inspection instead of attempting repair.

Local `codex/` branch residue is classified separately by:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2BranchHygiene.ps1
```

The branch hygiene gate is dry-run by default. It emits `branchCleanupCandidate` only when a local branch matching
`codex/*` is already merged into the configured base branch, and emits `branchManualReviewRequired` for unmerged local
branches. `-Cleanup` may delete only merged local candidates through `git branch -d`; unmerged branches are never force
deleted by this gate and require manual review.

## Stop Conditions

Stop automated advancement immediately when:

- blocked gate execution is requested without approval;
- approval scope is ambiguous;
- validation fails and the cause is not safely repairable inside the task scope;
- changed files exceed `allowedFiles` or touch `blockedFiles`;
- dependency, env/secret, schema, migration, deploy, provider, payment, or external-service surfaces become necessary;
- `project-state.yaml` and Git reality disagree in a way that affects task selection;
- a task reaches the maximum retry count;
- user asks to pause, inspect, or discuss before editing.

## Human Handoff

When stopping, the handoff must state:

- current task id and status;
- branch and commit state;
- latest evidence path;
- blocked gate status;
- validation result;
- next recommended task or required human decision.

Do not describe unverified work as complete.
