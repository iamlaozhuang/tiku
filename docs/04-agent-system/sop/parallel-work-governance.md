# Parallel Work Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines when Tiku agents may use parallel threads, branches, or worktrees, and how parallel work is reconciled into a serial audit trail. It does not approve thread creation, worktree creation, code-stage queue seeding, product code implementation, dependency changes, schema or migration work, env/secret work, provider work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution. Cost Calibration Gate remains blocked.

## Purpose

Make parallel advancement safe and auditable.

Parallel work must not weaken:

- queue-first task selection;
- one focused task per reviewable commit by default;
- evidence before conclusion;
- `allowedFiles` and `blockedFiles` boundaries;
- blocked gate enforcement;
- state and queue consistency;
- final serial merge, push, and cleanup review.

## Default Rule

Serial execution is the default.

Parallel work is an exception that requires a written reason in the task plan or coordinator evidence. The reason must name the independent scopes and explain why running the tasks in parallel will not create shared-file, shared-state, dependency, or blocked-gate conflicts.

## Parallel Readiness Levels

Classify every candidate task before parallel work starts:

| Level           | Meaning                                              | Allowed action                                 |
| --------------- | ---------------------------------------------------- | ---------------------------------------------- |
| `serial_only`   | task has shared state, shared files, or dependencies | run after the blocker task closes              |
| `read_only`     | task only inspects docs, code, Git, or evidence      | may run in parallel when evidence is separated |
| `docs_isolated` | task writes separate docs and separate evidence      | may run in parallel with coordinator approval  |
| `code_isolated` | task writes independent product code surfaces        | requires separate implementation approval      |
| `blocked_gate`  | task needs blocked or high-risk action               | stop before execution                          |

Tasks touching `project-state.yaml` or `task-queue.yaml` are `serial_only` unless one coordinator thread owns those files and worker outputs are merged through that coordinator.

## Parallel Entry Gate

Parallel work may start only when all conditions are true:

- the user approval explicitly allows parallel work or the task queue has an approved parallel batch;
- every candidate task has terminal dependencies;
- every candidate task has concrete `taskKind`, `allowedFiles`, `blockedFiles`, `riskTypes`, and `validationCommands`;
- file scopes do not overlap, except for read-only inspection;
- only one coordinator owns `project-state.yaml`, `task-queue.yaml`, batch evidence, and final handoff updates;
- every worker branch or worktree starts from the same recorded base SHA;
- Git is clean before branch or worktree creation;
- blocked gates are named and excluded;
- the thread handoff gate is satisfied for every thread.

If any entry condition fails, use serial execution.

## Executable Parallel Readiness Gate

Before a coordinator assigns workers, it must run the local read-only readiness gate:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ParallelReadiness.ps1 -CandidateTaskIds <task-a,task-b> -CoordinatorTaskId <coordinator-task>
```

The gate emits `parallelDecision`:

| Decision                      | Exit | Meaning                                                                 |
| ----------------------------- | ---- | ----------------------------------------------------------------------- |
| `can_assign_workers`          | 0    | candidates are isolated and file locks do not overlap                   |
| `use_serial_execution`        | 0    | work is safe to continue only through the coordinator's serial workflow |
| `stop_for_file_lock_conflict` | 1    | two or more write scopes can touch the same path                        |
| `stop_for_blocked_gate`       | 1    | a candidate needs a blocked or high-risk gate                           |
| `stop_for_hard_block`         | 1    | task metadata, durable state, or dependency readiness is invalid        |

The gate is a guardian control, not an executor. It reads `project-state.yaml` and `task-queue.yaml`, classifies
candidate tasks, emits a file-lock table, and stops before any ambiguous assignment. It does not create branches,
worktrees, Codex threads, handoffs, commits, merges, pushes, cleanup actions, provider calls, dependency changes,
schema/migration work, or Cost Calibration Gate activity.

`use_serial_execution` is not a failure. It is the expected answer when a candidate touches shared coordinator-owned
state, scripts, global automation SOPs, dependency manifests, or any other scope where parallel worker overhead would
cost more time or token budget than it saves.

## Durable Parallel Approval Schema

Parallel approval is durable only when the task queue or task plan records:

```text
parallelBatchId:
coordinatorTaskId:
candidateTaskIds:
baseSha:
allowedParallelActions:
blockedParallelActions:
workerIsolation:
serialIntegration:
fileLocks:
  - taskId:
    branch:
    worktree:
    allowedFiles:
    blockedFiles:
    evidencePath:
    auditReviewPath:
mergeOrder:
```

Absent this schema, Codex automation must treat parallel work as unapproved and fall back to serial execution or a
proposal-only response.

## Coordinator Role

The coordinator is the only actor allowed to:

- claim the parallel batch;
- assign task ids, branch names, and file locks;
- update `project-state.yaml`;
- update `task-queue.yaml`;
- decide merge order;
- run post-merge validation on `master`;
- push and clean branches when approved;
- write the final batch handoff.

Worker threads may write only their assigned task files, task plan, evidence, and audit review. They must not edit the queue or project state unless the coordinator explicitly assigns that as their only task.

## File Lock Rules

Before workers start, evidence must record a file lock table:

```text
task id:
branch:
base sha:
allowed files:
blocked files:
shared files:
coordinator:
worker:
merge order:
```

Two write tasks may not own the same file path. Directory globs count as overlap when they can match the same future file.

These files are shared state and require serial ownership:

- `docs/04-agent-system/state/project-state.yaml`;
- `docs/04-agent-system/state/task-queue.yaml`;
- global SOP index or dispatch documents;
- dependency manifests and lockfiles;
- schema, migration, runtime config, script, or environment files.

## Branch And Worktree Rules

Each parallel task must use its own short-lived branch or approved worktree.

Required branch record:

```text
branch:
base sha:
task id:
allowed files:
validation commands:
evidence path:
audit review path:
```

Worktree creation is optional and must be approved when the environment requires it. Cleanup must follow the existing closeout and worktree provenance rules. Never remove a worktree unless its path and ownership are verified.

## Worker Completion Gate

Before a worker hands work back to the coordinator, it must provide:

- task plan;
- evidence with command results;
- audit review when governance, scope, security, evidence, or closeout policy changed;
- `git diff --check`;
- formatting check for changed docs or formatted files;
- relevant local validation level from `local-first-validation-governance.md`;
- Git inventory showing only assigned files changed;
- residual risks and blocked items.

Workers must not claim merged, pushed, or closed status unless they performed and verified those closeout actions under approval.

## Serial Integration Gate

Parallel branches are integrated serially.

For each branch in merge order:

1. Verify the branch still contains only assigned files.
2. Verify its evidence and audit review are complete.
3. Switch to `master`.
4. Confirm `master` is clean and aligned with the intended base or current remote state.
5. Merge the branch.
6. Run the task validation commands on the merged result.
7. Run broader quality gates when changed surfaces require them.
8. Update coordinator evidence with merge result.
9. Only then proceed to the next branch.

If a later branch no longer applies cleanly after an earlier merge, stop and repair that branch inside its own task scope. Do not bury conflict fixes in an unrelated merge commit.

## Push And Cleanup Gate

Push and cleanup remain explicit closeout actions.

When approved, the coordinator may:

- push `master` after post-merge validation passes;
- delete local branches already merged into `master`;
- remove only verified, coordinator-owned worktrees;
- record final `master...origin/master` alignment.

Remote branch deletion, force-with-lease, PR creation, deployment, and cloud actions still require separate explicit approval when not already covered.

## Parallel Stop Conditions

Stop parallel work immediately when:

- two tasks need the same writable file or directory;
- a task needs `project-state.yaml` or `task-queue.yaml` without coordinator ownership;
- a dependency is not terminal;
- a worker needs provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- a worker needs dependency, schema, migration, script, package, or lockfile work without approval;
- authorization permission model changes require a separate approval path;
- evidence would need secrets, provider payloads, cleartext `redeem_code`, private answer text, full `paper` content, raw AI prompts, or raw answers;
- Git state, branch ownership, worktree ownership, or merge order becomes ambiguous;
- context compaction makes worker ownership uncertain.

## Evidence Requirements

Parallel evidence must include:

```text
parallel batch id:
coordinator:
base sha:
candidate tasks:
readiness level per task:
file lock table:
branches or worktrees:
worker evidence paths:
merge order:
validation results:
blocked gates:
cleanup results:
final git state:
```

Evidence may summarize `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` scope only at a redacted governance level unless a task-specific runtime validation approval exists.

## Forbidden Claims

Do not claim:

- parallel work is safer than serial work without evidence;
- a worker task is closed before coordinator merge and validation;
- queue or project state is synchronized when multiple workers wrote it;
- local-only worker validation proves staging, prod, provider, payment, or external-service readiness;
- Cost Calibration Gate readiness while it remains blocked.
