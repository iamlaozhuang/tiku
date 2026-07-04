# Full Chain Isolated DB Bootstrap Seed Execution Plan

Task id: `full-chain-isolated-db-bootstrap-seed-execution-2026-07-04`

Status: in progress.

## Approval Boundary

The approved scope is local-only:

- create or select DB target `tiku_full_chain_acceptance_20260704_001`;
- apply existing reviewed migrations only to an empty isolated target;
- seed only selector `fc_bootstrap_super_admin`;
- record redacted aggregate verification.

This task must not create `ops_admin`, `content_admin`, organization tree, `org_auth`, organization admins, employees,
`redeem_code`, content, paper, learning, training, analytics, AI rows, browser/e2e state, Provider state, staging/prod
state, Cost Calibration, release readiness, final Pass, or production usability claims.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `compose.yaml`
- `drizzle.config.ts`
- `drizzle/**`
- `src/db/schema/auth.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/repositories/runtime-database.ts`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`

## Execution Steps

1. Confirm branch and materialize task/state/queue boundaries before DB mutation.
2. Confirm local Docker PostgreSQL service health and target DB existence by redacted status only.
3. Create the target DB only if absent; if it exists with user tables or bootstrap/scope rows outside this selector,
   stop.
4. Apply existing reviewed migrations through the project migration mechanism with process-local target injection and no
   `.env*` output.
5. Create or reuse a private bootstrap credential file outside the repository.
6. Seed auth-compatible `auth_user`, `auth_account`, and `admin` rows for `fc_bootstrap_super_admin` only.
7. Verify aggregate counts: target exists, migrations applied, bootstrap selector count is exactly one per expected table
   family, and forbidden scenario-output families remain zero.
8. Write redacted evidence and adversarial audit, then run scoped governance validation and commit locally.

## Redaction Rules

Evidence may record task ids, file paths, selector labels, table-family labels, counts, command labels, and pass/fail/block
status only. It must not record connection strings, env values, raw DB rows, internal numeric ids, phone, email,
credential values, hashes, session/token/cookie values, plaintext card values, provider payloads, prompts, raw AI I/O, or
full material/question/paper content.

## Stop Rules

- Stop if the target label is not exactly `tiku_full_chain_acceptance_20260704_001`.
- Stop if the target exists and is not empty before migration.
- Stop if migration requires `drizzle-kit push`, schema file changes, or migration file changes.
- Stop if seeding requires any scenario output beyond `fc_bootstrap_super_admin`.
- Stop if verification shows any forbidden scenario-output family was created.
- Stop if evidence cannot be redacted.

Cost Calibration Gate remains blocked.
