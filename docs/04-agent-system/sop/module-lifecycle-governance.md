# Module Lifecycle Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku moves from requirements to modules, from modules to tasks, and from one module to the next. It does not approve code-stage queue seeding, product code implementation, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Create a module-level control layer above individual queue tasks so automated advancement does not become a loose sequence of unrelated tasks.

A module is a bounded work unit that connects:

- requirement source;
- implementation or governance scope;
- task sequence;
- acceptance evidence;
- closeout review;
- next module handoff.

## Module Definition

A module must have:

- module id using kebab-case;
- source requirement, plan, SOP, or audit path;
- owner-facing purpose;
- included task ids or task generation rule;
- excluded scope;
- blocked gates;
- acceptance evidence requirements;
- module closeout evidence path;
- next module recommendation.

Module ids should describe the work, for example:

- `advanced-edition-requirements-governance`;
- `automated-advancement-governance`;
- `local-first-validation-governance`;
- `authorization-governance-readiness`.

## Module Entry Gate

Before a module starts, verify:

- `project-state.yaml` repository SHA fields match Git reality or a state sync is included in the module entry task;
- `task-queue.yaml` contains the module entry task or the module is explicitly docs-only discussion;
- all prerequisite modules are `done`, `closed`, or `pushed`;
- blocked gates are named;
- required source documents are current enough for the module purpose;
- task type boundary is clear;
- high-risk actions have approval or are explicitly excluded.

If entry verification fails, stop before implementation and write a docs-only module entry blocker.

## Module Planning

Module planning must create or update a task plan that includes:

- source documents read;
- module boundary;
- assumptions and unknowns;
- task breakdown;
- validation strategy;
- evidence strategy;
- audit review strategy;
- stop conditions;
- handoff target.

Planning may propose future code tasks, but it must not seed code-stage queue entries unless the user explicitly approves code-stage queue seeding.

## Module-To-Task Breakdown

Break modules into tasks by these rules:

- each task must be independently reviewable;
- each task must declare `taskKind`, `allowedFiles`, `blockedFiles`, `riskTypes`, and `validationCommands`;
- docs-only tasks must not change product behavior;
- implementation tasks must map to one requirement chain, acceptance scenario, or horizontal failure scenario;
- dependency, schema, migration, authorization permission model, provider, env/secret, staging/prod/cloud/deploy, payment, and external-service tasks must be isolated and approval-gated;
- no task may hide a blocked action behind wording such as setup, calibration, smoke check, or convenience validation.

Task order should minimize shared-surface conflicts:

1. governance and requirement clarification;
2. architecture or contract decisions;
3. local validation strategy;
4. implementation task planning;
5. implementation only after explicit approval;
6. verification and closeout.

## Module Execution Rules

During module execution:

- run tasks in dependency order by default;
- avoid parallel implementation unless file scopes are independent;
- keep one task per focused commit by default;
- update evidence after each task;
- write audit review for governance, security, scope, approval, or closeout tasks;
- stop when a task needs a blocked action or exceeds its allowed scope.

For module-level docs-only batches, every child task must still have its own evidence and reviewable diff.

## Module Closeout

A module is complete only when evidence confirms:

- all included tasks have a terminal status appropriate to the module;
- changed files match module scope;
- validation commands are recorded;
- audit review verdict is `pass` or accepted residual risk is documented;
- blocked gates remain blocked or have explicit approval evidence;
- `project-state.yaml`, `task-queue.yaml`, evidence, audit review, and Git status agree;
- the next module is recommended or the module explicitly stops for human decision.

Module closeout must include a document freshness pass:

- source-of-truth documents are named;
- outdated documents are not treated as active sources;
- archive or slimming recommendations are recorded as recommendations unless file moves or deletions are separately approved;
- handoff points to the latest evidence.

## Module Switching

Before switching modules:

1. Confirm the current module is closed or intentionally paused.
2. Confirm Git is clean and, when push is approved, `master` and `origin/master` are aligned.
3. Confirm no short-lived branch or worktree residue remains.
4. Confirm the next module has a clear entry task.
5. Confirm the next module does not require blocked gate execution.
6. Update handoff with the next module id and evidence path.

If any condition fails, stop and create a closeout or state-sync task before entering the next module.

## Local-First Progression

Modules must separate local-completable work from environment-blocked work.

Allowed local-first work includes:

- docs-only governance;
- local unit and integration tests;
- local database validation using approved dev setup;
- local browser verification;
- local fixture or mock-provider validation when clearly labeled;
- redacted `audit_log` and `ai_call_log` evidence summaries.

Blocked environment-dependent work includes:

- real provider calls;
- provider cost measurement;
- env/secret access or modification;
- staging/prod/cloud/deploy;
- payment and external-service actions;
- production-like data or resources.

Environment-blocked work should become a blocked gate or future approval task, not a reason to delay local-completable module work.

## Required Handoff Shape

Module handoff should include:

```text
module:
status:
latest evidence:
latest audit review:
completed task ids:
blocked gates:
local-completable next work:
approval-required next work:
git state:
```

The handoff must be short enough for a new Codex thread to use as an entry point, but durable enough that the thread can recover from repository files instead of chat memory.

## Forbidden Claims

Do not claim:

- module completion without closeout evidence;
- runtime completion from docs-only work;
- provider readiness without approved provider evidence;
- staging or prod readiness from local validation;
- full `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` behavior without task-specific runtime evidence;
- Cost Calibration Gate readiness while it remains blocked.
