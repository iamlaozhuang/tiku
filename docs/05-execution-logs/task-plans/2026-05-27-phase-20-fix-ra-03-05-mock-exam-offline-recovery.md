# Phase 20 Fix RA-03-05 Mock Exam Offline Recovery Plan

**Task id:** `phase-20-fix-ra-03-05-mock-exam-offline-recovery`

**Branch:** `codex/phase-20-fix-ra-03-05-mock-exam-offline-recovery`

## Recovery and Required Reading

- Confirmed previous task `phase-20-fix-ra-03-03-skill-practice-final-scoring` was pushed and its branch cleaned before claiming this task.
- Re-read RA-03 finding `F-RA-03-05-001` in `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`.
- Re-read Phase 21 implementation breakdown guidance for Phase 22-D student/runtime tasks.
- Ran `Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-05-mock-exam-offline-recovery`; claim readiness passed on the short-lived branch.

## Scope

- Add local cached mock exam recovery for the initial runtime load path.
- Cache only the mock exam snapshot/result needed to render the student mock exam shell; do not cache session token or expose standard answers.
- Show a clear local/offline recovery state when network load fails but cached mock exam data is available.
- Leave answer save retry/offline retry queue to `phase-20-fix-ra-03-06-mock-answer-save-retry`.

## TDD Plan

1. RED UI test: successful runtime mock exam load writes a local cache record without storing the session token.
2. RED UI test: when `/api/v1/mock-exams` fails and a matching local cache exists, the page renders the cached mock exam plus recovery notice instead of the generic load error.
3. GREEN implementation: add small cache helpers around `localStorage` and wire them into initial runtime mock exam load only.
4. Verify focused UI tests, full unit, e2e, build, readiness, Git completion inventory, diff, changed-file Prettier, naming, and quality gate.

## Risk Controls

- `browser_runtime`: cover local storage recovery through unit tests and existing e2e after implementation.
- `local_human_verification`: record command outputs in evidence before closeout.
- `evidence_integrity`: keep state/evidence updates scoped to this task.
- High-risk gates not approved: no `database_migration`, `auth_permission_model`, `secret_or_env_change`, `external_service_config`, `dependency_change`, deploy/cloud, or destructive data operation.
