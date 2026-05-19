# Phase 4 Answer Record Schema Baseline Security Review

## Metadata

- Task id: `phase-4-answer-record-schema-baseline`
- Branch: `codex/phase-4-answer-record-schema`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-19
- Verdict: `APPROVE`

## Files Reviewed

- `src/db/schema/student-experience.ts`
- `src/db/schema/student-experience.test.ts`
- `src/db/schema/index.ts`
- `src/server/models/student-experience.ts`
- `src/server/models/student-experience.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-answer-record-schema-baseline.md`

## Risk Types Reviewed

- `schema`
- `data_contract`
- `authorization`

## Abuse Cases Considered

- A student changes a public identifier to read another user's `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book`.
- A future API accidentally exposes internal numeric `id` values instead of `public_id`.
- A future API returns answer correctness, `standard_answer`, or `analysis` during `mock_exam` answering.
- Historical reports or mistake book records leak content after authorization loss.
- Snapshots accidentally persist session tokens, storage object keys, passwords, or admin contact data.

## Data Exposure Review

- The schema stores internal numeric `id` values for database joins only; every externally addressable table also has `public_id`.
- Snapshot columns use `jsonb` and remain internal storage fields in this task. No route handler or DTO is added.
- No `paper_asset.object_key`, auth token, password hash, session token, API key, or model secret field is added.
- `answer_record` separates `question_snapshot` and `answer_snapshot`, allowing later mappers to hide correctness and answer details in `mock_exam` responses.
- `learning_suggestion_snapshot` is nullable, matching Phase 4's no-AI invocation boundary.

## Authorization Boundary Review

- All five student workflow tables are user-owned through `user_id`.
- `practice`, `mock_exam`, `answer_record`, and `exam_report` also retain `paper_id`, `paper_public_id`, `profession`, `level`, or `subject` context needed by later authorization filtering.
- `mistake_book` stores `profession`, `level`, and `subject`, enabling later visibility filtering by effective `authorization`.
- This task does not implement authorization checks; later service/API tasks must combine session, ownership, resource status, and effective authorization as required by `student-experience-contract.md`.

## API Contract Review

- No API route, DTO, mapper, validator, or service implementation is introduced in this task.
- Database names remain `snake_case`; API `camelCase` fields are intentionally not implemented here because `src/server/contracts/**` is blocked.
- Public URL readiness is represented by `public_id`, but no URL exposes numeric `id`.

## Test Coverage And Accepted Gaps

- Added schema tests for table names, required contract columns, index names, and enum values.
- Added model tests for enum exports and snake_case row shapes.
- Accepted gap: database-level checks for "exactly one of `practice_id` or `mock_exam_id`" and "only one active practice per user/paper" are not enforced in this baseline because no migration or advanced DB constraint task is approved. Later service/repository tasks must enforce these invariants before runtime exposure.
- Accepted gap: snapshot content filtering is a later mapper/service responsibility because this task does not expose DTOs or APIs.

## Review Conclusion

`APPROVE`.

The task adds storage and model type contracts only. It does not introduce APIs, dependencies, migrations, secrets, external service configuration, or runtime authorization behavior.
