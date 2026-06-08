# Thread Rollover And Handoff Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines when a long-running Codex thread should continue, suggest a new thread, require a new thread, or stop for human handoff. It does not approve thread creation automation, product code implementation, code-stage queue seeding, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Keep long-running project advancement from drifting after context compaction, module switching, task-type switching, or mixed goals.

The mechanism must ensure:

- a thread can continue when durable state is clear;
- a thread suggests rollover before context quality becomes unsafe;
- a new thread starts from repository state, not chat memory;
- uncommitted work is not handed off casually;
- blocked gates remain blocked across thread boundaries.

## Decision Labels

Use these labels in handoff or evidence:

| Label                     | Meaning                                                       | Required action                                  |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `continue_current_thread` | context, Git, task scope, and recovery state are clear        | keep working in current thread                   |
| `suggest_new_thread`      | current work can continue, but rollover would reduce risk     | tell user and prepare handoff if approved        |
| `require_new_thread`      | continuing in the current thread is unsafe or likely to drift | stop after writing handoff and wait for approval |
| `stop_for_human_handoff`  | state, approval, Git, or blocked gate is ambiguous            | stop and ask for decision                        |

Do not treat `suggest_new_thread` as permission to create or use a new thread.

## Machine Decision Gate

For Module Run v2 unattended control, use this local script before continuing a multi-Batch run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ThreadRolloverReadiness.ps1 -CompletedBatchCount <count>
```

The script emits one of the decision labels:

- `continue_current_thread`: exit code `0`; current thread may continue when the task scope is still valid.
- `suggest_new_thread`: exit code `0`; current thread may continue only after recording the suggestion and handoff
  sources.
- `require_new_thread`: non-zero exit; unattended execution must stop before the next implementation or module step.
- `stop_for_human_handoff`: non-zero exit; state, approval, Git, or blocked-gate ambiguity requires user decision.

When a non-zero decision is returned, do not treat it as a failed task implementation. Treat it as a controlled stop that
protects context quality and approval boundaries.

## Thread Launch Policy Gate

Thread rollover decisions become launch actions only through:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ThreadLaunchPolicy.ps1 -ThreadRolloverDecision <decision> -HandoffPath <path>
```

The policy emits `threadLaunchDecision`:

- `continue_current_thread`: no thread launch is needed.
- `prepare_handoff`: handoff should be generated, but no launch is approved.
- `prepare_handoff_then_continue`: handoff is generated and current-thread continuation remains acceptable.
- `launch_new_thread`: `create_thread` may be called with the generated handoff.
- `stop_for_human_handoff`: stop because launch is required but approval, tool availability, or handoff is missing.

The handoff generator is:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ThreadHandoff.ps1
```

Use `-DryRun` for readiness checks that only need to inspect the would-be decision inventory. Dry-run mode must not
create or update the requested output path. Autopilot dry-run handoff may use a temporary file outside the repository so
`Test-ModuleRunV2ThreadLaunchPolicy.ps1` can validate handoff presence without dirtying tracked files.

Generated handoffs must include `create_thread` and `send_message_to_thread` instructions for Codex-level orchestration,
but must not include secrets, raw prompts, provider payloads, database URLs, Authorization headers, cleartext
`redeem_code`, or raw generated AI content.

## Continue Current Thread Criteria

Continue in the current thread when all are true:

- current task id, branch, and allowed files are clear;
- `project-state.yaml`, `task-queue.yaml`, latest task plan, evidence, and audit review agree;
- Git state is clean or dirty files are task-scoped;
- no blocked gate execution is needed;
- the newest user request matches the active task;
- context contains enough recent state to avoid rereading large history repeatedly;
- the task is close enough to completion that rollover would add more risk than value.

## Suggest New Thread Signals

Suggest a new thread when any signal appears:

- a module boundary has been reached;
- a serial docs-only batch has completed a natural checkpoint;
- context compaction has occurred more than once in the same workstream;
- the next task changes risk type, such as docs-only to implementation, dependency, schema, local verification, or deploy planning;
- the next task requires a different skill or plugin family;
- the discussion has mixed strategy, implementation, debugging, and closeout goals;
- the thread has accumulated enough evidence paths that active recovery is easier from repository files than chat history;
- user asks for a fresh continuation point.

When suggesting rollover, provide a short reason and the exact handoff source files.

For Module Run v2, also suggest a new thread when the 4th Batch in the same Module Run has completed. The thread may
continue only when Git status, evidence, audit review, task plan, and blocked gates are still clear.

## Require New Thread Signals

Require a new thread, or stop for human handoff, when any signal appears:

- current task identity is uncertain;
- latest user request conflicts with durable state;
- uncommitted work cannot be confidently scoped;
- the next task needs a new module, code-stage planning, implementation, dependency, schema, migration, local verification, or security review boundary;
- a prior context compaction removed critical reasoning and durable state has not yet been reread;
- a tool, skill, or plugin failure changes the execution path;
- Git branch, worktree, or remote alignment is ambiguous;
- evidence or audit review for the previous task is missing;
- a blocked gate would be needed to continue.

Do not continue implementation or high-risk planning in the same thread when the recovery state is ambiguous.

For Module Run v2, also require a new thread when:

- the 6th Batch in the same Module Run has completed, unless the user explicitly requests continuing and a recovery
  audit passes;
- Module Run closeout has completed and the next action enters a different execution module;
- the next work switches into schema, dependency, provider, env/secret, deploy, payment, external-service, or security
  review boundary;
- context compaction occurred and durable state has not yet been reread.

The machine gate implements these defaults. Continuing after Batch 6 is allowed only when the user explicitly requests
continuation and a recovery audit has passed.

## Rollover Preparation Gate

Before starting or requesting a new thread, the current thread must prepare a handoff that records:

- current mode;
- current phase and task id;
- branch and Git status;
- latest commit SHA when available;
- latest evidence path;
- latest audit review path;
- latest task plan path;
- blocked gates;
- allowed next task;
- forbidden scope;
- required read order for the next thread;
- validation status;
- residual risks;
- whether uncommitted work exists.

If uncommitted work exists, the handoff must say whether it is task-scoped and why it was not committed.

Module Run v2 handoff must additionally record:

- current Module Run;
- completed Batches;
- latest SHA;
- evidence, audit review, and task plan paths;
- blocked gates;
- allowed next task;
- forbidden scope;
- validation status;
- next recommended Module Run.

## New Thread Startup Gate

A receiving thread must start by reading:

1. `AGENTS.md`.
2. `docs/03-standards/code-taste-ten-commandments.md`.
3. Relevant ADRs.
4. `docs/04-agent-system/state/project-state.yaml`.
5. `docs/04-agent-system/state/task-queue.yaml`.
6. Latest task plan.
7. Latest evidence.
8. Latest audit review.
9. Relevant SOPs named by `project-state.yaml`.

Then it must verify:

- current branch;
- `master` and `origin/master` alignment;
- dirty or untracked files;
- short-lived branch residue;
- worktree list when worktrees are in use;
- whether the newest user request changes the handoff.

The receiving thread must prefer repository files over the previous chat summary.

## Handoff Shape

Use this shape:

```text
thread rollover handoff:
decision:
reason:
mode:
phase:
task:
branch:
commit:
latest task plan:
latest evidence:
latest audit review:
blocked gates:
allowed next task:
forbidden scope:
validation:
git state:
read order:
user decision needed:
```

Keep the handoff short enough for a new thread to read quickly, but precise enough to prevent scope drift.

## Agent Autonomy Boundary

An agent may:

- detect rollover signals;
- recommend rollover;
- prepare a handoff;
- stop when rollover is required;
- continue in the same thread when criteria are met.

An agent must not:

- create, fork, archive, or switch Codex threads without explicit user request or an approved thread-management task;
- use a new thread to bypass task plan, evidence, audit review, validation, or Git closeout;
- carry uncommitted work into a new thread without a written handoff;
- treat chat summary as the source of truth;
- use thread rollover to bypass blocked gates.

When a task explicitly approves autopilot thread launch and the Codex thread tool is available, the agent may consume
`threadLaunchDecision: launch_new_thread` to call `create_thread` with the generated handoff. It must not start
next-module implementation unless the handoff and new thread startup gate provide a fresh approved Module Run v2 plan.
If the launch decision came from `-DryRunHandoff`, the agent may use it as readiness evidence only; a receiving thread
requires a durable redacted handoff or a newly generated approved handoff before implementation begins.

## User Cooperation Model

In `semi_auto`, the user remains the trigger for task continuation and thread creation.

Recommended user commands:

- `继续当前线程推进下一项 docs-only 任务。`
- `请准备线程切换 handoff，但暂不创建新线程。`
- `请在新线程继续，并从最新 project-state/task-queue/evidence 恢复。`
- `暂停自动推进，先做状态审查。`

If the user asks whether a new thread is needed, answer with the decision label, reason, and required handoff state.

## Blocked Gates

Cost Calibration Gate remains blocked pending fresh explicit approval.

Thread rollover must not execute or imply approval for:

- provider cost measurement, real provider calls, provider quota, endpoint, model selection, fallback configuration;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, token, password, database URL;
- staging/prod/cloud/deploy, public endpoint, callback URL, TLS, object storage, production-like resource;
- payment, pricing, invoice, refund, reconciliation, external-service action;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive database operation, `drizzle-kit push`;
- code-stage queue seeding or implementation queue item creation;
- `automation.mode` change;
- formal `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` runtime behavior.

## Stop Conditions

Stop instead of rolling over when:

- no latest evidence or audit review exists;
- Git state is ambiguous;
- user approval does not allow thread creation or continuation;
- blocked gate execution would be required;
- evidence would expose protected data;
- the next task cannot be identified from durable state;
- the handoff cannot be kept concise and accurate.

## Forbidden Claims

Do not claim:

- a new thread can safely continue without reading durable state;
- context compaction is harmless without recovery checks;
- rollover approves product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- rollover proves `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` runtime behavior;
- Cost Calibration Gate readiness while it remains blocked.
