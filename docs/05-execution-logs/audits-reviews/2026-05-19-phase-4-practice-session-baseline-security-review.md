# Phase 4 Practice Session Baseline Security Review

## Metadata

- Task id: `phase-4-practice-session-baseline`
- Review date: 2026-05-19
- Risk types: `authorization`, `api_contract`, `data_contract`, `student`
- Verdict: `APPROVE`

## Scope Reviewed

- Student-facing practice lifecycle API baseline.
- Route handler authentication boundary through `PracticeUserContext`.
- Service rules for start/resume, detail, answer submission, restart, and termination.
- Objective answer feedback and `mistake_book` update boundary.
- DTO mapping from snake_case repository rows to camelCase API data.

## Findings

No blocking findings.

## Security Controls Confirmed

- User context is required before any practice service method is called.
- Practice lookups combine `publicId`, current user ownership, in-progress status, expiry, and effective `authorization`.
- Starting practice requires a published paper row and current matching `authorization`.
- Continuing practice hides expired, terminated, missing, or unauthorized progress behind `404302`.
- Practice answer submission locates questions only inside `paper_snapshot`.
- Objective feedback returns `standardAnswerRichText` and `analysisRichText` only after answer submission.
- Objective questions cannot be answered twice.
- Wrong objective answers call `mistake_book` upsert through a repository boundary; Phase 4 does not expose mistake book browsing here.
- Student DTOs expose public identifiers and camelCase fields only; internal numeric ids are not returned.
- Runtime route files use unavailable service and unavailable resolver until real session and repository wiring lands.

## Accepted Gaps

- Repository implementation is contract-only in this task; database querying and transactionality are deferred to a later integration task.
- `mistake_book` API routes are deferred to the dedicated `phase-4-mistake-book-baseline` task.
- Phase 5 AI statuses are returned as `null`; no AI scoring, hint, or explanation is invoked in this task.
- Real session resolver is intentionally unavailable, matching existing baseline routes.

## Evidence

- Targeted tests covered mapper, validator, service lifecycle and authorization, objective feedback, mistake book update, and route handler behavior.
- Queue validation passed:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - Practice route response contract scan
  - Service keyword scan for `practice`, `answer_record`, and `mistake_book`
  - Naming convention scan
