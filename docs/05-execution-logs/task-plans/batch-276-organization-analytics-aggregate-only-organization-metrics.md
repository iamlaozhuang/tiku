# Module Run v2 Seeded Task Plan: batch-276

## Task

- Task id: `batch-276-organization-analytics-aggregate-only-organization-metrics`
- Module: `organization-analytics`
- Target closure: aggregate-only organization metrics.
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
- No dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, raw employee answer exposure, full paper content exposure, export delivery, object storage, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing organization-analytics model, contract, validator, service, and route tests before touching source.
  - Confirm aggregate metrics stay organization-level only and do not expose employee answer payloads.
  - Do not change source if current implementation already satisfies the task.
- Focused unit command:
  - `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/services/organization-analytics-service.test.ts src/server/services/organization-analytics-route.test.ts src/server/validators/organization-analytics.test.ts`
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.
