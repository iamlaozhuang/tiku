# Module Run V2 Stop Economics Metrics Audit Review

Anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Finding

The mechanism now classifies stops more precisely, but it lacked a repeatable way to quantify false stop candidates,
hard blocks, approval reuse candidates, and handoff completeness over time.

## Change Review

- Added a read-only stop economics summarizer.
- Smoke coverage validates run registry and terminal envelope inputs.
- Metrics use the normalized terminal fields added earlier: `severity`, `stopTaxonomy`, `requiresHuman`,
  `safeToProceed`, `nextCommand`, `stateWritten`, `noWriteReason`, `resumePointer`, and optional runner step count.
- Registered the summarizer in `mechanism-source-of-truth-index.yaml` as a derived summary.

## Safety

No durable state is mutated by the summarizer. `Cost Calibration Gate remains blocked`.
