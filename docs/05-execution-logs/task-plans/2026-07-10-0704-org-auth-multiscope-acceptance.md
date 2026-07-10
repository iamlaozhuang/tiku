# 2026-07-10 0704 Org Auth Multiscope Acceptance Plan

## Task

- Task id: `0704-org-auth-multiscope-acceptance-2026-07-10`
- Branch: `codex/0704-org-auth-multiscope-acceptance`
- Mode: validation-only until a real product gap is confirmed.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`

## Validation Scope

Verify whether the operations enterprise authorization flow can:

- select multiple `profession`, `level`, `subject`, and `edition` values in one guided package;
- preview expanded atomic scope rows before submit;
- submit a backend contract that can atomize those scopes and block overlapping active scopes;
- keep employee capability decisions derived from valid `org_auth` and `effectiveEdition`, not account labels or stale UI.

## Stop Rule

If source or localhost validation proves the guided multi-scope UI or atomized backend contract is missing, stop this
validation task, record redacted evidence, and open the separate repair task
`0704-org-auth-multiscope-ui-fix-2026-07-10` before continuing the serial queue.

## Boundaries

- No source, test, package, lockfile, schema, migration, seed, DB, Provider, staging, prod, deploy, env, secret, payment,
  external service, or Cost Calibration changes in this validation task.
- Private credentials may be used only in memory for redacted readiness preflight.
- Evidence records only role labels, route labels, status categories, command results, and test counts.
- No screenshots, raw DOM, raw DB rows, internal numeric ids, credentials, sessions, tokens, raw prompt, raw AI output, or
  full content are recorded.

## Planned Verification

1. Confirm branch and clean baseline.
2. Run redacted private readiness preflight for the 0704 role catalog.
3. Inspect organization authorization requirements and implementation contracts.
4. Inspect operations UI surface for the enterprise authorization workflow.
5. Run targeted existing tests around organization authorization and operations UI.
6. If a product gap is confirmed, write redacted evidence and adversarial review, then close this branch as a repair
   gate.
