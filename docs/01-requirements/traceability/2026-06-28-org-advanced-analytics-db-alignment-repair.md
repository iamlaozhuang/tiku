# Org Advanced Analytics DB Alignment Repair Traceability

## Scope

- Role: `org_advanced_admin`
- Route/workflow: `/organization/organization-analytics`
- Checklist row: `org_advanced_admin.organization_analytics`
- Durable goal: full acceptance matrix plus full unit baseline repair remains incomplete.

## Requirement Linkage

- Mandatory owner-facing checklist:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Prior diagnostic evidence:
  `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`

## Acceptance Requirement

The organization analytics page must load its runtime summary for the test-owned `org_advanced_admin` local acceptance
context without showing the summary load failure caused by the missing organization training analytics source schema/data.

## Coverage Result

- Requirement row: `org_advanced_admin.organization_analytics`
- Repair result: pass for scoped local runtime summary load.
- Evidence path: `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`
- Remaining durable-goal status: incomplete until every full acceptance matrix row is covered and full unit baseline is
  green.

## Repair Boundary

This task may repair only the local runtime support needed by organization analytics: source/schema/migration/test-owned
seed fixture alignment and directly relevant tests. It may not claim full matrix completion, final Pass, release
readiness, Cost Calibration, or Provider readiness.

## Evidence Rule

Coverage evidence must be redacted to role/route/status/count/failure-class/test-count/commit summaries only.
