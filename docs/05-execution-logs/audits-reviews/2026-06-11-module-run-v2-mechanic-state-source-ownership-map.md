# Module Run V2 State Source Ownership Map Audit Review

Anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Finding

The mechanism already used durable files for recovery, but the ownership relationship between task queue, project state,
domain matrix, local transient ownership, evidence, audit review, and script outputs was not explicit enough.

## Change Review

- Added a `factOwnership` map to `mechanism-source-of-truth-index.yaml`.
- Updated automated advancement SOP so script output cannot become a second durable source for task state, current task,
  approvals, module closure, transient owner, or validation facts.

## Safety

Docs-only mechanism governance change. `Cost Calibration Gate remains blocked`.
