# Module Run v2 Autopilot Loop Hardening Plan

## Scope

- Task id: `module-run-v2-autopilot-loop-hardening`
- Branch: `codex/module-run-v2-autopilot-loop-hardening`
- Task kind: `mechanism_repair`

Implement the user-approved serial hardening plan for Module Run v2 automation. This task is mechanism-only and may edit
agent-system scripts, automation governance state/SOP files, and this task's plan/evidence/audit records.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Implementation Plan

1. Add automation registration readiness with active automation TOML consistency, single active root, identity-map, on-demand mechanic, and standing closeout prompt checks.
2. Wire registration readiness and `D:\tiku` posture diagnostics into startup readiness.
3. Add `stopTaxonomy` to startup, runner, finalizer, and closeout-related control surfaces.
4. Make runner/serial terminal paths finalize run registry when they own or stop after task work.
5. Generate seeded task evidence/audit templates with required anchors and make closeout readiness reject pending placeholders.
6. Add explicit `run_approved_closeout` dispatcher/runner action while keeping execution delegated to `Invoke-ModuleRunV2ApprovedCloseout.ps1`.
7. Document limited autopilot self-repair boundaries and stop taxonomy in schema/SOP/source-of-truth.
8. Run focused smokes and broad local gates, then close out through approved repository scripts.

## Risk Controls

- No product code changes.
- No dependency/package/lockfile changes.
- No env/secret/provider/DB/deploy/payment/PR/force-push/Cost Calibration Gate execution.
- All Git closeout actions must go through repository readiness and approved closeout scripts.
