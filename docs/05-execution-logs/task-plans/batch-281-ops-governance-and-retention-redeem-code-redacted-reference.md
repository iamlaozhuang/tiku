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
  - Existing implementation satisfies the task; no source or test edits were required.
- Focused unit command:
  - `npm.cmd run test:unit -- src/server/services/ops-governance-redeem-code-redacted-reference-service.test.ts`
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.

## Closeout Notes

- Reconciled against historical evidence `batch-261-ops-governance-and-retention-redeem-code-redacted-reference`.
- Existing service returns only redacted reference/status fields and excludes plaintext `redeem_code`, code hash, public id inventory, provider payload, raw prompt, raw answer, and row data.
- No Provider/env/schema/database/dependency/browser/e2e/deploy/PR/force-push/destructive retention or Cost Calibration Gate work was performed.
