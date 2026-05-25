# Phase 12 MVP Requirements Runtime Audit Task Plan

## Goal

Run a requirements-first local audit that uses `docs/01-requirements/` as the SSOT and maps MVP requirements to current UI, API, service/repository runtime, tests, evidence, and role-based browser usability.

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

## Audit Rounds And Closeout Boundaries

Each round must close out independently:

1. update this shared plan/evidence as needed;
2. run the round's validation commands;
3. stage, commit, merge to `master`, push, and clean the short-lived branch when safe;
4. register or advance the next queued task from clean `master`.

### Round 1: SSOT Decomposition

- Read all requirement modules and stories fresh.
- Break requirements into role-based acceptance units for:
  - student;
  - content_admin;
  - ops_admin;
  - super_admin;
  - unauthenticated/authorization edge cases.
- Mark explicit non-goals so implementation gaps are not misclassified.
- Produce the initial AC inventory and role/module coverage map.
- Closeout task: `phase-12-mvp-requirements-runtime-audit-round-1`.

### Round 2: Code/API/Test Mapping

- Map each AC to current routes under `src/app`, UI components under `src/features`, API handlers under `src/app/api/v1`, service files under `src/server/services`, repository files under `src/server/repositories`, and tests under `tests/unit` and `e2e`.
- Classify gaps separately:
  - UI absent but API exists;
  - UI present but read-only;
  - UI writes but does not expose required fields;
  - API exists but service is stub/unavailable;
  - service exists but persistence/audit/logging is partial;
  - test coverage claims more than runtime supports.
- Do not infer completion from file existence alone.
- Closeout task: `phase-12-mvp-requirements-runtime-audit-round-2`.

### Round 3: Local Runtime And UX Walkthrough

- Use local/dev only.
- Validate selected representative paths in the browser/API for student, content_admin, ops_admin, and super_admin surfaces.
- Record screenshots or local paths only when useful and sanitized.
- Verify specific suspected gaps without limiting the audit to them:
  - content question type and per-type fields;
  - content question edit UX;
  - redeem_code generation workflow;
  - org_auth creation/cancel workflow;
  - employee/organization operational flows;
  - student authorization-to-practice/mock/report/mistake_book flows;
  - AI/RAG visible citation/log boundaries.
- Closeout task: `phase-12-mvp-requirements-runtime-audit-round-3`.

### Summary: Repair Queue Seeding

- Consolidate the three rounds.
- Produce the severity-ranked issue register and repair queue.
- Closeout task: `phase-12-mvp-requirements-runtime-audit-summary`.

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
