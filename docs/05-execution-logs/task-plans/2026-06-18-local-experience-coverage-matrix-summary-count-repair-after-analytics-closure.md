# local-experience-coverage-matrix-summary-count-repair-after-analytics-closure Plan

## Scope

- Repair `currentFactRefresh.statusSummary` in `local-experience-coverage-matrix.yaml` after the analytics closure audit.
- Keep the change docs/state-only.
- Do not change product source, tests, runtime behavior, schemas, dependencies, or e2e specs.

## Read Context

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`

## Implementation

1. Count current coverage row statuses from the matrix body.
2. Update the summary values to match the body rows.
3. Record validation and close out as a docs/state consistency repair.

## Blocked Work

- Product source, tests, e2e specs, schema/migration, dependency/package/lockfile, `.env*`, provider/model,
  staging/prod/cloud/deploy/payment, external-service, destructive database operations, PR, force-push, and Cost
  Calibration Gate.
