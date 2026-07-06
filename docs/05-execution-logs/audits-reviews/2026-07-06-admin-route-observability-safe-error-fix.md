# 2026-07-06 Admin Route Observability Safe Error Fix Audit

## Result

Status: pass for the approved fix scope.

The route keeps `409015`, preserves no task/result persistence for rejected generated content, and now returns only a mapped safe rejection reason plus redacted runtime booleans. The frontend consumes that safe DTO to show clearer no-Provider / Provider-unavailable wording without exposing internal payloads or raw Provider details.

## Findings

1. The fix addresses the proven root cause.
   The static `409015` response no longer discards all runtime bridge context; it includes a redacted mapped reason only when the draft acceptability gate rejects the output.

2. No-persistence behavior remains protected.
   Focused tests cover provider-disabled, missing credential, insufficient grounding, and structured-preview rejection paths and assert no task/result persistence.

3. The external API still uses the existing business error code.
   `409015` remains the route-level rejection code; the new data object is diagnostic and redacted.

4. The frontend does not display raw internal failure categories.
   UI mapping is guarded by `redactionStatus:redacted` and known safe reason values; the added UI test verifies no raw internal failure label or Provider payload/prompt/output labels are rendered.

5. The fix does not broaden execution boundaries.
   No dependency, DB, Provider, staging/prod, deploy, browser runtime, or Cost Calibration action was executed.

## Residual Risk

- Browser role-matrix acceptance was not rerun in this fix task.
- DB-backed runtime acceptance was not rerun in this fix task.
- Provider-enabled small sample was not rerun in this fix task.
- This is not a release-readiness or production-usability claim.

## Closeout Boundary

- Local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of merged short branches are approved by the current user for this task.
- The unrelated local branch `codex/stage-b-test-owned-account-db-target-alignment-2026-07-03` is not part of this closeout scope.
