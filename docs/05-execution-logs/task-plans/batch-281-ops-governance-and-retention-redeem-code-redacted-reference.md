# Module Run v2 Seeded Task Plan: batch-281

## Task

- Task id: `batch-281-ops-governance-and-retention-redeem-code-redacted-reference`
- Module: `ops-governance-and-retention`
- Target closure: redeem_code redacted reference.
- Seed source: `phase-75-advanced-retention-log-governance-implementation-planning`
- localFullLoopGate: L6

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No plaintext redeem_code exposure.
- No Provider/model calls.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, data mutation, destructive retention/recovery/purge operation, dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, raw prompt/provider payload/raw generated content/raw answer exposure, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing redeem_code redaction contracts and focused tests before touching source.
  - Confirm outputs expose only redacted references and never plaintext redeem_code values.
  - Do not change source if current implementation already satisfies the task.
- Focused unit command:
  - Replace the placeholder with an explicit scoped unit command before task closeout.
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.
