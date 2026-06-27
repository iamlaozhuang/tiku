# Layer 2 Business Closure Evidence Rollup Refresh After PostgreSQL Test-Owned Target Smoke Audit Review

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`

Decision: `APPROVE_DOCS_STATE_POSTGRES_REJECTED_ROLLUP_LAYER3_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Review Scope

Reviewed the docs/state-only refresh that maps the latest local PostgreSQL test-owned target setup plus one `rejected`
route/runtime smoke into the three-layer acceptance and Layer 2 business-closure matrix.

## Findings

No blocking findings for the docs/state-only rollup.

Residual risks and blocked work:

- The previous runtime evidence proves one synthetic test-owned `rejected` path only.
- It does not prove `approved` formal draft creation or formal `question`/`paper` write behavior.
- It does not prove credentialed browser observation, dev-server integration, or e2e behavior.
- It does not approve formal publish or student-visible runtime.
- Provider, Cost Calibration, staging/prod, deploy, payment, OCR/export, and external-service gates remain blocked.
- Release readiness and final Pass remain blocked.

## Acceptance Mapping Result

The rollup remains aligned with requirement SSOT:

- content-admin AI generated content stays isolated until governed review/adoption;
- a rejected reviewer decision can be counted as a lower-risk local PostgreSQL route/runtime proof;
- direct publish remains blocked and is not inferred from route success;
- Provider and cost gates remain separate under ADR-006 and the Cost Calibration blocked gate;
- evidence remains redacted to counts, status categories, role labels, and red-line confirmations.

## Security And Redaction Review

- No source, tests, e2e, schema, migration, package, lockfile, env, script, archive, or index file is changed.
- No browser, dev-server, e2e, Provider call, Cost Calibration, DB access, mutation, or `.env*` read is run by this
  task.
- No secret, token, Authorization header, cookie, localStorage value, Provider payload, raw prompt, raw generated
  content, DB row, DB URL, SQL output, full `paper`, full `material`, private answer text, screenshot, trace, page text
  dump, public identifier inventory, or plaintext `redeem_code` is recorded.

## Approval Boundary

APPROVE this docs/state-only rollup after final scoped validation remains green.

Do not treat this approval as browser/e2e, Provider, Cost Calibration, approved formal draft creation, formal publish,
student-visible runtime, staging/prod, deploy, payment, external-service, release readiness, or final Pass approval.
