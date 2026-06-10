# Module Run v2 Standing Unattended Local Closeout Approval Plan

## Task

- taskId: `module-run-v2-standing-unattended-local-closeout-approval`
- branch: `codex/standing-unattended-closeout-policy`
- taskKind: `mechanism_repair`
- approval: `standingUnattendedLocalCloseoutApproval`

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- latest automation memory and batch-104 closeout evidence summary

## Implementation Plan

1. Record the user's standing approval in durable repository state.
2. Update the durable autodrive schema and SOP to define the exact scope.
3. Update auto-seed generation so approved closeoutPolicy is generated only when the seed approval statement includes both `autoDriveLocalImplementationApproval` and `standingUnattendedLocalCloseoutApproval`.
4. Update seed self-review to hard-block approved closeoutPolicy when the standing approval anchor is missing.
5. Add smoke coverage for legacy non-standing seed behavior, standing closeout materialization, and unauthorized closeout rejection.
6. Record evidence and audit review before any completion claim.

## Risk Defenses

- No product source, dependency, lockfile, schema, env, provider, deploy, payment, PR, force-push, or Cost Calibration Gate action.
- This mechanism task does not self-authorize merge or push.
- Standing closeout applies only to low-risk auto-seeded `taskKind: implementation` tasks after all readiness, validation, pre-push, scope, lease, registry, hygiene, and remote-divergence gates pass.
- High-risk capability gates remain blocked unless separately approved.
