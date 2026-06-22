# Module Run v2 Seeded Task Plan: batch-282

## Task

- Task id: `batch-282-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`
- Module: `ops-governance-and-retention`
- Target closure: audit_log and ai_call_log retention and redaction contracts.
- Seed source: `phase-75-advanced-retention-log-governance-implementation-planning`
- localFullLoopGate: L6

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No raw audit_log or ai_call_log payload exposure.
- No actual retention deletion, recovery, purge, or destructive data operation.
- No Provider/model calls or raw prompt/provider payload/raw generated content exposure.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, data mutation, dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, plaintext redeem_code, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing ops-governance log retention/redaction contracts and focused tests before touching source.
  - Confirm retention behavior is represented as contract metadata only and does not delete, purge, recover, or expose raw log payloads.
  - Existing implementation satisfies the task; no source or test edits were required.
- Focused unit command:
  - `npm.cmd run test:unit -- src/server/services/ops-governance-log-retention-redaction-contracts-service.test.ts`
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.

## Closeout Notes

- Reconciled against historical evidence `batch-262-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`.
- Existing service emits local contract metadata for retention days, redacted audit/AI call log references, blocked raw viewers, blocked hard delete, and blocked Cost Calibration Gate.
- No raw `audit_log` or `ai_call_log` rows, provider payloads, prompts, row data, destructive retention/recovery/purge operations, schema/database work, dependency changes, or external services were touched.
