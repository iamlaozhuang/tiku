# Unified Standard MVP Student Experience Code Audit Plan

## Task

- Task id: `unified-standard-mvp-student-experience-code-audit`
- Branch: `codex/unified-standard-mvp-student-experience-code-audit`
- Date: 2026-06-14
- Task kind: read-only code audit candidate

## Fresh Approval

The user approved only this task:

> Continue `D:\tiku`; create and execute `unified-standard-mvp-student-experience-code-audit`; strictly follow
> `task-queue.yaml` `allowedFiles`, `readOnlyAllowedFiles`, and `blockedFiles`; only read-only code audit and governance
> records are allowed; no code fixes, implementation, schema/migration, provider/env, e2e, dependency changes, PR, or
> push; finish with a local independent commit and stop without claiming follow-up tasks.

This approval does not include `unified-standard-mvp-ai-rag-governed-code-audit`, code fixes, implementation,
schema/migration, provider/env, e2e, dependency changes, deploy, payment, external-service work, PR, merge, push,
force-push, or follow-up task execution.

## Start Checkpoint

| Checkpoint               | Result                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Current branch           | `codex/unified-standard-mvp-student-experience-code-audit`               |
| HEAD                     | `c67733fc6c5211fdbfe48d2e0b183ffe98170f35`                               |
| `master`                 | `c67733fc6c5211fdbfe48d2e0b183ffe98170f35`                               |
| `origin/master`          | `c67733fc6c5211fdbfe48d2e0b183ffe98170f35`                               |
| Worktree                 | clean before this task plan                                              |
| Local `codex/*` residue  | only `codex/unified-standard-mvp-student-experience-code-audit` observed |
| Remote `codex/*` residue | none observed before task                                                |

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`

## Traceability Baseline

- `landingIds`: `LAND-PRACTICE-MOCK-REPORT`
- `sourceIds`: `STD-REQ-03`, `STD-STORY-03`, `STD-REQ-04`, `STD-STORY-04`, `STD-REQ-02`
- `capabilityIds`: `CAP-STD-PRACTICE`, `CAP-STD-MOCK-EXAM`, `CAP-STD-EXAM-REPORT-MISTAKE-BOOK`
- `useCaseIds`: `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`, `UC-STD-REPORT-MISTAKE-BOOK`
- `deltaIds`: `DELTA-PRACTICE-MOCK-REPORT`
- `conflictRefs`: `CFX-FORMAL-001`, `CFX-ORG-001`, `CFX-PROVIDER-001`

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-mvp-student-experience-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-student-experience-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-student-experience-code-audit.md`

## Read-Only Scope

- `docs/**`
- `scripts/**`
- `src/app/(student)/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/server/services/student-experience/**`
- `src/server/repositories/student-experience/**`
- `src/server/contracts/student-experience/**`
- `src/server/mappers/student-experience/**`
- `src/server/validators/student-experience/**`

## Blocked Files And Gates

- Blocked files: `.env.local`, `.env.example`, `.env.*`, `package.json`, lockfiles, `src/**` writes, `tests/**`,
  `e2e/**`, `src/db/schema/**`, `drizzle/**`, and `scripts/**` writes.
- Blocked gates: employee training answer, organization snapshots, raw answer viewer, provider/model request, e2e,
  schema/migration, implementation, and Cost Calibration Gate.

## Audit Method

1. Inventory the queued read-only surfaces and record present or missing paths.
2. Inspect only visible scoped files; do not follow imports into out-of-scope feature modules except by recording the
   delegation boundary.
3. Compare scoped implementation surfaces against the standard MVP student experience requirements for `practice`,
   `mock_exam`, `exam_report`, and `mistake_book`.
4. Record findings as audit evidence only, with traceability ids and blocked remediation boundaries.
5. Update `project-state.yaml` and `task-queue.yaml` to mark this task closed locally after evidence and audit review are
   written.
6. Run the queued validation commands and create one local commit.
7. Stop without claiming `unified-standard-mvp-ai-rag-governed-code-audit` or any other follow-up task.

## Evidence Hygiene

Evidence must not include raw secrets, provider payloads, raw responses, database URLs, row data, prompt payloads,
cleartext `redeem_code`, raw question bank content, raw paper content, raw material content, student answer text, or
employee subjective answer text.
