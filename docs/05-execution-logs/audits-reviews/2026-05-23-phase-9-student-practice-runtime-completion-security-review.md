# Security Review: phase-9-student-practice-runtime-completion

## Metadata

- Task id: `phase-9-student-practice-runtime-completion`
- Branch: `codex/phase-9-student-practice-runtime-completion`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/contracts/practice-contract.ts`
- `src/server/mappers/practice-mapper.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/practice-route.test.ts`
- `src/server/services/practice-service.test.ts`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`

## Risk Types Reviewed

- `practice`
- `student`
- `authorization`
- `mistake_book`
- `ai_call_log`
- `api_contract`

## Abuse Cases Considered

- A student changes a practice `publicId` to read another student's saved answers.
- A student submits an answer after authorization expires.
- A student re-answers an objective question to overwrite feedback.
- A DTO accidentally exposes numeric database `id`.
- AI status fields imply an external provider call that did not happen.

## Findings

- Practice answer listing is filtered by active user lookup and practice ownership before answer rows are selected.
- Existing authorization validation remains in `getReadablePractice`; expired or invalid authorization still terminates in-progress practice.
- Objective duplicate-answer rejection remains in place.
- DTOs expose `publicId` fields only; numeric `id` remains repository-internal.
- No session token, password, secret, API key, raw prompt, raw model payload, or provider response is returned.
- AI explanation/hint remains explicit residual scope; this task does not fabricate `ai_call_log` or provider success.

## Accepted Gaps

- AI explanation auto-generation and subjective hint/re-answer are deferred to `phase-9-ai-scoring-explanation-hint-runtime`.
- Browser retry UX for save failure is deferred to `phase-9-student-experience-ui-completion` because student feature files are outside this task's allowed scope.

## Verdict

`APPROVE`: the runtime changes preserve auth/session/authorization boundaries, standard response envelopes, and public identifier constraints.
