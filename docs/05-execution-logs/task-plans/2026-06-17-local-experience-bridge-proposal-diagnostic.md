# Local Experience Bridge Proposal Diagnostic Plan

## Task

- id: `local-experience-bridge-proposal-diagnostic`
- branch: `codex/local-experience-bridge-proposal-diagnostic`
- profile: `mechanism_low_risk`
- evidence mode: `lite`
- validation policy: `docs_state`

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`

## Root Cause

Current diagnostics correctly return `no_seed_candidate` because the six execution modules in
`advanced-edition-domain-module-run-matrix.yaml` have terminal target-closure coverage. The remaining friction is that
the default status and next-action diagnostics do not surface the matrix's `localExperienceClosureGate.acceptanceBridgePlan`
as a next approvable local-only bridge candidate after implementation seed exhaustion.

## Scope

Allowed files:

- `scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.Smoke.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-local-experience-bridge-proposal-diagnostic.md`
- `docs/05-execution-logs/evidence/2026-06-17-local-experience-bridge-proposal-diagnostic.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-local-experience-bridge-proposal-diagnostic.md`

Blocked files and actions:

- `.env*`
- secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers, public
  identifier inventories, row data, or private data in evidence
- product source, route, UI, schema, drizzle, migrations, package, lockfile, dependency changes
- provider/model calls
- staging/prod/cloud/deploy/payment/external-service access
- PR, force-push, Cost Calibration Gate

## TDD Plan

1. RED: add a smoke fixture proving that when implementation seed returns no candidate and the first two
   acceptance-bridge candidates are already terminal, the bridge proposal diagnostic reports
   `module-run-v2-cross-role-local-flow-planning` with `localExperienceAcceptanceBridgeApproved`.
2. GREEN: add the smallest read-only bridge proposal diagnostic and wire it into `Get-TikuNextAction.ps1` and
   `Get-TikuProjectStatus.ps1`.
3. Verify existing implementation seed proposal behavior remains unchanged.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-experience-bridge-proposal-diagnostic`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-experience-bridge-proposal-diagnostic`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-experience-bridge-proposal-diagnostic`
