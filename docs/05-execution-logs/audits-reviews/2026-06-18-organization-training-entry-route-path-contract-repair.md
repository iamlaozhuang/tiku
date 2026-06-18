# Organization Training Entry Route Path Contract Repair Audit

## Findings

- BLOCKING: The route path collision is repaired, but the scoped local full-flow still fails at
  `POST /api/v1/organization-trainings` with response code `500001`.
- BLOCKING: The failing point is now downstream of route compilation and admin page authorization; it is in manual draft
  runtime persistence.
- BLOCKING: This repair task does not approve schema/drizzle/migration changes, database migration execution, API route
  changes, service changes, or repository changes, so the manual draft runtime blocker cannot be resolved here.

## Decision

Verdict: `BLOCKED`

The route path contract repair itself is covered by focused unit evidence. The organization-training local full-flow is
not closed and no `experience_closed` decision is supported.

## Scope Review

- Admin entry moved to `/content/organization-training`.
- Employee entry remains `/organization-training`.
- The e2e spec now navigates admin through `/content/organization-training` and authenticates through browser-context
  cookies to match the protected route guard.
- Cost Calibration Gate, schema/drizzle/migration work, provider/model calls, dependency changes, staging/prod/cloud,
  deploy, payment, external-service, PR, and force-push remain blocked.
