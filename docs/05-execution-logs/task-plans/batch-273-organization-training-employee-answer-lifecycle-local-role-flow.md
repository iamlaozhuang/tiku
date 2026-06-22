# Module Run v2 Seeded Task Plan: batch-273

## Task

- Task id: `batch-273-organization-training-employee-answer-lifecycle-local-role-flow`
- Module: `organization-training`
- Target closure: employee answer lifecycle local role flow.
- Seed source: `phase-72-advanced-organization-training-implementation-planning`
- localFullLoopGate: L6

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
- No dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, raw employee answer exposure, full paper content exposure, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing batch-182, batch-221, batch-241, and batch-253 evidence before touching source.
  - Confirm existing service, route, validator, and employee entry tests already cover visible-list, draft-save, submit, duplicate-submit blocking, and readonly-summary lifecycle.
  - Do not change source if current implementation already satisfies the task.
- Focused unit command:
  - `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.

## Reconcile Decision

- Decision: historical implementation reconcile only.
- Existing implementation surfaces:
  - `src/server/services/organization-training-service.ts`
  - `src/server/services/organization-training-route.ts`
  - `src/server/validators/organization-training.ts`
- Existing validation surfaces:
  - `src/server/services/organization-training-service.test.ts`
  - `src/server/services/organization-training-route.test.ts`
  - `src/server/validators/organization-training.test.ts`
  - `tests/unit/organization-training-employee-entry-surface.test.ts`
- Source changes planned: none.
