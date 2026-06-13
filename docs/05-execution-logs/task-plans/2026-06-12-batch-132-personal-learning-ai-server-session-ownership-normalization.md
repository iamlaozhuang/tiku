# Task Plan: batch-132-personal-learning-ai-server-session-ownership-normalization

## Scope

- Task id: `batch-132-personal-learning-ai-server-session-ownership-normalization`
- Branch: `codex/batch-132-personal-learning-ai-server-session-ownership-normalization`
- Goal: normalize personal AI generation request `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId` from the
  resolved server session user context, matching the existing route-owned `userPublicId` boundary.
- Fresh approval: user approved executing this suggested follow-up task after batch-131.
- Non-goals: provider execution, generated-content writes, schema/migration, dependency/package/lockfile, env/secret,
  deploy, payment, external-service, PR, force-push, formal authorization model changes, and Cost Calibration Gate work.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-131-personal-learning-ai-session-public-id-request-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-131-personal-learning-ai-session-public-id-request-alignment.md`

## Allowed Files

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-132-personal-learning-ai-server-session-ownership-normalization.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-132-personal-learning-ai-server-session-ownership-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-132-personal-learning-ai-server-session-ownership-normalization.md`

## Implementation Plan

1. Add a focused RED route unit test proving untrusted body `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId`
   cannot steer the local browser experience request flow.
2. Normalize those ownership publicIds from `PersonalAiGenerationRequestUserContext` in the route input adapter, alongside
   the existing `userPublicId` override.
3. Keep the route a thin adapter over the existing service contracts and preserve standard API envelopes.
4. Run the dedicated local e2e spec to ensure the student browser flow still succeeds without provider execution.

## Risk Defense

- This is route/service-layer hardening only; no repository, schema, provider, dependency, env, or deploy changes.
- The task does not introduce a new authorization model. It makes existing session ownership fields route-authoritative.
- Evidence must not record tokens, authorization headers, raw provider payload, generated content, full paper content, or
  local credential values.
- The e2e artifact directories remain blocked and uncommitted.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- Targeted local e2e: `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-132-personal-learning-ai-server-session-ownership-normalization`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-132-personal-learning-ai-server-session-ownership-normalization`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-132-personal-learning-ai-server-session-ownership-normalization`
