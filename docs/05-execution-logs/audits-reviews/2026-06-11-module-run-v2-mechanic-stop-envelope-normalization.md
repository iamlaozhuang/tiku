# 2026-06-11 Module Run V2 Stop Envelope Normalization Audit Review

## Review Focus

Verify that `seed_proposal_available` no longer presents as `hard_block`, while real hard blocks remain blocked. Verify runner terminal output includes machine-readable and human-readable stop envelope fields.

## Findings

- `seed_proposal_available` no longer falls through to `stopTaxonomy: hard_block`; it maps to `approval_missing` with `runnerSeverity: approval_required` in the no-standing-approval fixture.
- Runner terminal output now includes `runnerSeverity`, `requiresHuman`, `safeToProceed`, `nextCommand`, `stateWritten`, `noWriteReason`, `resumePointer`, and the three human-readable conclusion lines.
- Existing real hard blocks still return `runnerSeverity: hard_block`; current real repo PlanOnly run stops at `registration_mismatch` because local Codex automation TOML is paused.
- Task 1 intentionally does not apply standing approval automatically; that is Task 2.

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.
