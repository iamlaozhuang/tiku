# mechanism-docs-queue-slimming-and-self-repair

## Scope

Implement queue slimming/self-repair v1 as a read-only mechanism diagnostic. It must quantify active queue terminal
archive candidates, safe task-packet metadata repair candidates, and high-risk blocked repair candidates without mutating
queue state.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Existing project status and common helper scripts.

## Implementation Plan

1. Add `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` plus smoke coverage.
2. Report active queue task counts, terminal recovery window, archive candidates, safe metadata repair candidates, and
   high-risk blocked repair candidates.
3. Keep v1 diagnostic-only; do not move queue history or apply repairs.
4. Surface the summary in `Get-TikuProjectStatus.ps1`.
5. Update operating manual, tuning SOP, source-of-truth index, queue state, evidence, and audit.

## Risk Controls

- No product source, e2e spec, schema, dependency, provider/model, `.env*`, deploy/cloud/payment/external-service, PR,
  force-push, destructive DB, or Cost Calibration Gate work.
- No automatic archive movement in v1.
- No automatic task packet mutation in v1.
- High-risk repair candidates are reported as blocked, not repaired.
