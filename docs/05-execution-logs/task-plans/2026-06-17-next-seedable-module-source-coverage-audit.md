# Next Seedable Module Source Coverage Audit

## Task

- Task id: `next-seedable-module-source-coverage-audit`
- Branch: `codex/next-seedable-module-source-coverage-audit`
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

Read-only source files for audit:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push
- business runtime, route, UI, schema, dependency, or provider changes

## Implementation Plan

1. Audit the seed proposal source path:
   - matrix execution modules
   - source planning task mapping
   - completion detection logic in seed proposal script
   - current task queue/history coverage
2. Record why `no_seed_candidate` is currently correct or identify a narrow mechanism follow-up if source coverage is incomplete.
3. Write redacted evidence and audit review. Do not list private data, row data, publicId inventories, raw prompts, raw answers, provider payloads, secrets, or environment values.
4. Close the docs-state task with local validation, commit, fast-forward merge, push, and branch cleanup.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId next-seedable-module-source-coverage-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId next-seedable-module-source-coverage-audit`

## Risk Controls

- Do not seed new implementation tasks in this audit.
- Do not broaden the matrix or change seed proposal logic.
- Do not claim product implementation readiness from source coverage alone.
- Keep all evidence redacted and command-result focused.
- `Cost Calibration Gate` remains blocked.
