# 2026-07-06 Queue Slimming Diagnostic Threshold Plan

## Scope

- Task ID: `queue-slimming-diagnostic-threshold-2026-07-06`
- Branch: `codex/queue-slimming-diagnostic-threshold-2026-07-06`
- Goal: make the queue slimming/self-repair diagnostic distinguish recovery-window candidates from actionable batch archive candidates, and avoid reporting closed tasks as metadata repair work.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.Smoke.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.Smoke.ps1`

## Plan

1. Add an explicit terminal batch archive threshold to the diagnostic output.
2. Keep recovery-window math visible, but defer archive candidates when terminal task count is at or below the batch threshold.
3. Skip metadata self-repair scans for terminal tasks; closed history should not appear as actionable metadata repair.
4. Surface the new threshold fields through `Get-TikuProjectStatus.ps1`.
5. Extend smoke coverage for below-threshold deferral and terminal-task metadata noise.
6. Validate smoke scripts, current diagnostics, formatting, lint/typecheck, and Module Run v2 gates.

## Boundaries

- No product source, schema, DB, Provider, env/secret, browser, staging/prod, deploy, payment, dependency, lockfile, or Cost Calibration execution.
- Diagnostic-only behavior; no queue mutation by scripts.
- No weakening of archive/index approval, evidence, redaction, or closeout gates.
