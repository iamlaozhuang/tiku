# Task Lifecycle Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how an individual Tiku task starts, executes, validates, reviews, closes out, and hands off to the next task. It does not approve code-stage queue seeding, product code implementation, dependency changes, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Create a task-level control loop that supports automated advancement without losing rigor.

A task must be:

- scoped;
- planned;
- reviewable;
- verifiable;
- recoverable;
- isolated in Git;
- safe to hand off across sessions.

## Lifecycle Status Model

New tasks should use this progression:

```text
pending -> claimed -> planned -> implemented -> validated -> reviewed -> committed -> merged -> pushed -> closed
```

Task kinds may use a subset:

| taskKind         | Minimum useful progression                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `read_only`      | `pending -> claimed -> reviewed -> closed`                                                     |
| `docs_only`      | `pending -> claimed -> planned -> validated -> reviewed -> committed -> closed`                |
| `blocked_gate`   | `pending -> claimed -> planned -> reviewed -> committed -> closed`                             |
| `implementation` | `pending -> claimed -> planned -> implemented -> validated -> reviewed -> committed -> closed` |
| `closeout`       | `pending -> claimed -> validated -> reviewed -> merged -> pushed -> closed`                    |

Legacy `done` remains acceptable only when evidence exists and the task predates this model.

## Task Entry Gate

Before editing, the agent must confirm:

- `AGENTS.md`, code taste rules, ADRs, relevant SOPs, source requirement, latest evidence, latest audit review, `project-state.yaml`, and `task-queue.yaml` have been read;
- current branch is not `master` or `main` unless the task is read-only or approved closeout;
- Git working tree is clean or dirty files are explicitly task-scoped;
- task dependencies are terminal;
- `allowedFiles`, `blockedFiles`, `riskTypes`, `taskKind`, `taskPlanPolicy`, and `validationCommands` are concrete;
- Cost Calibration Gate and other long-lived blocked gates are not being bypassed;
- code-stage queue seeding is not implied unless explicitly approved.

If any entry condition fails, stop and record the blocker before editing.

## Planning Gate

Before implementation or substantive docs edits, create a task plan that records:

- task id, branch, and task kind;
- documents and source files read;
- requirement or module mapping;
- allowed and blocked scope;
- implementation or documentation approach;
- risk defenses;
- validation commands;
- evidence and audit review requirements;
- stop conditions.

The plan must distinguish verified facts from assumptions. Unconfirmed items must not be written as settled conclusions.

## TDD And Implementation Gate

For implementation tasks, use test-first progression whenever practical:

1. Define the expected behavior and acceptance scenario.
2. Add or update focused tests before or alongside implementation.
3. Implement the smallest change that closes the scenario.
4. Run targeted tests before broad gates.
5. Avoid broad refactors unless the task explicitly authorizes them.

Implementation tasks must follow the architecture boundary:

```text
route handlers / server actions -> service -> repository -> model
```

They must preserve project naming:

- `authorization`, `personal_auth`, `org_auth`, and `redeem_code` for access and entitlement;
- `question`, `paper`, `paper_section`, `question_group`, and `question_option` for content;
- `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book` for answering;
- `audit_log` and `ai_call_log` for governance evidence.

Docs-only tasks must not claim runtime behavior changed.

## Validation Gate

Validation must start with the task-specific commands in `task-queue.yaml`.

Then run broader gates as relevant:

- `git diff --check` for every changed task;
- Prettier check for changed docs and formatted files;
- `lint` and `typecheck` for source-affecting tasks;
- unit tests for changed services, validators, mappers, repositories, or utilities;
- e2e or browser verification for changed user flows;
- build when routes, Next.js pages, shared contracts, or runtime wiring change;
- naming convention checks when API, route, service, contract, or mapper surfaces change.

If a validation command cannot run, evidence must record why and whether the task is blocked or accepted with residual risk.

### Evidence Formatting Finalization Rule

For any task that edits or generates markdown or YAML evidence, audit review, task plan, task queue, or project state files:

1. Write final validation results and audit conclusions first.
2. Run scoped `prettier --write` on exactly the changed docs/state files.
3. Run scoped `prettier --check` on the same file list as the confirmation gate.
4. Run `git diff --check` after formatting.

`prettier --check` is a confirmation gate, not the first formatting step for newly edited evidence. If scoped `prettier --write` changes evidence or audit layout only, rerun the checks and preserve the semantic validation conclusions unless command results changed.

## Review Gate

Every task needs at least a self-review in evidence.

Create a dedicated audit review when the task changes:

- governance;
- scope boundary;
- task queue;
- project state;
- security or authorization rules;
- evidence redaction;
- closeout process;
- architecture or API contract;
- blocked gate wording.

High-risk implementation tasks must use the security review gate before merge. `REQUEST_CHANGES` blocks merge.

## Evidence Gate

Evidence must include:

- summary;
- task id, branch, and task kind;
- changed files;
- approval boundary;
- blocked-work statement;
- validation command outputs or summaries;
- residual gaps;
- next step or handoff.

Evidence must not contain:

- prompt;
- AI raw input or output;
- provider payload;
- secret;
- token;
- database URL;
- Authorization header;
- password;
- cleartext `redeem_code`;
- employee subjective answer text;
- full `paper` content;
- raw generated AI content that should not be visible to ordinary operations views.

## Commit Gate

Before committing:

- changed files must match `allowedFiles` and avoid `blockedFiles`;
- evidence must contain validation results;
- audit review must be complete when required;
- `git status --short --branch` must show only task-scoped changes;
- dependency, schema, migration, env/secret, provider, deploy, payment, and external-service changes must not be bundled into ordinary task commits.

One task normally maps to one focused commit.

## Closeout Gate

Closeout covers local merge, remote push, branch cleanup, worktree cleanup, and final handoff. These are separate actions even when one user approval authorizes the whole round.

For guarded automation, closeout may execute unattended only when the task records explicit approval for commit, merge,
push, cleanup, and automation worktree parking. A completed task without that wording must still stop for human
decision, even if the remaining Git actions look routine.

Closeout must record:

- implementation or docs commit SHA;
- merge target and result;
- push target and result when approved;
- cleanup result;
- final `git status --short --branch`;
- final `master...origin/master` alignment when push is approved;
- next recommended task or stop condition.

## Post-Closeout SHA Rule

Do not create an infinite chain of state-sync commits merely to record the SHA produced by the commit that records the SHA.

Use this rule:

- `project-state.yaml` may record the entry recovery SHA for the task or the latest stable SHA known before the task commit.
- Task evidence may record the implementation commit SHA after the commit exists only when a later closeout evidence task is already approved and meaningful.
- The final closeout SHA after merge and push should be reported in the final assistant handoff, or in a separately approved closeout task that has independent value beyond self-referential SHA synchronization.
- Do not open a new docs-only state-sync task solely because the previous task's own commit advanced `master`.
- If Git reality differs from `project-state.yaml` only by the just-completed closeout commit and the final handoff records the SHA, this is not drift that blocks the next task.
- If Git reality differs because of unpushed commits, unmerged branches, unknown worktree residue, or remote divergence, stop and reconcile before claiming new work.

This rule keeps repository recovery accurate without generating endless self-sync churn.

## Task Handoff

Task handoff should use this shape:

```text
task:
status:
branch:
commit:
merged:
pushed:
cleanup:
latest evidence:
latest audit review:
blocked gates:
next task:
final git state:
```

The handoff is a navigation aid. The durable source of truth remains Git, `project-state.yaml`, `task-queue.yaml`, task plan, evidence, and audit review.

## Stop Conditions

Stop task execution when:

- blocked gate execution becomes necessary;
- approval scope is unclear;
- `allowedFiles` or `blockedFiles` are violated;
- validation fails three times;
- dependency, schema, migration, env/secret, provider, deploy, payment, or external-service work is required without approval;
- evidence would need to record sensitive data;
- branch or Git state becomes ambiguous;
- the user asks to pause or discuss.

## Forbidden Claims

Do not claim:

- runtime completion from docs-only work;
- full tests passed when only partial gates ran;
- provider readiness without approved provider evidence;
- staging or prod readiness from local validation;
- formal `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` behavior without task-specific runtime evidence;
- Cost Calibration Gate readiness while it remains blocked.
