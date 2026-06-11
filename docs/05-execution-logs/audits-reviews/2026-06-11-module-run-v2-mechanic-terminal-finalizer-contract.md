# Module Run V2 Terminal Finalizer Contract Audit Review

Anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Finding

The previous finalizer wrote durable stop state, but it did not persist the normalized runner envelope fields needed for
clear stop closeout and recovery.

## Change Review

- Added `severity`, `requiresHuman`, `nextCommand`, `riskIfAutoContinued`, `stateWritten`, `noWriteReason`, and
  `resumePointer` to the finalizer output and registry payload.
- Preserved `stopTaxonomy` and `nextRecommendedAction` for compatibility.
- Added smoke coverage for idle no-write exits so PlanOnly or diagnostic terminal paths can avoid meaningless state
  writes while still leaving a clear resume pointer.

## Backlog Impact

This task completes the finalizer contract portion of the repair chain. Runner terminal paths still rely on their
existing stdout envelope until later tasks add stop economics metrics.

`Cost Calibration Gate remains blocked`.
