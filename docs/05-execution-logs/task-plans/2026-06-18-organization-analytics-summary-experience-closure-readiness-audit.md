# organization-analytics-summary-experience-closure-readiness-audit Plan

## Scope

- Decide whether `UC-ADV-ORG-ANALYTICS-SUMMARY` can move from `local_experience_ready` to `experience_closed` for local
  experience only.
- Use fresh passing evidence from `organization-analytics-admin-visible-scope-local-fixture-contract-repair`.
- Update only docs/state/task queue/evidence/audit files.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-organization-analytics-admin-visible-scope-local-fixture-contract-repair.md`
- `src/app/(admin)/content/organization-analytics/page.tsx`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `e2e/organization-analytics-local-flow.spec.ts`

## Audit Steps

1. Confirm fresh local full-flow evidence exists for the admin organization analytics entry.
2. Confirm the evidence includes route/API envelope, camelCase JSON, internal ID redaction, and sensitive text checks.
3. Confirm remaining release, staging/prod, provider/model, payment, dependency, schema/migration, PR, force-push, and
   Cost Calibration gates stay blocked.
4. Update coverage matrix and project state only if all local closure conditions are met.

## Blocked Work

- Product source changes.
- Browser/Playwright runtime validation or dev server.
- Full e2e suite.
- `.env*`, schema/drizzle/migration, dependency/package/lockfile, provider/model, staging/prod/cloud/deploy/payment,
  external-service, destructive database operation, PR, force-push, and Cost Calibration Gate.
