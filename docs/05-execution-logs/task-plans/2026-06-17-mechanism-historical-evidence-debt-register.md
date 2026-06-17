# Mechanism Historical Evidence Debt Register

## Task

- Task id: `mechanism-historical-evidence-debt-register`
- Branch: `codex/mechanism-historical-evidence-debt-register`
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
- `Get-TikuNextAction.ps1 -VerboseHistory`: `missingHistoricalEvidence=5`, `legacyUnavailableEvidence=5`, no pending task, no seed candidate
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly`: idle

## Scope

Allowed files:

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/historical-evidence-debt.yaml`
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

1. Add a failing smoke fixture for `HistoricalEvidenceDebtPath`:
   - registered legacy-unavailable evidence should not count as unregistered missing evidence.
   - unregistered legacy-unavailable evidence should remain visible.
2. Add durable state file `docs/04-agent-system/state/historical-evidence-debt.yaml` with the five current legacy-unavailable task ids and redacted rationale.
3. Extend `Get-TikuNextAction.ps1` to:
   - accept optional `HistoricalEvidenceDebtPath`
   - read registered historical evidence debt ids
   - report `registeredLegacyUnavailableEvidence` and `unregisteredLegacyUnavailableEvidence`
   - make `missingHistoricalEvidence` mean unregistered missing historical evidence
4. Update source-of-truth index so the new debt register is discoverable.
5. Record task state, evidence, audit, validations, closeout, and cleanup.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-historical-evidence-debt-register`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId mechanism-historical-evidence-debt-register`

## Risk Controls

- Do not fabricate or backfill missing historical evidence.
- Do not mutate historical task facts except adding this current mechanism task record.
- The debt register records provenance debt only; it is not evidence and does not satisfy dependency evidence gates by itself.
- Evidence remains redacted and records command outcomes only.
- `Cost Calibration Gate` remains blocked.
