# Phase 25 Runner Hardening Design Review

## Summary

- Task id: `phase-25-runner-hardening-design`.
- Branch: `codex/phase-25-fresh-validation-runner-hardening`.
- Base: `master` at `b36c40536b74a71101e9e075d272e6b0ba3af8da`.
- Reviewer: Codex.
- Review date: 2026-06-01.
- Verdict: APPROVE.

## Files Reviewed

- `scripts/local/Invoke-FreshValidationRun.ps1`
- `tests/unit/fresh-validation-runner.test.ts`
- `docs/05-execution-logs/evidence/2026-06-01-phase-24-safe-local-dev-bootstrap-runner.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-24-fresh-db-repeatability-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Risk Types Reviewed

- `database_migration`
- `secret`
- `local_verification`
- `evidence_integrity`
- `blocked_gate`
- `powershell_script`

## Minimum Hardening Contract

The Phase 25 implementation may add only these runner capabilities:

- `-PreflightOnly`: validate local prerequisites and target classification, then exit before Docker, database creation, migration, seed, validation data prep, e2e, or build.
- Failure classification: map failures into stable human-readable categories such as `env_missing`, `target_not_local_dev`, `docker_unavailable`, `migration_failed`, `seed_failed`, `validation_data_prep_failed`, `e2e_failed`, `build_failed`, and `unknown_failure`.
- Redacted summary: always print `hostClass`, `databaseName`, `mode`, `result`, and `failureCategory` when available; never print full database URLs, usernames, passwords, tokens, provider payloads, prompts, answers, model responses, or plaintext `redeem_code`.
- Auditability: keep the command sequence fixed and visible; do not introduce dynamic shell command composition for DB or migration operations.

## Approval Boundaries

The following remain blocked unless a future explicit approval says otherwise:

- dependency, package, or lockfile changes;
- schema, migration, or drizzle changes;
- raw SQL, `drizzle-kit push`, migration table repair;
- drop, truncate, reset, delete, volume reset, or destructive data operation;
- staging, prod, cloud, deploy, real provider, or external service access;
- `.env.example` changes;
- writing secrets or sensitive payloads into evidence.

The current user approval covers secret-safe `.env.local` databaseName target handling for local/dev validation only. The design task itself does not read or modify `.env.local`.

## Abuse Cases Considered

- A runner failure prints a full `DATABASE_URL`: blocked by redacted summary tests.
- A preflight accidentally starts Docker or mutates `.env.local`: blocked by `-PreflightOnly` contract.
- A non-local database target is accepted: blocked by target classification and failure category.
- A migration drift failure triggers ad hoc repair: blocked by stop-the-line rules.
- Evidence captures raw provider or answer payloads: blocked by evidence redaction rules.

## Data Exposure Review

- Safe to record: existence/absence, `hostClass`, `databaseName`, command names, pass/fail, failure category, and sanitized failure summaries.
- Not safe to record: DB URL, username, password, token, Authorization header, provider payload, raw prompt, raw student answer, raw model response, plaintext `redeem_code`, or full private content.

## Authorization And API Boundary Review

- No authenticated API route, authorization model, public identifier, API DTO, or product behavior changes are allowed in this design.
- Runner hardening remains local/dev validation infrastructure only.

## Test Coverage Plan

- Add unit tests before implementation for `-PreflightOnly`, redacted summaries, and failure classification behavior.
- Run the targeted unit test in RED state before changing production runner code.
- Run targeted unit, full unit, naming, and `git diff --check` after implementation.

## Accepted Gaps

- Full fresh DB chain is deferred to `phase-25-runner-repeatability-smoke`.
- Browser/e2e/build gates are not run in this docs-only design task.
