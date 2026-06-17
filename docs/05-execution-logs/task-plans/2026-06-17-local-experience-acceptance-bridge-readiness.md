# Local Experience Acceptance Bridge Readiness

## Task

- Task id: `local-experience-acceptance-bridge-readiness`
- Branch: `codex/local-experience-acceptance-bridge-readiness`
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
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`

Baseline checks passed before this plan:

- `git switch master`
- `git fetch --prune origin`
- `git status --short --branch`
- `git rev-parse HEAD master origin/master`
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`

Diagnostics before this task:

- `Get-TikuProjectStatus.ps1`: `idle_no_pending_task`
- `Get-TikuNextAction.ps1 -VerboseHistory`: `no_pending_task`, `no_seed_candidate`
- `Get-ModuleRunV2ImplementationSeedProposal.ps1`: `no_seed_candidate`
- `Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly`: `idle`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Read-only source files for planning:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push
- business runtime, route, UI, e2e, schema, dependency, or provider changes

## Implementation Plan

1. Convert the matrix's `localExperienceClosureGate.acceptanceBridgePlan` into a concrete readiness and approval package.
2. Keep the package focused on `personal-learning-ai-experience` and the first bridge step: `local_api_or_server_action_contract`.
3. Record what a future approval must explicitly authorize and what remains blocked.
4. Do not create implementation seed tasks, do not modify the matrix, and do not touch runtime files.
5. Write redacted evidence and audit, then close the docs-state task with local validation, commit, fast-forward merge, push, and branch cleanup.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-experience-acceptance-bridge-readiness`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-experience-acceptance-bridge-readiness`

## Risk Controls

- This readiness package is not `localExperienceAcceptanceBridgeApproved`.
- This task does not approve API route, Server Action, repository, mapper, UI, Browser, Playwright, e2e, dev server, or role-flow implementation.
- Evidence remains redacted and records command outcomes and planning boundaries only.
- `Cost Calibration Gate` remains blocked.
