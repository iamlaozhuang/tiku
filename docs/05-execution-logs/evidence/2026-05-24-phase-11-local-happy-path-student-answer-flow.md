# Evidence: phase-11-local-happy-path-student-answer-flow

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-local-happy-path-student-answer-flow`
- Goal: fix the local student `practice` and `mock_exam` answer flow so the happy path from `/home` can show selectable options and save answers.

## Boundary

- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No provider call.
- No secret/env change.

## Validation Results

- `Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-student-answer-flow`: passed.
- TDD red check:
  - `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`: failed before implementation with 3 expected failures:
    - practice did not render `options` snapshot choices;
    - mock_exam did not render `options` snapshot choices;
    - practice restart button was not wired to an observable runtime action.
- Focused UI tests after implementation:
  - `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`: passed, 2 files, 20 tests.
- Mapper regression tests:
  - `npm.cmd run test:unit -- src/server/mappers/practice-mapper.test.ts src/server/mappers/mock-exam-mapper.test.ts`: passed, 2 files, 5 tests.
- `Test-AgentSystemReadiness.ps1`: passed.
- `Test-NamingConventions.ps1`: passed.
- First `Invoke-QualityGate.ps1`: lint, typecheck, and unit tests passed; `format:check` failed on two modified TSX files.
- Prettier was run on the modified task files.
- Second `Invoke-QualityGate.ps1`: passed.
  - `npm run lint`: passed.
  - `npm run typecheck`: passed.
  - `npm run test:unit`: 107 test files passed, 394 tests passed.
  - `npm run format:check`: passed.

## Browser Verification

Local in-app browser verification against `http://localhost:3000` used only local dev seed credentials and did not record the session token.

- `/practice?paperPublicId=paper-dev-theory`: displayed four objective options from the local seed `options` snapshot.
- Practice restart: `POST /api/v1/practices/{publicId}/restart` was triggered through the page button; the page showed the restarted practice and retained visible options.
- Practice answer: after restart, selecting option `A` and submitting displayed objective feedback.
- `/mock-exam?paperPublicId=paper-dev-theory`: displayed four objective options from the local seed `options` snapshot.
- Mock exam answer: selecting option `A` and saving displayed the saved-answer state.
- Mock exam submit: submitting displayed the submitted state.

## Root Cause

The local dev paper snapshot can store objective choices in `options`, while the student `practice` and `mock_exam` UI extractors only read `questionOptions`. This allowed the question stem to render but produced an empty choice list. The practice restart button was also rendered without an action handler.

## Fix Summary

- Student `practice` now reads objective choices from `questionOptions` or `options`.
- Student `mock_exam` now reads objective choices from `questionOptions` or `options`.
- Student `practice` restart now calls the existing local runtime restart endpoint, refreshes the displayed practice, clears local answer state, and returns to the first available question.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, and customer/private data.
