# Execution Log Archival And Index Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku keeps `docs/05-execution-logs/` usable for recovery while preserving historical evidence. It does not approve moving files, deleting files, product code implementation, code-stage queue seeding, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, Cost Calibration Gate execution, or `automation.mode` transition.

## Purpose

Execution logs are durable proof, but the active directories should not become unbounded search surfaces for every recovery.

The mechanism must preserve:

- current task recovery;
- evidence integrity;
- audit review traceability;
- task plan lookup;
- final handoff readability;
- low-conflict docs maintenance;
- on-demand access to historical task records.

## File Roles

Use these roles:

| File or directory                                 | Role                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `docs/05-execution-logs/evidence/`                | Active and recent task evidence.                              |
| `docs/05-execution-logs/task-plans/`              | Active and recent task plans.                                 |
| `docs/05-execution-logs/audits-reviews/`          | Active and recent audit reviews and security reviews.         |
| `docs/05-execution-logs/handoffs/`                | Explicit cross-session or thread rollover handoffs.           |
| `docs/05-execution-logs/archive/YYYY-MM/<kind>/`  | Historical execution logs moved by an approved archive batch. |
| `docs/05-execution-logs/execution-log-index.yaml` | Lightweight lookup index for archived execution-log files.    |

The original Markdown file remains the authoritative evidence, task plan, audit review, or handoff. The index is only a locator.

## Archive Layout

When an archive batch is approved, use this layout:

```text
docs/05-execution-logs/archive/
  YYYY-MM/
    evidence/
    task-plans/
    audits-reviews/
    handoffs/
```

The month should be inferred from the file name date prefix when present. If a file has no date prefix, the archive batch must either keep it active or document an explicit archive month decision in evidence.

## Active Retention Definition

Active execution-log directories should retain:

- current task plan, evidence, and audit review;
- the current serial batch recovery window;
- the latest evidence and audit review named by `project-state.yaml`;
- handoff files needed for current thread rollover or cross-session recovery;
- unresolved evidence-gap records;
- blocked-gate records that are actively referenced, including Cost Calibration Gate;
- recent docs-only governance records needed to understand the current automation readiness work;
- any log referenced by an active `task-queue.yaml` row whose path is not yet indexed.

Do not archive a file merely because it is old if it is still needed for immediate recovery.

## Archive Eligibility

An execution-log file may be archived only when all conditions are true:

- the related task is terminal or historical;
- the file path is not the current `project-state.yaml` `handoff.lastSummaryPath`;
- the file is not the current task plan, evidence, audit review, or active handoff;
- the file is referenced by `task-queue.yaml`, `task-history-index.yaml`, another execution log, or an archive evidence record;
- the archive batch can add an `execution-log-index.yaml` entry for it;
- moving the file will not orphan a task dependency, blocked gate, or final handoff;
- the archive task has explicit approval for moving execution-log files.

Do not archive files with ambiguous task ownership, missing references, unresolved sensitive-data concerns, or active blocked-gate relevance.

## Index Shape

When the index is approved, use this minimal shape:

```yaml
schemaVersion: 1
generatedFrom:
  activeRoot: docs/05-execution-logs
  generatedByTask:
  generatedAt:
entries:
  - path:
    archivePath:
    kind:
    taskId:
    phase:
    status:
    evidencePath:
    auditReviewPath:
    taskPlanPath:
    commitSha:
    date:
    tags:
```

`kind` should use one of:

- `evidence`
- `task_plan`
- `audit_review`
- `security_review`
- `handoff`
- `acceptance`

`tags` may include domain or governance labels such as `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`, `blocked_gate`, `docs_only`, `implementation`, or `local_verification`.

## Sync Rules

When an execution-log archive batch moves files, it must:

1. Create a short-lived branch.
2. Write a task plan before moving files.
3. List exact source and target paths.
4. Preserve Markdown content without semantic edits.
5. Update references in active `task-queue.yaml`, `task-history-index.yaml`, `project-state.yaml`, or other active logs only when needed for recovery.
6. Add one index entry for every moved file.
7. Verify every indexed `archivePath` exists.
8. Verify no active task references a moved path without an updated active reference or index entry.
9. Write evidence and audit review.
10. Commit, merge, push, and clean only when explicitly approved.

Do not combine execution-log archive movement with product implementation, dependency changes, schema changes, local runtime validation, or mode transition.

## Recovery Rules

On session recovery:

1. Read `project-state.yaml`.
2. Read active `task-queue.yaml`.
3. Read the latest active task plan, evidence, and audit review.
4. Read relevant SOPs named by `project-state.yaml`.
5. If a referenced execution log is no longer in an active directory, read `execution-log-index.yaml`.
6. Read only the needed archived file, not the full archive directory.

The recovery source of truth is Git plus the active state files. Chat memory and thread summaries are navigation aids only.

## Active Directory Size Signals

Recommend an execution-log archive task when any signal appears:

- `evidence/`, `task-plans/`, or `audits-reviews/` exceeds 100 active Markdown files;
- recovery repeatedly requires scanning many historical logs;
- current task evidence becomes hard to locate by file listing;
- old implementation logs dominate docs-only governance recovery;
- thread rollover handoff must cite many historical files;
- archive/index rules are already approved and a first batch can be defined without ambiguity.

These signals recommend an archive batch; they do not authorize moving files.

## Blocked Gates

Cost Calibration Gate remains blocked pending fresh explicit approval.

Execution-log archive and index work must not execute or imply:

- provider cost measurement, real provider calls, provider quota, endpoint, model selection, or fallback configuration;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, token, password, database URL;
- staging/prod/cloud/deploy, public endpoint, callback URL, TLS, object storage, or production-like resource;
- payment, pricing, invoice, refund, reconciliation, or external-service action;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive database operation, or `drizzle-kit push`;
- code-stage queue seeding or implementation queue item creation;
- `automation.mode` change.

## Redaction Rules

Archived logs remain subject to evidence redaction rules.

Do not record or expose:

- raw prompt;
- raw AI input or output;
- provider payload;
- secret;
- token;
- database URL;
- Authorization header;
- password;
- plaintext `redeem_code`;
- employee subjective answer text;
- full `paper` content;
- full textbook, full OCR text, or customer/customer-like private data.

If a historical file appears to contain sensitive data, stop the archive batch and request a dedicated redaction review. Do not silently move it.

## Stop Conditions

Stop archive or index work when:

- approval does not explicitly allow execution-log file movement;
- source or target paths are ambiguous;
- an active state file would point to a missing path;
- an index entry cannot be created with enough metadata;
- a blocked gate would be needed to interpret or validate a file;
- changed files exceed the approved docs-only archive/index scope;
- Git state, branch ownership, or remote alignment is ambiguous;
- evidence would need to expose protected data.

## Forbidden Claims

Do not claim:

- execution-log archive has happened when only this SOP was written;
- archived logs are deleted;
- the index replaces evidence, task plans, audit reviews, or handoffs;
- archive/index work proves runtime behavior for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log`;
- archive/index work approves code-stage queue seeding or product implementation;
- Cost Calibration Gate readiness while it remains blocked.
