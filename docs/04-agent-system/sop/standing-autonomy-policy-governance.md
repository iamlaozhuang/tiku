# Standing Autonomy Policy Governance SOP

## Status

Active after the 2026-06-16 governance task passes local readiness and is merged to `master`.

## Purpose

Reduce repeated approval friction without weakening Tiku's task boundaries, evidence rules, or environment isolation.

Standing autonomy is not blanket permission. It is a durable approval model that lets an agent execute predictable local actions when the active queue task already declares the exact capability, scope, validation commands, redaction rules, and closeout policy.

## Source Of Authority

The durable authority chain is:

1. `project-state.yaml` records the standing approval and this SOP path.
2. `task-queue.yaml` materializes that approval into a concrete task capability or `closeoutPolicy`.
3. The task plan records allowed files, blocked files, validation, evidence, stop conditions, and recovery boundaries.
4. Evidence and audit review record what actually ran.

Chat memory alone must not authorize a blocked action across sessions.

## Default Autonomous Local Actions

When repository readiness, task scope, validation, evidence, audit, remote-divergence, and branch hygiene gates pass, a queued Module Run v2 task may autonomously execute:

- task claim and continuation;
- short-lived branch or approved worktree preparation;
- task plan, evidence, and audit creation;
- scoped implementation or docs edits inside `allowedFiles`;
- local validation commands declared by the task;
- local commit;
- fast-forward merge to `master`;
- push to `origin/master`;
- merged short-branch cleanup and approved worktree parking.

Commit, merge, push, and cleanup require the task to carry a complete structured `closeoutPolicy`. The policy does not authorize PR creation, force push, deployment, or scope expansion.

## Task-Scoped Local Capabilities

The following capabilities may be used without stopping for another chat approval only when the active queued task explicitly declares the capability, the local capability/readiness gates pass, and evidence stays redacted.

### Local Dev Database

Allowed:

- local Docker dev database read/write validation;
- local repository or integration tests against local dev aliases;
- task-scoped local seed/reset operations when the task records the operation kind, disposable or backup rationale, and rollback/recovery statement.

Blocked:

- staging/prod/cloud database connections;
- production or customer-like private data;
- database URL, row/private data, Authorization header, credential, token, or secret output in evidence;
- `drizzle-kit push`.

### Schema And Migration

Allowed:

- edit `src/db/schema/**` or `drizzle/**` only when `allowedFiles` includes those exact surfaces;
- generate and review migrations for local dev;
- run local dev migration rehearsal when the task records the migration plan and rollback/recovery statement.

Blocked:

- staging/prod migration execution;
- destructive shared-data operations;
- schema work bundled into unrelated feature or dependency commits;
- `drizzle-kit push`.

### Local Dev Server, Browser, And E2E

Allowed:

- start a local dev server for the active task when validation needs it;
- use Browser or Playwright only against `localhost`, `127.0.0.1`, or an equivalent local-only target;
- run targeted e2e or browser checks declared by the task.

Evidence may record command, pass/fail, spec or route name, and redacted result summary only.

Blocked:

- staging/prod/cloud targets;
- headed/debug e2e unless the task declares it;
- committed screenshots, traces, reports, local storage, session data, credentials, page dumps, raw DB rows, full `paper` or `material` content, raw prompts, raw answers, or provider payloads.

### Dependency And Lockfile Changes

Allowed:

- add, remove, or upgrade dependencies only when the queued task declares `dependencyIntroduction` and includes the dependency gate record;
- isolate dependency changes in their own commit unless the task explicitly says otherwise;
- include `human approval` evidence by referencing the standing approval plus the task-specific dependency rationale.

Blocked:

- opportunistic package or lockfile changes inside unrelated implementation tasks;
- dependency changes without package name, purpose, import boundary, open-source compatibility, alternative, risk, and validation record;
- provider, env/secret, deploy, schema, or external-service work smuggled in as dependency work.

### Provider Or Model Calls

Allowed:

- local dev provider/model smoke only when the task declares `providerCall: approved_local_dev_redacted`;
- use existing local configuration without reading, printing, copying, or editing `.env*`;
- record only provider category, local smoke result, failure class, and redacted metadata.

Blocked:

- raw prompt, raw answer, raw model response, provider payload, API key, token, secret, database URL, Authorization header, or cost/quota data in evidence;
- provider configuration, endpoint, fallback, default model, quota, or pricing changes unless separately declared;
- Cost Calibration Gate execution.

### Local Formal Writes

Allowed:

- local dev formal writes only when a task declares the formal target, role boundary, local data boundary, and rollback/recovery statement.

Blocked:

- staging/prod/shared formal writes;
- direct AI-generated content adoption into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` without the task-specific formal adoption gate;
- evidence that exposes private content or raw generated content.

## Fresh Approval Still Required

The following still require fresh user approval in the current thread or a new explicit task approval package:

- reading, outputting, copying, writing, rotating, or committing real secret/env values, `.env*`, tokens, cookies, Authorization headers, database URLs, passwords, provider keys, or credentials;
- staging, prod, cloud, deploy, public endpoint, TLS, domain, object storage, payment, or external-service action;
- PR creation or update;
- force push or `--force-with-lease`;
- destructive operations against shared, staging, prod, cloud, or production-like data;
- Cost Calibration Gate, provider cost measurement, quota measurement, pricing measurement, or paid-load testing beyond an explicitly declared local smoke;
- broad authorization permission model change that is not the named task objective;
- deleting or moving non-generated project files outside an approved cleanup task.

## Required Gates

Before any standing approval is consumed, confirm:

- `master`, `origin/master`, and the worktree are in an acceptable readiness state;
- the task is pending or otherwise executable, and dependencies are terminal;
- `allowedFiles` and `blockedFiles` are concrete and cover high-risk surfaces;
- the task declares the capability being used;
- task plan exists before substantive edits;
- validation commands are task-specific and recorded in evidence;
- evidence is redacted and contains no private data or secret material;
- audit review exists for governance, state, scope, approval, high-risk, or closeout changes;
- local capability gates pass when DB, schema, provider, e2e/browser, dependency, or destructive-local-DB work is involved;
- module closeout and pre-push readiness pass before merge or push.

## Stop Conditions

Stop and report instead of broadening scope when:

- Git has remote divergence, unknown dirty files, or unmerged short branches outside the task;
- the task lacks capability metadata for the desired action;
- the next useful step needs a fresh-approval item;
- validation fails in a way that cannot be repaired inside the task scope;
- evidence would need to reveal sensitive data;
- changed files exceed `allowedFiles` or touch `blockedFiles`.

## Practical Goal

The intent is faster project throughput after the user has made a product or governance decision. The agent should spend time doing scoped implementation and verification, not repeatedly asking for permission to run routine local closeout, local validation, or task-declared local capabilities that the repository can already guard.
