# Local Machine Phase 0 + Phase 1 Validation Task Plan

## Task

- Task id: `local-machine-phase-0-1-validation`
- Branch: `codex/local-machine-phase-0-1-validation`
- Task kind: `validation`
- Module Run version: 2
- Date: 2026-06-19
- Goal: establish a recoverable local `dev` validation baseline for phase 0 environment readiness and phase 1 full local runtime validation.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-final-audit-gate-governance-packet.md`

## Scope

- Create and update only docs/state/evidence/audit files for this validation task.
- Use the existing local Docker `tiku-postgres` service bound to `127.0.0.1:5432`.
- Read `.env.local` only through approved local tooling for `DATABASE_URL`; never output, copy, modify, or commit `.env*`.
- Run existing migration, seed, validation data prep, lint, typecheck, unit, full Playwright E2E, build, and mechanism gates.

## Blocked Work

- No product source, test source, schema, migration file, script, dependency, or package/lockfile changes.
- No provider/model call, provider configuration, staging/prod/cloud/deploy, payment, external-service, PR, push, merge, force-push, destructive database operation, or Cost Calibration Gate execution.

## Execution Plan

1. Register the task in `task-queue.yaml` and set `project-state.yaml` current task to this validation task.
2. Record phase 0 baseline checks: Git state, tool versions, Docker status, E2E list, ignore rules, pgvector, table count, and Drizzle migration ledger.
3. Run phase 1 local validation: Docker up, `drizzle-kit migrate`, dev seed, validation data prep, lint, typecheck, unit tests, full E2E, build, and `git diff --check`.
4. Record post-validation DB checks for required tables and dev seed public-id counts with no raw rows.
5. Finalize evidence and audit review, run scoped Prettier write/check, mechanism closeout gates, then make one local commit.

## Evidence Rules

- Evidence records only command names, pass/fail, test counts, failure categories, local validation level, and blocked remainders.
- Evidence must not include `.env.local` contents, database URLs, credentials, secrets, tokens, Authorization headers, raw DB rows, cleartext `redeem_code`, full `paper` or `material` content, raw prompts, raw AI responses, provider payloads, screenshots, traces, or HTML reports.

## Success Criteria

- Git starts from a clean branch created from `master...origin/master`.
- Local Docker Postgres is healthy and pgvector is present.
- Local DB schema is migrated to the current tracked Drizzle migrations.
- Dev seed and validation data prep complete against local dev DB.
- `lint`, `typecheck`, `test:unit`, full `test:e2e`, `build`, `git diff --check`, scoped Prettier check, and mechanism gates pass.
- The task produces a local commit and leaves merge/push/PR blocked.

## Stop Conditions

- Any required command fails after the allowed E2E retry policy.
- Validation requires a blocked file change.
- Validation would need raw sensitive evidence.
- Any step requires provider/model calls, staging/prod/cloud/deploy, payment, external services, dependency changes, schema/migration file changes, destructive DB operations, or Cost Calibration Gate execution.
