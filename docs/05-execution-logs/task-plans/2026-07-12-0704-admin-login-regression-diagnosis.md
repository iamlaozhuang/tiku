# 0704 Admin Login Regression Diagnosis Plan

## Task

- Task id: `0704-admin-login-regression-diagnosis-2026-07-12`
- Branch: `codex/0704-admin-login-regression-diagnosis`
- Priority: P1 regression candidate discovered during B6 acceptance.
- Baseline: local `master` at `28dc0bcc5ec94021557e4663e70713c5a2e11424`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`, especially ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- 2026-07-02 session-cookie contract evidence
- 2026-07-07 0704 role fixture evidence
- 2026-07-09 0704 account-matrix and final localhost evidence
- repository-external 0704 role credential index, values used only in memory

## Confirmed Conflict

- 2026-07-09 redacted evidence records `content_admin` login as passing against the explicit 0704 localhost target.
- The current explicit process-only 0704DB localhost service accepts a known advanced learner account but rejects the current `content_admin` credential pair with the ordinary invalid-credential category.
- This is a regression candidate. It must not be classified as stale documentation or a database-mount failure without root-cause evidence.

## Diagnosis Sequence

1. Reconfirm service identity using non-secret process and health signals; do not print environment values or the database URL.
2. Read the repository-external credential catalog in memory and verify selector uniqueness, chronology, readiness markers, and source-file metadata without outputting any credential or PII.
3. Run a minimal redacted login matrix for previously verified admin roles. Record only role label and pass/failure category; clear browser fields after every attempt.
4. Compare the last known passing evidence and commits with current authentication/session source changes.
5. Form one root-cause hypothesis from the evidence. Do not edit product source, private credential files, or database state during diagnosis.
6. If source regression is proven, create a separate implementation task with a failing test before a minimal fix. If account state remains the only unresolved boundary, stop and request fresh approval for a Boolean-only read-only DB account-status probe.

## Boundaries

- Localhost only, explicit process-level 0704DB override; `.env.local` must not be modified.
- Ordinary login/session side effects are allowed; no other product write is allowed.
- Direct database access, database mutation, credential reset, fixture repair, private-file edit, Provider execution, env/secret output, staging/prod/deploy, dependency, schema/migration/seed, Cost Calibration, screenshot, trace, raw DOM, and remote action are blocked.
- Evidence may contain only role labels, route labels, Boolean/status categories, file paths, commit ids, and test counts.

## Acceptance Standard

- The failing layer is identified as credential-material selection, authentication source behavior, process target mismatch, or current account state, with evidence supporting the classification.
- Previously verified admin roles have a redacted current login matrix.
- No secret or account value is emitted or persisted.
- No fix is proposed or implemented before root cause is established.
