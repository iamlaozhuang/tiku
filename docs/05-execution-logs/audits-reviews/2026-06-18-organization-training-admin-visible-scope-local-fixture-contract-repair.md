# Audit Review: organization-training-admin-visible-scope-local-fixture-contract-repair

- Task id: `organization-training-admin-visible-scope-local-fixture-contract-repair`
- Date: `2026-06-18`
- Status: `blocked_validation_failure`

## Scope Review

Implemented the approved local fixture/e2e contract repair:

- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- docs/state/evidence/audit files

No `.env*`, package/lockfile, schema/drizzle/migration, provider/model, staging/prod/cloud/deploy/payment,
external-service, PR, force-push, destructive database operation, or Cost Calibration Gate work was performed.

## Findings

- The previous admin visible scope blocker was repaired locally: the seed admin now has a deterministic
  `admin_organization` fixture relation.
- The e2e no longer depends on the arbitrary first organization returned by the organization list API.
- The scoped full-flow now advances past manual draft creation and fails later at admin source-context UI rendering.
- Source inspection indicates a response-key mismatch: source-context route success data uses `context`, while the admin
  UI attempts to read `attachment`.

## Decision

Do not claim `experience_closed`.

Seed fixture repair is complete, but the local full-flow is still blocked by a newly exposed UI response mapping issue.
Open the next narrow repair task for `organization-training-admin-source-context-ui-response-key-contract-repair`.

Cost Calibration Gate remains blocked.

## Risk Review

- Authorization boundary unchanged; no fail-open visible scope behavior was introduced.
- The fixture uses the existing `admin_organization` trusted source instead of inferring visibility from request body.
- Local DB write was idempotent and non-destructive.
- Module Run v2 pre-commit hardening is not green because the touched dev seed fixture surface contains local
  deterministic credential field names that the sensitive evidence scan flags as `secret_assignment`.
- Module closeout readiness is not green because the scoped full-flow remains blocked.
- Pre-push readiness passed.
- Evidence was redacted and does not include secrets, tokens, database URLs, row data, public ID lists, or private
  payloads.
