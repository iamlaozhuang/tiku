# MVP Queue Runner SOP

## Status

Active for Phase 11 MVP gap tasks.

## Purpose

This SOP controls the 16 MVP gap tasks created by `phase-11-mvp-functional-completeness-gap-audit`. It prevents four recurring failure modes:

- resuming from chat memory instead of repository state;
- missing acceptance criteria while closing a narrow local fix;
- treating `fixture-only`, `mock-only`, `read-only`, or `entry-only` behavior as full runtime completion;
- leaving dirty files, stale branches, or mixed-task residue before claiming the next task.

## Hard Stop Gates

Stop and ask for explicit approval before any task touches or requires:

- dependency add, remove, upgrade, package file, or lockfile work;
- database schema, migration, or generated migration work;
- script creation or script modification outside the queued allowed files;
- `.env.local`, `.env.example`, secret, token, provider key, Authorization header, or environment change;
- real model provider calls, raw provider payloads, raw prompts, raw answers, or raw model responses;
- Tencent Cloud, staging, prod, deployment, object storage, public URL, or cloud resource work;
- major permission model changes;
- destructive data operations.

Do not route around these gates with fixtures, mocks, local scripts, or evidence wording.

## Per-Task Startup

Before editing runtime or docs for each MVP gap task:

1. Read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, `docs/02-architecture/adr/`, this SOP, the Repository Hygiene Closeout Checklist, `project-state.yaml`, `task-queue.yaml`, the active task plan, and the latest evidence for the dependency chain.
2. Confirm the prior task is `closed`, merged, pushed, and cleaned.
3. Confirm the worktree is clean with `git status --short --branch`.
4. Create or switch to exactly one short-lifecycle branch for the task.
5. Run `Test-TaskClaimReadiness.ps1 -TaskId <task-id>` while the queue task is still `pending`.
6. Move the task to `in_progress` only after the claim check passes.
7. Create the task plan before business logic edits.

## Required AC-to-Runtime Matrix

Every MVP gap task plan and evidence must include an AC-to-runtime matrix with these columns:

| Column                  | Required content                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceptance criterion    | Requirement, story, audit gap, or product AC being closed                                                                                      |
| Runtime surface         | API route, UI page/component, service, repository, mapper, test, or evidence-only document touched                                             |
| Current state           | One of `not_present`, `entry-only`, `read-only`, `fixture-only`, `mock-only`, `partial_runtime`, `runtime_closed`, or `deferred_with_approval` |
| Implementation evidence | Unit, e2e, browser, build, API, service, audit_log, or ai_call_log proof                                                                       |
| Downstream effect       | Student, content ops, system ops, AI/RAG, audit, or release-boundary effect                                                                    |
| Remaining gap           | `none`, `P0`, `P1`, `P2`, `P3`, or `blocked_by_approval`                                                                                       |
| Decision                | `implemented`, `deferred_with_approval`, `blocked`, or `not_in_scope`                                                                          |

Route existence, component existence, seeded data, fixture props, mock provider behavior, list filtering, navigation entry, or a read-only table is not runtime completion unless the matrix marks it as such and records the residual gap.

## Problem Grading

Each task must record discovered issues with:

- severity: `P0`, `P1`, `P2`, or `P3`;
- affected role: `student`, `content ops`, `system ops`, `super_admin`, or `all roles`;
- reproduction path or command;
- expected result;
- actual result;
- fixed status;
- residual risk;
- follow-up task when not fixed.

Do not downgrade a P0/P1 issue because a seeded local happy path still passes.

## Validation Record

Every task evidence must include:

- task claim readiness result;
- targeted unit and e2e commands for the changed runtime surface;
- `build` when routes, Next.js pages, server boundaries, or shared contracts change;
- `Test-AgentSystemReadiness.ps1`;
- `Test-NamingConventions.ps1` when API, service, contract, route, or naming surfaces change;
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`;
- command failures and retries, including why a failed command is accepted or blocks the task.

If a task cannot run an expected command, record the reason and residual risk. Do not claim full test coverage when only lint, typecheck, or partial tests ran.

## Required Evidence Sections

Every MVP gap evidence file must include:

- `Scope`;
- `Boundary`;
- `Human Approval`;
- `AC-to-Runtime Matrix`;
- `Problem Grading`;
- `Validation Results`;
- `Repository Hygiene Closeout Checklist`;
- `stagingDecision`;
- `Next Step`;
- `Evidence Hygiene`.

Allowed `stagingDecision` values include:

- `blocked_by_p0_mvp_functional_gaps`;
- `blocked_by_approval_gate`;
- `local_task_closed_remaining_p0`;
- `local_task_closed_remaining_p1`;
- `local_task_closed_no_known_p0_p1`;
- `product_deferred_with_approval`;
- `not_applicable_mechanism_hardening_only`.

## Queue Progression

Use this status progression for the 16 MVP gap tasks:

```text
pending -> in_progress -> validated -> committed -> merged -> pushed -> closed
```

Do not claim the next task until the current task is `closed`, the branch has been pushed or explicitly marked local-only by approval, the merged branch has been safely cleaned, and the repository is clean.

The user's queue-wide approval covers routine commit, merge, push, and safe cleanup for the 16 MVP gap tasks only. It does not approve any hard stop gate.

## Next-Task Gate

Before moving to the next queued MVP gap task, verify:

- the prior evidence includes AC-to-runtime, problem grading, validation, repository hygiene, `stagingDecision`, and next step;
- `master` and `origin/master` are aligned after push;
- local branch cleanup succeeded or the retained branch is justified in evidence;
- `git status --short --branch` is clean;
- no untracked generated directories or logs are outside ignored locations;
- no task touched blocked files without explicit approval evidence.
