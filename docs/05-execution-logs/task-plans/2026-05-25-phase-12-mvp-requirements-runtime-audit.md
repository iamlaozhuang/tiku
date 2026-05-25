# Phase 12 MVP Requirements Runtime Audit Task Plan

## Goal

Run three complete, independent, requirements-first local audit passes that use `docs/01-requirements/` as the SSOT and map MVP requirements to current UI, API, service/repository runtime, tests, evidence, and role-based browser usability.

This document is intentionally reused across the audit batch. Each audit round is a separate queue task and closeout, but the plan/evidence files may be updated in place to avoid document sprawl.

## Scope Boundary

This task is audit and planning only.

Allowed:

- read requirements, architecture, standards, source, tests, and existing evidence;
- inspect local browser/runtime state;
- call local/dev APIs only through the running local app;
- create this task plan, audit evidence, and queue/state records;
- propose follow-up fix tasks with severity and sequencing.

Forbidden:

- no business/runtime code changes;
- no dependency, package, lockfile, schema, migration, or script changes;
- no `.env.local` read or output;
- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, public object storage URL, or external provider change;
- no destructive data operations;
- no secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content in evidence.

## Required Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- latest Phase 11 evidence, especially local system validation and cloud adapter readiness.

## Audit Method

Every requirement item is assessed with the same matrix columns:

| Column             | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| Requirement        | SSOT document section or story AC.                                              |
| Role               | student, content_admin, ops_admin, super_admin, unauthenticated.                |
| UI entry           | Page/route where a real user should complete the action.                        |
| CRUD/action        | create, read, update, disable, copy, publish, redeem, submit, retry, view, etc. |
| API surface        | `/api/v1/` route and method, if expected.                                       |
| Service/repository | service/runtime implementation and persistence boundary.                        |
| Test evidence      | unit/e2e/manual/browser/API evidence.                                           |
| Runtime status     | complete, partial, read_only, stub, blocked, not_started, unknown.              |
| UX status          | usable, awkward, incomplete, misleading, absent.                                |
| Severity           | P0/P1/P2/P3 with rationale.                                                     |
| Follow-up task     | proposed queue task or approval gate.                                           |

## Audit Passes And Closeout Boundaries

User clarification on 2026-05-25: the requested "three rounds" are not three stages of one audit. They are three independent full audits. Each pass must start from SSOT requirements again and cover the full product surface across student, content_admin, ops_admin, super_admin, unauthenticated, and system/runtime boundaries.

Each full pass must close out independently:

1. update this shared plan/evidence as needed;
2. run the round's validation commands;
3. stage, commit, merge to `master`, push, and clean the short-lived branch when safe;
4. register or advance the next queued task from clean `master`.

The earlier stage-oriented tasks are retained as preparation evidence only:

| Task                                              | Handling                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `phase-12-mvp-requirements-runtime-audit-round-1` | closed; useful SSOT inventory, but not treated as one complete independent audit pass   |
| `phase-12-mvp-requirements-runtime-audit-round-2` | closed; useful static code/API/test mapping, but not treated as one complete audit pass |
| `phase-12-mvp-requirements-runtime-audit-round-3` | blocked/superseded by the corrected three full-pass audit protocol                      |
| `phase-12-mvp-requirements-runtime-audit-summary` | blocked/superseded by `phase-12-mvp-full-requirements-audit-summary-and-repair-queue`   |

### Full Audit Pass 1

- Read all requirement modules and stories fresh.
- Rebuild the AC inventory from SSOT instead of relying on previous notes.
- Inspect UI, API, service/repository, and tests for every epic group.
- Verify representative local/browser routes for the largest uncertainty areas.
- Classify P0/P1/P2/P3 findings and note evidence confidence.
- Closeout task: `phase-12-mvp-full-requirements-audit-pass-1`.

### Full Audit Pass 2

- Repeat the full SSOT-to-runtime audit independently from pass 1.
- Use pass 1 only as a challenge list after independently reading docs/code/runtime.
- Confirm, refine, or reject each pass 1 finding with fresh evidence.
- Add missed stories, role boundaries, API gaps, or false positives.
- Closeout task: `phase-12-mvp-full-requirements-audit-pass-2`.

### Full Audit Pass 3

- Repeat the full SSOT-to-runtime audit independently from passes 1 and 2.
- Focus on blind spots left by the first two passes while still covering every epic.
- Recheck browser/runtime surfaces for key student/content/ops/super_admin flows.
- Do not infer completion from file existence alone.
- Closeout task: `phase-12-mvp-full-requirements-audit-pass-3`.

### Summary: Repair Queue Seeding

- Consolidate the three full independent audit passes.
- Produce the severity-ranked issue register and repair queue.
- Seed independently shippable repair tasks with allowedFiles, blockedFiles, validation commands, and high-risk approval gates.
- Closeout task: `phase-12-mvp-full-requirements-audit-summary-and-repair-queue`.

## Deliverables

- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- Three round logs.
- MVP requirements runtime coverage matrix.
- Role-based issue register.
- P0/P1/P2/P3 severity list.
- Proposed repair queue grouped by independently shippable tasks.
- Repository hygiene closeout checklist.
- Taste compliance self-check.

## Validation Commands

Minimum for each docs-only audit round:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId <round-task-id>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

If browser/runtime walkthrough exposes testable breakage and time allows, record targeted local commands in evidence. Do not run provider, staging, prod, cloud, dependency, schema, migration, or script operations.
