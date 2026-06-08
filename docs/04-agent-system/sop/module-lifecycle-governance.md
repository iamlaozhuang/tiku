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

## Module Run v2 Execution Rhythm

Module Run v2 is the default advancement rhythm for advanced edition implementation after Batch 101.

Module Run v2 changes the execution unit from the historical seven source planning modules to six execution modules:

- `authorization-and-access`;
- `ai-task-and-provider`;
- `personal-learning-ai`;
- `organization-training`;
- `organization-analytics`;
- `ops-governance-and-retention`.

The seven source planning modules remain traceable through
`docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml` `sourceModuleMapping`.

A Module Run v2 may contain up to 8 Batches. This raises throughput, but every Batch still needs:

- a declared Batch boundary inside the Module Run plan;
- focused tests appropriate to the touched surface;
- short evidence;
- an independently reviewable commit unless the task plan explicitly records a narrower subtask commit rule;
- explicit blocked remainder wording when the next useful step crosses dependency, schema, provider, env/secret, staging/prod, deploy, payment, external-service, or Cost Calibration Gate boundaries.

The Module Run plan must name:

- execution module id;
- source planning modules mapped into it;
- candidate Batches and maximum Batch count;
- highest expected local validation level from `localFullLoopGate`;
- thread rollover checkpoint after the 4th Batch and requirement after the 6th Batch;
- module closeout evidence and audit review paths;
- next Module Run candidate proposal shape.

Module Run v2 does not approve product code by itself. It defines the grouping mechanism; implementation, repository,
API route, Server Action, UI, schema, dependency, provider, env/secret, deploy, payment, or external-service work still
requires task-specific approval and allowed files.

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

Module batch closeout must also apply the Evidence Formatting Finalization Rule:

1. Write final rollup evidence and audit review validation results.
2. Run scoped `prettier --write` on the changed docs/state files for the batch.
3. Run scoped `prettier --check` on the same file list.
4. Run required anchor checks, `git diff --check`, and Git readiness checks.
5. Commit only after the formatting finalization and confirmation checks pass.

This keeps module batch closeout deterministic after evidence rows move from draft or pending wording to final pass wording.

For Module Run v2, closeout must additionally confirm:

- no more than 8 Batches were executed in the Module Run;
- every Batch has focused validation and evidence;
- the highest safe local validation level was reached or a stop condition explains why it was not;
- `localFullLoopGate` L8 blocked remainders are explicitly listed;
- `localProviderSandboxGate` was either unused or has explicit local-only approval and redacted evidence;
- `threadRolloverGate` decision is recorded;
- `nextModuleRunCandidate` is proposed without starting cross-module implementation;
- Cost Calibration Gate remains blocked.

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
