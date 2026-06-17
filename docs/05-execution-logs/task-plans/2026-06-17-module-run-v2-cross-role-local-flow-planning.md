# Module Run v2 Cross-Role Local Flow Planning

## Task

- Task id: `module-run-v2-cross-role-local-flow-planning`
- Branch: `codex/cross-role-local-flow-planning`
- Date: 2026-06-17
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- Approval: current 2026-06-17 user prompt approves executing the previously recommended L6 local experience bridge planning task.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Previous L5 planning evidence: `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-planning.md`
- Blocked local full-flow evidence: `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- Playwright auth strategy evidence: `docs/05-execution-logs/evidence/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-cross-role-local-flow-planning.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-cross-role-local-flow-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-cross-role-local-flow-planning.md`

Read-only validation files:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- product source edits, route implementation, UI edits, new or edited e2e specs
- Browser, dev-server, Playwright execution, and full e2e suite execution in this planning task
- provider/model calls, provider configuration, quota/cost/Cost Calibration Gate
- staging/prod/cloud/deploy/payment/external-service
- PR and force push

## Implementation Plan

1. Record the current user prompt as `localExperienceAcceptanceBridgeApproved` for the L6 planning task only.
2. Reconcile the matrix L6 candidate with current local evidence, including the prior blocked validation and the later Playwright auth strategy alignment.
3. Inventory existing local role-flow and redaction validation surfaces by file path and focused unit coverage only.
4. Run focused unit validation for route guard, personal AI UI redaction, local browser experience, and request route contracts.
5. Update project state, active queue, evidence, and audit to close this docs-state planning task.
6. Recommend the next task as an explicitly scoped local-full-flow validation or smoke allowlist decision; do not claim L6 closure here.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
- `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-cross-role-local-flow-planning.md docs/05-execution-logs/evidence/2026-06-17-module-run-v2-cross-role-local-flow-planning.md docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-cross-role-local-flow-planning.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`

## Risk Controls

- This task does not execute Browser, dev server, Playwright, or e2e.
- It does not edit product source, tests, or e2e specs.
- Evidence records file names, command outcomes, counts, and planning decisions only.
- Role-based acceptance specs contain redaction-sensitive fixture concepts; do not copy raw payloads, identifiers, row data, or private values into evidence.
- Cost Calibration Gate remains blocked.
