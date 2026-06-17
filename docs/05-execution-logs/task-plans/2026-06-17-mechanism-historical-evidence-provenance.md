# Mechanism Historical Evidence Provenance Diagnostics

## Task

- Task id: `mechanism-historical-evidence-provenance-diagnostics`
- Branch: `codex/mechanism-historical-evidence-provenance`
- Date: 2026-06-17
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- User approval: current 2026-06-17 prompt approved executing the recommended next mechanism task under project rules.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

Baseline checks passed before this plan:

- `git switch master`
- `git fetch --prune origin`
- `git status --short --branch`
- `git rev-parse HEAD master origin/master`
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`

Diagnostics before this task:

- `Get-TikuProjectStatus.ps1`: `idle_no_pending_task`
- `Get-TikuNextAction.ps1 -VerboseHistory`: no ready task, no seed candidate, `historicalEvidenceFindings: missingHistoricalEvidence=6`
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly`: idle, no executable task or seed candidate

## Scope

Allowed files:

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push
- business runtime, route, UI, schema, dependency, or provider changes

## Implementation Plan

1. Add a failing smoke fixture that covers evidence provenance categories:
   - direct evidence exists
   - closure evidence exists when original `evidencePath` is gone
   - archive evidence exists through `execution-log-index.yaml`
   - legacy unavailable evidence remains unresolved
2. Extend `Get-TikuNextAction.ps1` to:
   - read an optional `ExecutionLogIndexPath`
   - consider direct evidence, closure evidence, and archived evidence as provenance-backed
   - keep unresolved historical evidence visible as `legacyUnavailableEvidence`
   - avoid claiming current task blockers when only historical provenance debt remains
3. Update durable task state for this mechanism task.
4. Record redacted evidence and audit.
5. Run scoped smoke, diagnostics, formatting, lint, typecheck, diff check, and closeout gates.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-historical-evidence-provenance-diagnostics`

## Risk Controls

- Do not fabricate missing early evidence.
- Do not rewrite old task facts except adding the current mechanism task record.
- Evidence remains redacted and records command outcomes only.
- `Cost Calibration Gate` remains blocked.
