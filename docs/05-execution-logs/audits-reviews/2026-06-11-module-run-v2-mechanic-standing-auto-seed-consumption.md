# 2026-06-11 Module Run V2 Standing Auto-Seed Consumption Audit Review

## Review Focus

Verify that standing approval is consumed only for low-risk local implementation auto-seeding, never in PlanOnly mode, and never for high-risk gates.

## Findings

- Runner now resolves a canonical `standingUnattendedLocalCloseoutApproval` statement from `project-state.yaml` when the durable approval is present and contains the required safety anchors.
- Non-PlanOnly runner can apply auto-seed without explicit `-AllowAutoSeed` when standing approval is available.
- PlanOnly remains read-only and emits `runnerSeverity: auto_recoverable` plus `nextCommand`.
- Auto-seed remains bounded: after seed transaction and self-review, runner stops at `closeout_auto_seed_transaction` and does not claim seeded tasks.

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.
