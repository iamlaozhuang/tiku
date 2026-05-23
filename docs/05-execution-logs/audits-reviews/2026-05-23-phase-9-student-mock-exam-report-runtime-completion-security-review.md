# Security Review: phase-9-student-mock-exam-report-runtime-completion

## Metadata

- Task id: `phase-9-student-mock-exam-report-runtime-completion`
- Branch: `codex/phase-9-student-mock-exam-report-runtime-completion`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/repositories/mock-exam-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/exam-report-service.ts`
- `src/server/services/mock-exam-service.test.ts`
- `src/server/services/exam-report-service.test.ts`

## Risk Types Reviewed

- `mock_exam`
- `exam_report`
- `student`
- `authorization`
- `ai_scoring`
- `ai_call_log`

## Abuse Cases Considered

- A student guesses another student's `mock_exam` or `exam_report` `publicId`.
- A student submits a mock exam after authorization expires.
- A submitted answer record exposes correctness, `standard_answer`, or `analysis` before the report boundary.
- A terminated mock exam generates an `exam_report`.
- A DTO or report snapshot exposes numeric database `id`, session internals, token, password, secret, API key, raw prompt, or raw model response.
- Learning suggestion retry connects to a real provider or logs unredacted data.

## Findings

- Mock exam access continues through `getOwnedMockExam`, which combines `publicId`, authenticated `userPublicId`, and effective authorization checks.
- Invalid authorization still terminates in-progress mock exams and prevents writable operations.
- Mock exam answer saving still returns null correctness and score values, preserving the no-feedback answering boundary.
- Submit scoring updates saved `answer_record` rows server-side, but response DTOs remain mapped through public identifiers only.
- Exam report generation still rejects `terminated` attempts and requires a completed or partial-failed submitted mock exam.
- Report snapshots now include unanswered question details from the immutable paper snapshot, without adding internal numeric ids.
- Learning suggestion behavior remains on the existing local mock-provider boundary; no real AI provider, production credential, or external service was introduced.

## Accepted Gaps

- Subjective AI scoring, AI explanation, AI hint, and full `ai_call_log` behavior are deferred to `phase-9-ai-scoring-explanation-hint-runtime`.
- `US-03-08` record-list handling for `terminated` attempts conflicts with the current `exam_report` contract because terminated attempts must not generate reports. This task records the boundary and does not invent a new DTO outside the queue contract.
- Browser retry/offline UX remains deferred to `phase-9-student-experience-ui-completion`.

## Verdict

`APPROVE`: the runtime changes preserve session, ownership, authorization, standard response envelope, and public identifier boundaries. No dependency, schema, migration, secret, external provider, or production resource change was introduced.
