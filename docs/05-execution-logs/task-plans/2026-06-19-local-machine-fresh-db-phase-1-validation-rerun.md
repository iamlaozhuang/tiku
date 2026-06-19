# Local Machine Fresh DB Phase 1 Validation Rerun Task Plan

## Task

- Task id: `local-machine-fresh-db-phase-1-validation-rerun`
- Branch: `codex/local-machine-fresh-db-phase-1-validation-rerun`
- Task kind: `validation`
- Module Run version: 2
- Date: 2026-06-19
- Goal: rerun full phase 1 validation against one fresh disposable local dev database without repairing the drifted existing `tiku` database.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-local-machine-phase-0-1-validation.md`

## Scope

- Use fresh local database alias `tiku_fresh_phase1_202606182307` inside the existing local Docker `tiku-postgres` service.
- Use process-scoped `DATABASE_URL` for migration, seed, validation data prep, E2E, and build. Existing local tooling may perform secret-safe runtime reads of `.env.local`, but the task must not change, copy, or output `.env*` values.
- Update only docs/state/evidence/audit files for this task.

## Blocked Work

- Do not repair the existing `tiku` migration ledger.
- Do not run raw SQL migration repair, `drizzle-kit push`, drop, truncate, reset, or delete against existing databases.
- Do not modify product source, tests, E2E specs, schema, migrations, scripts, dependencies, package files, lockfiles, `.env*`, staging/prod/cloud/deploy, provider configuration, payment, external services, PR, push, force-push, or Cost Calibration Gate.

## Execution Plan

1. Register the task and evidence paths.
2. Start local Docker Postgres and create fresh database `tiku_fresh_phase1_202606182307`.
3. Set process-scoped `DATABASE_URL` to the fresh local database for each runtime command; never write the value into files or evidence.
4. Run `drizzle-kit migrate`, dev seed, validation data prep, lint, typecheck, full unit, full E2E, build, and `git diff --check`.
5. Verify required tables and seed counts in the fresh database using redacted count-only checks.
6. Record pass/fail, residual gaps, and blocked gates; format docs; run mechanism gates; make one local commit.

## Success Criteria

- Fresh local database is created without modifying existing database ledgers.
- Current tracked Drizzle migrations apply to the fresh database.
- Dev seed and validation data prep complete against the same fresh database.
- Full `lint`, `typecheck`, `test:unit`, `test:e2e`, `build`, `git diff --check`, scoped Prettier check, and mechanism gates pass.
- Evidence contains no database URL, secret, credential, token, raw DB row, cleartext `redeem_code`, full content, screenshot, trace, raw prompt, raw AI response, or provider payload.

## Stop Conditions

- Any required validation command fails and cannot be classified as an allowed retry case.
- The work requires source/test/schema/migration/script/dependency changes.
- The work requires repairing the existing `tiku` database or doing destructive DB work.
- Evidence would need sensitive values or raw runtime data.
- Any provider/model, staging/prod/cloud/deploy, payment, external service, PR, push, force-push, or Cost Calibration Gate action becomes necessary.
