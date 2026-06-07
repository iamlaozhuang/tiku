# Requirement Task Coverage And Gap Audit Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku checks whether requirements, modules, tasks, acceptance scenarios, and user-facing use cases are exhaustively covered before a module is considered closed. It does not approve code-stage queue seeding, product code implementation, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Prevent a task list from being treated as complete merely because the listed tasks were executed.

The mechanism must catch:

- requirements that have no module mapping;
- modules that have no task coverage;
- tasks that have no acceptance scenario;
- implementation evidence that cannot be traced back to a requirement;
- user-facing use cases that were discovered after the initial task split;
- high-risk business surfaces that lack focused review, including `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Coverage Model

Use this chain for every module-level closeout:

```text
requirement source -> module -> task -> acceptance scenario -> validation evidence -> residual gap decision
```

Each link must be auditable from repository files. Chat memory is not enough.

## Coverage Inputs

Before running a coverage audit, read and record:

- `AGENTS.md`;
- relevant ADRs;
- module lifecycle governance;
- task lifecycle governance;
- code-stage task seeding governance;
- latest requirement source for the module;
- latest `project-state.yaml`;
- latest `task-queue.yaml`;
- included task plans;
- included evidence files;
- included audit reviews;
- latest module handoff or closeout evidence.

If a source is stale, missing, or contradictory, create a docs-only clarification task instead of closing the module.

## Mapping Requirements

Every audited module must produce or reference a coverage matrix with these columns:

| Column             | Required Meaning                                                            |
| ------------------ | --------------------------------------------------------------------------- |
| requirementId      | stable source requirement, story, SOP, or decision id                       |
| moduleId           | kebab-case module id                                                        |
| userRole           | affected actor such as `student`, `admin`, `employee`, or platform operator |
| userUseCase        | user-facing flow or governance action being covered                         |
| taskId             | task queue id that covers the scenario                                      |
| taskKind           | declared task kind from `task-queue.yaml`                                   |
| acceptanceScenario | observable scenario or audit condition                                      |
| validationEvidence | evidence path or reason validation is not yet possible                      |
| riskTags           | relevant risks, including project terms when applicable                     |
| coverageStatus     | `covered`, `partial`, `gap`, `blocked`, or `not_applicable`                 |
| gapDecision        | next task, blocked gate, explicit exclusion, or accepted residual risk      |

Do not use a free-form paragraph as the only coverage record when a matrix is needed.

## Coverage Status Rules

Use these statuses consistently:

| Status           | Meaning                                                             | Allowed closeout interpretation                                |
| ---------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `covered`        | requirement and use case have task evidence and validation evidence | may support module closeout                                    |
| `partial`        | task exists but scenario, validation, or evidence is incomplete     | module cannot close without accepted residual risk             |
| `gap`            | requirement or use case has no task coverage                        | module cannot close; seed or propose a task only when approved |
| `blocked`        | coverage requires a blocked gate                                    | record blocker; do not execute the blocked action              |
| `not_applicable` | source is explicitly out of module scope                            | must include reason and reviewer acceptance                    |

`done` task status does not imply `covered` coverage status.

## Required Audit Passes

Run these passes before module closeout:

1. Requirement pass: every active requirement maps to one module or an explicit exclusion.
2. Role pass: each affected role has at least one scenario or an explicit out-of-scope decision.
3. Flow pass: each scenario covers success, empty, error, permission, and boundary behavior when relevant.
4. Data pass: user-visible data, internal state, redaction, and evidence paths are named.
5. Risk pass: high-risk objects have focused review when relevant.
6. Validation pass: each completed task points to actual validation evidence.
7. Residual gap pass: each `partial`, `gap`, or `blocked` row has a next decision.

For implementation modules, the flow pass should also consider route handlers / server actions, service, repository, model, mapper, contract, validator, and UI surfaces as applicable.

## High-Risk Business Surface Pass

When a module touches or plans to touch these surfaces, add explicit coverage rows:

- `authorization`, `personal_auth`, `org_auth`, and `redeem_code`;
- `question`, `paper`, `paper_section`, `question_group`, and `question_option`;
- `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`;
- `audit_log` and `ai_call_log`;
- AI-generated content entering formal question, paper, practice, mock, report, or mistake flows.

Coverage evidence must not expose secrets, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, employee subjective answer text, full `paper` content, or raw generated AI content.

## Gap Handling

When the audit finds a gap:

1. Classify it as local-completable, approval-required, or blocked.
2. Record the gap in evidence with the source requirement and affected scenario.
3. Do not silently expand the current task if the new work exceeds `allowedFiles` or task approval.
4. Do not create implementation queue items unless code-stage queue seeding has explicit approval.
5. Prefer a docs-only clarification task when the requirement itself is ambiguous.
6. Prefer a blocked gate task when the gap requires provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, or Cost Calibration Gate execution.

## Module Closeout Rule

A module may be closed only when:

- all coverage rows are `covered`, `not_applicable`, or explicitly accepted residual risk;
- no `gap` row remains without a next decision;
- every `blocked` row points to a named blocked gate;
- task evidence and audit reviews agree with `task-queue.yaml`;
- code-stage queue seeding is not implied without approval;
- Cost Calibration Gate remains blocked unless fresh explicit approval exists.

## Validation Requirements

A coverage audit task must run:

- `git diff --check`;
- formatting check for changed docs;
- required phrase search for coverage sections, blocked gates, and project terms;
- prohibited terminology search for added lines;
- Git inventory check against `allowedFiles`.

For implementation modules, add runtime validation commands only when the task approval includes implementation or local verification scope.

## Stop Conditions

Stop coverage audit work when:

- the audit would require product code changes without approval;
- code-stage queue seeding becomes necessary without explicit approval;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, or Cost Calibration Gate execution is required;
- evidence would expose protected data;
- source requirements conflict and cannot be reconciled inside docs-only scope;
- Git state or task ownership becomes ambiguous.

## Forbidden Claims

Do not claim:

- listed tasks are exhaustive without coverage evidence;
- a module is closed while uncovered `gap` rows remain;
- runtime behavior is complete from docs-only coverage work;
- local validation proves staging, prod, provider, payment, or external-service readiness;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` behavior is complete without task-specific runtime evidence;
- Cost Calibration Gate readiness while it remains blocked.
