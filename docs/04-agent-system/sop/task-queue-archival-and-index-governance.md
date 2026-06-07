# Task Queue Archival And Index Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku keeps `task-queue.yaml` small enough for reliable recovery while preserving historical auditability. It does not approve file moves, file deletion, code-stage queue seeding, product code implementation, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Prevent the task queue from becoming a long, noisy history file that slows recovery and makes active work harder to audit.

The mechanism must preserve:

- queue-first task selection;
- durable recovery from repository files;
- complete historical traceability;
- low-conflict active queue edits;
- clear boundaries between active task state, archived task history, and lightweight history index.

## Queue File Roles

Use these roles:

| File                                                                 | Role                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `docs/04-agent-system/state/task-queue.yaml`                         | active queue and recent recovery window                             |
| `docs/04-agent-system/state/archive/task-queue-archive-YYYY-MM.yaml` | immutable historical task entries moved by an approved archive task |
| `docs/04-agent-system/state/task-history-index.yaml`                 | lightweight lookup index for archived and closed tasks              |

This SOP defines the roles only. It does not create archive files, move task entries, delete task entries, or create a full history index.

## Active Queue Definition

`task-queue.yaml` should contain:

- current task;
- pending tasks;
- claimed, planned, blocked, or retrying tasks;
- tasks required for the current serial batch;
- the most recent closeout window needed for recovery;
- explicitly retained tasks whose dependencies are still referenced by active tasks.

Completed historical tasks should not remain in the active queue indefinitely once they are no longer needed for immediate recovery.

## Archive Eligibility

A task may be archived only when all conditions are true:

- status is terminal, such as `done`, `closed`, `merged`, `pushed`, or a documented legacy terminal status;
- evidence path exists;
- audit review exists when required by task type;
- no active `pending`, `claimed`, `planned`, `blocked`, or retrying task depends on it without an index reference;
- final handoff or index entry records the commit SHA or accepted post-closeout SHA rule;
- `master` and `origin/master` are aligned before archive work starts;
- the archive task has explicit approval for moving historical queue entries.

Do not archive tasks with unresolved Git, evidence, dependency, or blocked gate ambiguity.

## Archive Batch Rules

An archive task must be its own docs-only maintenance task.

It must:

1. Create a short-lived branch.
2. Write a task plan.
3. List exact task ids to archive.
4. List exact source and target files.
5. Preserve each archived task entry without semantic edits.
6. Add or update index entries for every archived task.
7. Run YAML formatting and required search checks.
8. Verify active queue still contains enough context to recover current work.
9. Write evidence and audit review.
10. Commit, merge, push, and clean only when explicitly approved.

Do not combine archive movement with product implementation, dependency changes, schema changes, or mode changes.

## History Index Shape

When an index is approved, use this minimal shape:

```yaml
schemaVersion: 1
generatedFrom:
  activeQueuePath: docs/04-agent-system/state/task-queue.yaml
entries:
  - id:
    phase:
    status:
    taskKind:
    evidencePath:
    auditReviewPath:
    archivePath:
    commitSha:
    completedAt:
```

Index entries are lookup aids. The authoritative task body remains in the active queue or archive file.

## Recovery Rules

On session recovery:

1. Read `project-state.yaml`.
2. Read active `task-queue.yaml`.
3. Read latest task plan, evidence, and audit review.
4. If a dependency is not in the active queue, read `task-history-index.yaml`.
5. If the index points to an archive file, read only the needed archived task entry.
6. Prefer active queue state for current tasks and archive/index state for historical lookup.

Do not load every archive file by default.

## Active Queue Size Signals

Recommend an archive task when any signal appears:

- active queue contains more than 30 terminal historical tasks;
- the latest task is hard to locate without reading long historical output;
- repeated tasks append similar validation boilerplate and obscure pending work;
- parallel or serial governance work starts creating queue merge conflicts;
- cross-session recovery requires reading more than the active recovery window.

These signals recommend an archive task; they do not authorize moving files.

## Index Freshness Rules

When archive files exist, the index must be updated in the same archive task that moves entries.

The index must not claim:

- runtime completion not present in evidence;
- test results not present in evidence;
- provider, env/secret, staging/prod/cloud/deploy, payment, or external-service readiness;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` behavior without task-specific runtime evidence.

## Blocked Gates

Cost Calibration Gate remains blocked pending fresh explicit approval.

Archive and index tasks must not execute or imply:

- provider cost measurement, real provider calls, provider quota, endpoint, model selection, or fallback configuration;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, token, password, database URL;
- staging/prod/cloud/deploy, public endpoint, callback URL, TLS, object storage, or production-like resource;
- payment, pricing, invoice, refund, reconciliation, or external-service action;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive database operation, or `drizzle-kit push`;
- code-stage queue seeding or implementation queue item creation;
- `automation.mode` change.

## Stop Conditions

Stop archive or index work when:

- approval does not explicitly allow the archive or index action;
- task ids to move are ambiguous;
- a dependency would be orphaned;
- evidence or audit review for an archived task cannot be found;
- changed files exceed the approved archive/index scope;
- Git state, branch ownership, or remote alignment is ambiguous;
- any blocked gate execution becomes necessary.

## Forbidden Claims

Do not claim:

- active queue slimming has happened when only this SOP was written;
- archived tasks are deleted;
- an index is authoritative over evidence;
- queue archiving approves implementation tasks;
- queue archiving proves `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` runtime behavior;
- Cost Calibration Gate readiness while it remains blocked.
