# Module Run V2 Diagnostic Noise Budget Audit Review

Anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Finding

Next-action diagnostics exposed legacy history and evidence first-item lists by default, which made normal runnable
states look noisier than necessary.

## Change Review

- Added `-VerboseHistory`.
- Default output keeps counts and `notBlockingCurrentRun`.
- Verbose output keeps `legacy_done_first`, `evidenceMissingFirst`, and `queueMatrixDriftFirst`.
- Hard-block and blocked-gate output stays visible by default.

## Safety

The change is read-only diagnostic formatting. `Cost Calibration Gate remains blocked`.
