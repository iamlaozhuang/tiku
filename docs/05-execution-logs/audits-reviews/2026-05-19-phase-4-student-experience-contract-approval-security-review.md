# Phase 4 Student Experience Contract Approval Security Review

## Review Metadata

- Task id: `phase-4-student-experience-contract-approval`
- Branch: `codex/phase-4-student-experience-contract`
- Base: `master`
- Reviewer: Codex self-review
- Review date: 2026-05-19
- Verdict: `APPROVE`

## Files Reviewed

- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-experience-contract-approval.md`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `student`

## Abuse Cases Considered

1. A student changes a `publicId` in a URL to read another student's `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book`.
   - Contract requires session, user ownership, resource status, and effective `authorization` checks for every lookup.
2. A student with expired or cancelled `authorization` tries to continue an active `practice` or `mock_exam`.
   - Contract requires re-checking effective `authorization` on start, continue, submit, and report/mistake-book reads.
3. A student tries to start a new session from an archived or draft paper.
   - Contract restricts new sessions to published papers only.
4. A mock exam answer API leaks correctness, `standard_answer`, `analysis`, `ai_hint`, or `ai_explanation` while the exam is in progress.
   - Contract explicitly prohibits these fields during mock exam answering.
5. A report or mistake-book response leaks storage keys, internal ids, admin data, session internals, or AI/model secrets.
   - Contract explicitly forbids exposing internal numeric `id`, storage `object_key`, session internals, API keys, model secrets, and raw session tokens.
6. A stale client overwrites newer saved answers after reconnecting.
   - Contract limits network recovery to submitting answers not yet saved on the server and forbids overwriting newer server answers.

## Data Exposure Review

- Student DTOs use `publicId` and camelCase fields.
- Internal numeric database `id` values are explicitly excluded from snapshots and DTOs.
- `paper_asset` and storage `object_key` are excluded from student-facing APIs.
- `paper_snapshot`, `question_snapshot`, and `answer_snapshot` are constrained to student-visible content and scoring context.
- Optional or unavailable AI/RAG fields are nullable in Phase 4 and must not be fabricated.

## Authorization Boundary Review

- All student-facing APIs require authenticated `student` context.
- Effective access is defined as valid `personal_auth` plus valid `org_auth`.
- Access must be checked by `profession`, `level`, active status, and validity window.
- Historical `exam_report` and `mistake_book` reads still require current effective `authorization`.
- Terminated sessions preserve backend traceability but hide unavailable content from students.

## API Contract Review

- REST paths use `/api/v1/` and kebab-case plural nouns.
- Dynamic URL identifiers use `publicId`, never numeric `id`.
- Response envelope remains `{ code, message, data, pagination? }`.
- JSON fields use camelCase.
- Error responses use `data: null`.
- Route handlers remain future thin adapters over service/repository layers per ADR-002.

## Test Coverage And Accepted Gaps

This task is documentation-only. Runtime tests are not applicable yet.

Required validations for this task:

- Contract file exists.
- Contract contains required domain terms.
- Task plan references security review.
- Naming convention scan passes.
- Format check passes.

Accepted gaps for future implementation tasks:

- Schema constraints for one-active-practice-per-user-paper must be tested in `phase-4-answer-record-schema-baseline`.
- Student paper authorization tests must be added in `phase-4-student-paper-access-baseline`.
- Practice/mock exam ownership and termination tests must be added in their service/API tasks.
- Mock exam no-leak response tests must be added when routes exist.

## Verdict

`APPROVE`

The contract is safe to use as a Phase 4 baseline because it is documentation-only, preserves explicit authorization boundaries, avoids internal identifier exposure, and defers runtime/schema risks to later gated tasks.
