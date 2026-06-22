# Module Run v2 Seeded Task Plan: batch-279

## Task

- Task id: `batch-279-organization-analytics-audit-log-redacted-reference`
- Module: `organization-analytics`
- Target closure: audit_log redacted reference.
- Seed source: `phase-73-advanced-organization-analytics-implementation-planning`
- localFullLoopGate: L5

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No Provider/model calls.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, or data mutation.
- No raw audit row exposure, raw employee answer exposure, full paper content exposure, dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, object storage, external delivery, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing organization-analytics service, route, validator, model, and contract evidence before touching source.
  - Confirm audit_log references remain redacted metadata only.
  - Do not change source if current implementation already satisfies the task.
- Reconcile decision:
  - Existing implementation already satisfies audit_log redacted reference.
  - Close out as historical implementation reconcile with no source or test edits.
  - Use focused unit coverage across model, contract, validator, service, route, and admin entry surface tests.
- Focused unit command:
  - `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/validators/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts`
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.

## Closeout Notes

- Source decision: no runtime/source/test edit required.
- Evidence boundary: record only local command names, pass/fail status, and redacted audit reference contract notes.
- Blocked gates preserved: raw audit rows/source rows/scope organization lists/internal identifiers plus Provider/env/schema/db/dependency/dev-server/browser/e2e/deploy/PR/force-push/external-service/org_auth runtime/object storage/external delivery/Cost Calibration Gate.
