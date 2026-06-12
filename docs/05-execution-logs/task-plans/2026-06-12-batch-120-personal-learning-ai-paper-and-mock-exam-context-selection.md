# Task Plan: batch-120-personal-learning-ai-paper-and-mock-exam-context-selection

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest execution evidence and audit reviews for phase-71, fix-phase-71, batch-119, and recent L5 e2e hardening.

## Goal

Expose the existing personal AI generation `paper` / `mock_exam` context selection as a flow-level anchor in the
batch-119 request flow. The selector remains the batch-111 local context contract; this task only composes it into the
request flow and expands focused coverage for the `mock_exam` branch.

## Scope

Allowed:

- `src/server/contracts/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- package or lockfile changes
- schema, migration, env, provider, deploy, payment, external-service, repository, route, UI, and formal content write paths
- new context selection algorithm or duplicate selector
- PR creation, force push, and Cost Calibration Gate execution

## Implementation Plan

1. Add focused RED coverage to `personal-ai-generation-request-flow-service.test.ts`:
   - accepted `paper` flow includes `contextSelection` and matches `request.generationContext.selectedContext`;
   - accepted `mock_exam` flow includes `contextSelection` and matches `request.generationContext.selectedContext`;
   - ambiguous `paperPublicId` + `mockExamPublicId` returns the flow-level `400015` error;
   - redaction remains intact.
2. Update `PersonalAiGenerationRequestFlowDto` to include `contextSelection: PersonalAiGenerationRequestContextDto`.
3. Update `buildPersonalAiGenerationRequestFlowReadModel()` to call `buildPersonalAiGenerationRequestContextReadModel()`
   and compose the returned DTO. If the context service rejects the input, return the existing flow-level invalid
   response.
4. Do not change `personal-ai-generation-request` model or validator unless the focused RED shows an existing defect.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -CandidateTaskId batch-120-personal-learning-ai-paper-and-mock-exam-context-selection`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-120-personal-learning-ai-paper-and-mock-exam-context-selection`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-120-personal-learning-ai-paper-and-mock-exam-context-selection`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-120-personal-learning-ai-paper-and-mock-exam-context-selection`

## Risk Controls

- Evidence records only public-id-shaped fixtures and command summaries.
- `contextSelection` is a flow-level DTO anchor, not a provider/runtime execution path.
- Playwright artifacts remain ignored under `playwright-report/` and `test-results/`.
- Cost Calibration Gate remains blocked.
