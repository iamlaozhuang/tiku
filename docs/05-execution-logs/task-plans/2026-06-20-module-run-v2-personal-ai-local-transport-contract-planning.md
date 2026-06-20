# Task Plan: module-run-v2-personal-ai-local-transport-contract-planning

## Task

- Task id: `module-run-v2-personal-ai-local-transport-contract-planning`
- Branch: `codex/personal-ai-local-transport-bridge-approval`
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- Approval: current 2026-06-20 user prompt approves processing this local experience bridge proposal.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-module-run-v2-personal-ai-local-transport-contract-planning.md`
- `docs/05-execution-logs/evidence/2026-06-20-module-run-v2-personal-ai-local-transport-contract-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-module-run-v2-personal-ai-local-transport-contract-planning.md`

Read-only validation files:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- historical L4 evidence from 2026-06-12 and 2026-06-17
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/**`, `e2e/**`, `tests/**`, `scripts/**`
- `src/db/schema/**`, `drizzle/**`, migrations
- product source edits, UI/browser/e2e work, Browser/dev-server validation
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push

## Plan

1. Record the current approval as `localExperienceAcceptanceBridgeApproved` for the L4 candidate only.
2. Reconcile active queue state with historical reality: L4 planning and implementation evidence already exists, but
   the active queue no longer contains the candidate because of queue slimming.
3. Run focused local route-service unit validation without changing runtime code.
4. Record redacted evidence and audit, then close this task so bridge proposal diagnostics can advance to the next
   candidate.
5. Recommend the next bridge step only: `module-run-v2-personal-ai-local-ui-browser-planning`, pending separate fresh
   approval.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`

## Risk Controls

- This task is docs-state plus read-only focused validation. It must not edit product runtime code.
- Evidence records only command outcomes and contract status.
- If focused route-service validation fails, stop and report instead of repairing runtime code in this task.
- Cost Calibration Gate remains blocked.
