# Security Local Session Marker Bearer Boundary Repair Acceptance

## Acceptance Criteria

- The current marker-to-bearer boundary issue is reproduced before repair using a focused local unit test.
- The cookie-backed marker is treated as no bearer token by student runtime storage readback.
- Legitimate local automation token readback remains accepted.
- Existing login UI behavior remains covered by the focused unit file.
- No DB, Provider/AI, browser/e2e, dependency, env/secret, staging/prod/cloud/deploy, release readiness, final Pass, or
  Cost Calibration work is executed.
- Validation evidence is written with redacted summaries only.

## Acceptance Status

- Reproduction before repair: pass.
- Focused unit after repair: pass.
- Focused lint: pass.
- Typecheck: pass.
- Full closeout validation: pass after focused unit, lint, typecheck, scoped formatting, diff checks, blocked-path diff,
  and Module Run v2 pre-commit, closeout, and pre-push readiness gates.

## Boundary Status

- releaseReadinessClaimed: false
- finalPassClaimed: false
- costCalibrationExecuted: false
