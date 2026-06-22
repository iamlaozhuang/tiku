# Module Run v2 Seeded Task Plan: batch-278

## Task

- Task id: `batch-278-organization-analytics-export-readiness-contracts-without-object-st`
- Module: `organization-analytics`
- Target closure: export readiness contracts without object storage or external delivery.
- Seed source: `phase-73-advanced-organization-analytics-implementation-planning`
- localFullLoopGate: L5

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No object storage, file generation, download delivery, export execution, or external-service integration.
- No Provider/model calls.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, data mutation, dev server, browser, Playwright/e2e, deploy, PR, force push, payment, org_auth runtime behavior change, raw employee answer exposure, full paper content exposure, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing organization-analytics contract, model, service, and route behavior before touching source.
  - Confirm export readiness is represented only as safe contract/readiness metadata and does not perform file delivery.
  - Do not change source if current implementation already satisfies the task.
- Reconcile decision:
  - Existing implementation already satisfies export readiness contracts without object storage or external delivery.
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
- Evidence boundary: record only local command names, pass/fail status, and redacted readiness-only contract notes.
- Blocked gates preserved: export execution/object storage/file generation/download delivery/external delivery plus Provider/env/schema/db/dependency/dev-server/browser/e2e/deploy/PR/force-push/org_auth runtime/Cost Calibration Gate.
