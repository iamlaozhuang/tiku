# Phase 4 Practice UI Baseline Security Review

## Metadata

- Task id: `phase-4-practice-ui-baseline`
- Branch: `codex/phase-4-practice-ui-baseline`
- Base: `master`
- Review date: 2026-05-20
- Reviewer: Codex
- Risk types: `student`, `authorization`, `frontend`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/(student)/practice/page.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `tests/unit/student-practice-ui.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-practice-ui-baseline.md`

## Abuse Cases Considered

- A student changes `paperPublicId` to infer unavailable practice content.
- A student sees internal numeric database ids in DOM attributes, links, or visible text.
- Practice UI exposes `standardAnswerRichText` or `analysisRichText` before local answer submission.
- Practice UI fabricates Phase 5 `ai_explanation` or `ai_hint` results.
- Subjective skill practice stores or displays secrets, session details, storage keys, or admin-only data in fixture content.

## Data Exposure Review

- The practice surface exposes `data-public-id` for the practice public identifier and does not set `data-id`.
- Browser verification found `internalIdCount: 0` for the verified theory and skill practice routes.
- Fixture data uses `publicId`, `paperPublicId`, `answerRecordPublicId`, and `mistakeBookPublicId`; no numeric row ids are rendered.
- No password, token, session, storage object key, audit internals, or model secret is present in the UI fixture.
- Optional AI fields are represented as unavailable placeholders instead of empty strings or invented content.

## Authorization Boundary Review

- This is a frontend UI baseline over existing practice contracts; no server-side authorization resolver or repository behavior changed.
- Unknown `paperPublicId` renders an empty guidance state and does not expose other fixture paper metadata.
- Authorization-expired state hides practice content and guides the student to authorization handling.
- Real server enforcement remains in the existing practice API/service baseline and must still combine user ownership, status, expiry, and effective `authorization`.

## API Contract Review

- No API route, service, repository, mapper, validator, database schema, or migration changed.
- UI fixture consumes `PracticeDto` and `PracticeAnswerFeedbackDto` camelCase contract types.
- The route reads `paperPublicId`, never `[id]` or an internal numeric identifier.
- The task does not alter `{ code, message, data, pagination? }` transport response contracts.

## Test Coverage And Accepted Gaps

- Unit tests cover public identifier rendering, no `data-id`, objective answer feedback, disabled second objective submission, next-question navigation, subjective material display, subjective answer save state, AI unavailable placeholders, loading, error, authorization-expired, and empty states.
- Browser/IAB verified `/practice?paperPublicId=paper-marketing-theory-002` objective answer flow and `/practice?paperPublicId=paper-marketing-skill-001` subjective save flow.
- Desktop browser verification used the default IAB viewport; mobile verification used 390x844 and found no horizontal overflow.
- Accepted gap: fixture-backed UI does not call the unavailable runtime practice API or authenticated session resolver.
- Accepted gap: material rich text is displayed as trusted fixture text only; production rich text rendering remains a later integration concern.

## Evidence

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass after explicit `StudentPracticeFixture[]` annotation.
- `npm.cmd run test:unit`: pass, 63 files and 192 tests.
- `npm.cmd run build`: pass, `/practice` included in route output.
- `Test-NamingConventions.ps1`: pass.
- Browser/IAB: pass, console `error`/`warn` logs empty.

## Verdict

`APPROVE`

No blocking security or authorization issue found for the scoped UI baseline.
