# Code-Stage Task Seeding Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku may later seed implementation queue items for advanced edition work. It does not approve code-stage queue seeding, product code implementation, dependency changes, schema or migration work, env/secret work, provider work, staging/prod/cloud/deploy work, payment work, external-service work, thread creation, worktree creation, parallel worker execution, or Cost Calibration Gate execution. Cost Calibration Gate remains blocked.

## Purpose

Make code-stage task seeding explicit, narrow, and auditable.

The mechanism must prevent:

- turning requirements discussion into implementation tasks without approval;
- mixing implementation, dependency, schema, migration, provider, env/secret, deploy, payment, or external-service work in one task;
- creating tasks with vague `allowedFiles`, missing validation commands, or unclear evidence requirements;
- using local planning to claim runtime closure;
- seeding tasks that bypass `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` terminology and redaction rules.

## Seeding Approval Gate

Code-stage queue seeding requires fresh explicit approval that names:

- source requirements or module;
- allowed task kinds;
- forbidden task kinds;
- maximum number of tasks or modules to seed;
- whether implementation tasks may be created;
- whether dependency, schema, migration, authorization permission model, provider, env/secret, staging/prod/cloud/deploy, payment, or external-service tasks are excluded or separately approved;
- required evidence and audit review path.

Approval to write this SOP is not approval to seed code-stage tasks.

## Required Inputs

Before seeding, read and record:

- `AGENTS.md`;
- relevant ADRs;
- latest advanced edition requirements and MVP closure documents;
- module lifecycle governance;
- task lifecycle governance;
- local-first validation governance;
- automation readiness scorecard and mode transition governance;
- latest `project-state.yaml`;
- latest `task-queue.yaml`;
- latest task plan, evidence, and audit review.

If any source is stale, ambiguous, or missing, create a docs-only clarification task instead of seeding implementation tasks.

## Seedable Task Kinds

Use these task kinds:

| taskKind                  | Purpose                                                   | Approval requirement                         |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `implementation_planning` | define local-completable implementation sequence          | explicit code-stage planning approval        |
| `implementation`          | product code, API, service, repository, UI, or tests      | explicit implementation approval             |
| `local_verification`      | local-only validation of implemented behavior             | explicit local validation approval           |
| `security_review`         | review authorization, evidence, redaction, or data access | required for high-risk implementation        |
| `dependency`              | package, lockfile, CLI, SDK, or framework change          | separate dependency approval                 |
| `schema_migration`        | schema, migration, database operation, or data backfill   | separate schema/migration approval           |
| `blocked_gate`            | record blocked action and required decision               | docs-only allowed; execution remains blocked |
| `closeout`                | merge, push, cleanup, and final handoff                   | explicit closeout approval                   |

Do not use `docs_only` to hide implementation scope.

## Task Template

Every seeded task must include:

```yaml
id:
title:
phase:
sourceStory:
dependencies:
taskPlanPolicy:
humanApproval:
taskKind:
allowedFiles:
blockedFiles:
riskTypes:
validationCommands:
evidencePath:
status:
retryCount:
```

Use `pending` status for newly seeded tasks. Do not mark a seeded task `done` unless it has already been executed with evidence.

## Scope Split Rules

Split tasks by independent review boundary:

- one task per user-visible behavior slice or governance slice;
- one task per dependency change;
- one task per schema or migration change;
- one task per authorization permission model change;
- one task per provider/env/secret/staging/prod/cloud/deploy/payment/external-service decision;
- one task per closeout batch.

Implementation tasks must map to the approved architecture boundary:

```text
route handlers / server actions -> service -> repository -> model
```

They must not return database rows directly through route handlers or Server Actions.

## Module Run v2 Task Grouping

Advanced edition code-stage planning may group tasks by Module Run v2 execution module instead of forcing every small
Batch to restart full governance.

Allowed grouping:

- one Module Run plan may contain up to 8 candidate Batches;
- every Batch still declares its own focused validation target, evidence path, and commit expectation;
- the plan may sequence local model, contract, validator, service, repository, API, Server Action, UI/browser, and role
  flow validation as long as each surface is explicitly approved in the task scope;
- the plan must name the intended `localFullLoopGate` level and the L8 blocked remainders.

Grouping does not approve high-risk execution. The following still require separate approval or isolated tasks:

- dependency, package, lockfile, CLI, SDK, or test framework changes;
- schema, migration, destructive database operation, or data backfill;
- real authorization permission model, role, permission, quota, or entitlement change;
- provider configuration, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- local provider sandbox execution without explicit approval for that local call;
- Cost Calibration Gate execution.

Seeded Module Run v2 entries must include thread rollover checkpoints after the 4th Batch and before or after the 6th
Batch according to `threadRolloverGate`.

## Advanced Edition MVP Seeding Boundaries

Advanced edition implementation planning may reference these MVP surfaces only when the approval names them:

- personal user AI question generation and paper assembly;
- organization admin training creation;
- employee answer statistics;
- platform operations governance for `authorization`, `redeem_code`, quota, `audit_log`, and `ai_call_log`.

Do not seed provider cost measurement, real provider calls, provider quota configuration, env/secret work, staging/prod/cloud/deploy work, payment work, or external-service work while Cost Calibration Gate remains blocked.

## Required Risk Tags

Attach risk tags when relevant:

- `authorization_permission`;
- `redeem_code`;
- `paper`;
- `mock_exam`;
- `ai_call_log`;
- `audit_log`;
- `provider_blocked`;
- `env_secret_blocked`;
- `schema_migration`;
- `dependency`;
- `local_validation`;
- `evidence_redaction`;
- `security_review`;
- `blocked_gate`.

Risk tags are audit signals, not approvals.

## Validation Selection

Seeded tasks must name concrete validation commands:

| Surface                        | Minimum validation command family                          |
| ------------------------------ | ---------------------------------------------------------- |
| docs or planning               | `git diff --check`, Prettier, required pattern search      |
| contracts, validators, mappers | lint, typecheck, focused unit tests, naming checks         |
| services                       | lint, typecheck, focused unit tests                        |
| repositories                   | local repository tests when approved local database exists |
| API routes or Server Actions   | contract tests, lint, typecheck, build when relevant       |
| UI pages or components         | lint, typecheck, unit/e2e/browser when relevant            |
| authorization or `redeem_code` | security review plus redacted evidence checks              |
| `audit_log` or `ai_call_log`   | redaction and retention evidence checks                    |
| closeout                       | Git inventory, quality gate, push alignment when approved  |

If a command cannot be known at seeding time, seed a planning task first instead of a direct implementation task.

## Evidence And Redaction

Seeded tasks must require evidence that records:

```text
source requirement:
task kind:
changed files:
validation level:
commands:
blocked gates:
redaction status:
residual gaps:
next dependency:
```

Evidence must not include secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, private answer text, full `paper` content, or raw generated AI content that should not be visible to ordinary operations views.

## Seeding Review Gate

Before committing seeded queue entries, audit review must confirm:

- every new task has a source requirement;
- every dependency is meaningful;
- every task kind is correct;
- `allowedFiles` and `blockedFiles` are concrete;
- high-risk surfaces have separate approval gates;
- validation commands are concrete;
- evidence paths are unique;
- no blocked gate execution is implied;
- no implementation task is marked done;
- no product code change is bundled with seeding.

## Stop Conditions

Stop seeding when:

- approval does not explicitly allow code-stage queue seeding;
- implementation boundaries are unclear;
- source requirements are stale or conflicting;
- task count exceeds the approved batch;
- any task would require blocked gate execution;
- dependency, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service work is needed without separate approval;
- evidence requirements would expose protected content;
- Git state or queue ownership is ambiguous.

## Forbidden Claims

Do not claim:

- code-stage tasks have been seeded when only this SOP was written;
- seeded tasks are approved for execution unless approval says so;
- local planning proves runtime completion;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` behavior is ready without task-specific runtime evidence;
- Cost Calibration Gate readiness while it remains blocked.
