# Task Plan: batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent evidence and audit reviews for phase-71, batch-119, and batch-120.
- Existing personal AI generation request, request-flow, context-selection, and result-reference services.

## Goal

Add a server-side local browser experience read-model for the personal AI generation request flow. The read-model is a
contract/service anchor for future local UI consumption only; it does not create or modify actual UI, e2e specs, routes,
provider execution, persistence, schema, or formal generated content write paths.

## Scope

Allowed:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- `src/app/**`, `src/features/**`, UI components, and `e2e/**`
- package or lockfile changes
- schema, migration, env, provider, deploy, payment, external-service, repository, and formal content write paths
- raw prompt, raw generated content, provider payload, secret, token, plaintext `redeem_code`, full `paper` content, or numeric id exposure
- PR creation, force push, and Cost Calibration Gate execution

## Implementation Plan

1. Add focused RED unit coverage for a local browser experience service in `src/server/services/**`.
2. Introduce a small model/contract/service anchor that composes the existing `PersonalAiGenerationRequestFlowDto`:
   - request state: ready or blocked;
   - result state: blocked or current local task status;
   - supported local browser states: loading, empty, error, permission blocked;
   - summary-only, redacted result reference data.
3. Reuse the existing request-flow service as the only source for request, context, task policy, and result-reference
   mapping. If the request flow is invalid, preserve the existing standard error envelope.
4. Keep the output local-only and redacted, with public ids only and optional values represented as `null`.
5. Update docs/state/evidence/audit for this task only.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -CandidateTaskId batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`

## Risk Controls

- No UI/e2e edits because batch-121 allowed files do not include those surfaces.
- No e2e execution because the task does not declare `localE2EValidation` and does not touch student UI or e2e files.
- The service is a local contract/read-model anchor only; it does not execute providers or persist generated content.
- Cost Calibration Gate remains blocked.
