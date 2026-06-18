# organization-analytics-admin-visible-scope-local-fixture-contract-repair

## Scope

- Repair the local organization analytics seed/fixture contract so the local admin can load aggregate analytics for the
  visible seed organization.
- Keep the runtime route `/content/organization-analytics` and API contract unchanged unless a focused test proves an e2e
  selection contract bug.
- Rerun the scoped analytics local full-flow after the local fixture repair.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-organization-analytics-summary-local-full-flow-validation.md`
- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/organization-analytics-local-flow.spec.ts`
- `src/server/services/organization-analytics-route.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/organization-training.ts`

## TDD Plan

1. RED: add a dev seed unit assertion proving the analytics local seed contains a visible admin organization, an employee,
   an active org auth, a published organization training version, and a submitted organization training answer for the
   seed organization.
2. GREEN: add the minimal deterministic local seed dataset and idempotent inserts needed by the analytics repository.
3. Validate with `src/db/dev-seed.test.ts`, analytics route unit coverage, local seed capability/seed script, e2e list,
   and the scoped analytics local full-flow.
4. If the full-flow passes, update coverage matrix and seed the closure readiness audit.

## Blocked Work

- `.env*` changes or secret output.
- Schema/drizzle/migration changes.
- Dependency/package/lockfile changes.
- Provider/model, staging/prod/cloud/deploy/payment/external-service work.
- Destructive database operations.
- PR or force-push.
- Cost Calibration Gate.

## Risk Notes

- The existing `403185` response is intentionally ambiguous: it covers access denial and missing aggregate training
  metrics. This repair focuses on local seed completeness instead of changing the production access contract.
- Evidence must not contain raw database rows, database URLs, secrets, tokens, or public ID inventories.
