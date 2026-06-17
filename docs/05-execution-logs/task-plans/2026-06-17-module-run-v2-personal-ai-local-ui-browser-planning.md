# Module Run v2 Personal AI Local UI Browser Planning

## Task

- Task id: `module-run-v2-personal-ai-local-ui-browser-planning`
- Branch: `codex/personal-ai-ui-browser-planning`
- Date: 2026-06-17
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- Approval: current 2026-06-17 user prompt approves executing the previously recommended L5 bridge planning task under mechanism rules.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Previous L4 evidence: `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-transport-contract-planning.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Read-only validation files:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- product source edits, route implementation, UI edits, new e2e edits
- Browser/dev-server/Playwright execution in this planning task
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push

## Implementation Plan

1. Record the current user prompt as `localExperienceAcceptanceBridgeApproved` for the L5 planning task only.
2. Reconcile the matrix candidate with current local source inventory without changing product source.
3. Run focused local unit validation for existing student personal AI UI and local browser experience service contracts.
4. Update project state, active queue, evidence, and audit to close this docs-state planning/reconciliation task.
5. Recommend the next bridge task as an explicitly scoped `local_full_flow` validation task only if planning and focused unit validation pass.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`

## Risk Controls

- This task does not claim L5 local browser closure; it only prepares the next explicit local full-flow validation step.
- Browser, dev server, and Playwright execution remain blocked here because this task does not materialize `localFullFlowGate: approved_localhost_only`.
- Evidence remains redacted and records only file inventory, command outcomes, and planning decisions.
- If focused unit validation fails, stop instead of editing product source in this task.
- A legacy `tests/unit/student-personal-ai-generation-ui.test.ts` check is not used as this task's closeout gate after it failed on visible identifier expectations that need a separate redaction-alignment task.
- Cost Calibration Gate remains blocked.
