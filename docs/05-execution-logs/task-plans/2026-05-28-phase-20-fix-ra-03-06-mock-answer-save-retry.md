# Phase 20 Fix RA-03-06 Mock Answer Save Retry Plan

**Task id:** `phase-20-fix-ra-03-06-mock-answer-save-retry`

**Branch:** `codex/phase-20-fix-ra-03-06-mock-answer-save-retry`

## Recovery and Required Reading

- Re-read `docs/03-standards/code-taste-ten-commandments.md`, `docs/03-standards/local-ci.md`, project state, task queue, and blocked gates during startup recovery.
- Re-read RA-03 finding `F-RA-03-06-001`: mock answer save lacks network failure auto-retry/offline retry UX evidence.
- Ran `Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-06-mock-answer-save-retry`; claim readiness passed on the short-lived branch.

## Scope

- Add local-only pending answer save queue behavior for runtime `mock_exam` answer saves when the network save call fails.
- Preserve pre-submit secrecy: no correctness, `standard_answer`, `analysis`, raw token, or sensitive payload in UI/local queue evidence.
- Do not change schema, migrations, dependencies, env files, provider/cloud/deploy configuration, or auth permission model.

## TDD Plan

1. RED UI test: runtime answer save network failure stores a redaction-safe pending answer in localStorage and shows a retry surface instead of failing the whole mock_exam page.
2. RED/GREEN UI test: clicking retry resends queued answers and clears the pending queue after success.
3. GREEN implementation: add a bounded localStorage pending answer queue and retry handler in `StudentMockExamPage`.
4. Verify focused unit tests, full unit, e2e, build, readiness, naming, Git inventory, diff, changed-file Prettier, and quality gate.

## Risk Controls

- `browser_runtime`: implement in existing student runtime UI without external services.
- `local_human_verification`: use Playwright/unit evidence and local-only dev services.
- `evidence_integrity`: keep evidence concise and do not record credentials, raw tokens, or private answer content beyond synthetic test payloads.
- High-risk gates not approved: no `database_migration`, `auth_permission_model`, `secret_or_env_change`, `external_service_config`, `dependency_change`, deploy/cloud, or destructive data operation.
