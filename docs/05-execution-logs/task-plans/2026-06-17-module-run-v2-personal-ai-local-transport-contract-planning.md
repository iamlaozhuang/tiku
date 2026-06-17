# Module Run v2 Personal AI Local Transport Contract Planning

## Task

- Task id: `module-run-v2-personal-ai-local-transport-contract-planning`
- Branch: `codex/personal-ai-transport-contract-planning`
- Date: 2026-06-17
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- Approval: current 2026-06-17 user prompt approves executing the previously recommended `localExperienceAcceptanceBridgeApproved` next task.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Prior readiness package: `docs/05-execution-logs/evidence/2026-06-17-local-experience-acceptance-bridge-readiness.md`
- Historical L4 planning/implementation evidence for `batch-109` and `batch-123`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Read-only validation files:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/05-execution-logs/evidence/batch-109-personal-learning-ai-local-transport-contract-planning.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-123-personal-learning-ai-api-route-local-contract-bridge.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-123-personal-learning-ai-api-route-local-contract-bridge.md`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- product source edits, UI edits, e2e edits, Browser/dev-server validation
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push

## Implementation Plan

1. Record the current approval as `localExperienceAcceptanceBridgeApproved` for the candidate `module-run-v2-personal-ai-local-transport-contract-planning`.
2. Reconcile the matrix candidate with local reality: `batch-109` planned L4 and `batch-123` already implemented the API route/local contract bridge.
3. Run focused local unit validation for the current route-service contract without changing runtime code.
4. Update project state, active queue, evidence, and audit to close this docs-state planning/reconciliation task.
5. Recommend the next bridge step only if L4 remains satisfied locally: `local_ui_browser_entry` / L5 planning approval.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-transport-contract-planning`

## Risk Controls

- This task does not edit product runtime code because the L4 route bridge already exists in current source.
- Evidence must stay redacted and may report only command outcomes and contract status.
- If focused route-service validation fails, stop and report instead of editing runtime code in this task.
- If the next L5 bridge requires UI/browser/e2e, it must be a separate approval and task.
- Cost Calibration Gate remains blocked.
