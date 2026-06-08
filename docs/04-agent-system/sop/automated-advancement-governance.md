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

If no eligible task exists, the automation loop stops and records the next recommended action as `no_executable_pending_task`.

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
- update handoff wording;
- mark provider, env/secret, staging/prod, deploy, payment, external-service, and Cost Calibration Gate work as blocked
  remainder.

Automation must not:

- modify schema, migration, dependency, env/secret, provider configuration, deploy configuration, payment, or
  external-service surfaces;
- read or record secrets;
- execute Cost Calibration Gate;
- continue implementation across execution modules without a fresh Module Run plan and human approval.

Module Run v2 automatic handoff should normally pair with a thread rollover decision. After closeout, the default
decision is `require_new_thread` before entering the next execution module.

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
