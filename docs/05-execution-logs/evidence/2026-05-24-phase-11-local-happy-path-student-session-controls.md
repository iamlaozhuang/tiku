# Evidence: phase-11-local-happy-path-student-session-controls

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-local-happy-path-student-session-controls`
- Goal: make student session exit behavior explicit so local happy-path role switching can continue from `/profile`.

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

- `Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-student-session-controls`: passed.
- TDD red check:
  - `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts`: failed before implementation with 1 expected failure because `/profile` had no accessible `退出登录` button.
- Focused UI tests after implementation:
  - `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts`: passed, 1 file, 5 tests.
- `Test-AgentSystemReadiness.ps1`: passed.
- `Test-NamingConventions.ps1`: passed.
- First `Invoke-QualityGate.ps1`: lint, typecheck, and unit tests passed; `format:check` failed because the task queue file was rewritten by the status helper with default PowerShell encoding and broke an existing Chinese `sourceStory` line.
- The task queue was mechanically restored from `HEAD` and this task's queue entries were reapplied with UTF-8-safe edits. The status helper script was not changed.
- Prettier was run on the modified task files.
- Second `Invoke-QualityGate.ps1`: passed.
  - `npm run lint`: passed.
  - `npm run typecheck`: passed.
  - `npm run test:unit`: 107 test files passed, 395 tests passed.
  - `npm run format:check`: passed.

## Root Cause

The student profile page duplicated local session token handling inside the page module and rendered navigation links, but did not expose an explicit logout/session-exit control. That made local happy-path role switching unclear from `/profile`.

## Fix Summary

- Added a shared `clearStoredStudentSessionToken` helper in the student runtime API module.
- Reused the shared student session helper functions from the profile/redeem page instead of duplicating the local storage key and auth-header helpers.
- Added an accessible `退出登录` button to the student profile header; clicking it clears the local session token, clears loaded profile state, and renders the existing `请先登录` recovery path.

## Browser Verification

Local in-app browser verification against `http://localhost:3000/profile` used only the existing local dev session and did not record the session token.

- `/profile`: displayed a `退出登录` button in the student profile header.
- Clicking `退出登录`: rendered the `请先登录` state with the existing `前往登录` link.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, and customer/private data.
