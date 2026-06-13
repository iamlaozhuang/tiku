# Task Plan: batch-133-personal-learning-ai-request-history-route-session-boundary

## Scope

- Task id: `batch-133-personal-learning-ai-request-history-route-session-boundary`
- Branch: `codex/batch-133-personal-learning-ai-request-history-route-session-boundary`
- Goal: add a local `GET /api/v1/personal-ai-generation-requests` history read boundary that requires the resolved
  current student session and returns a redacted standard-envelope history list without trusting client-owned user ids.
- Fresh approval: user approved executing this follow-up and explicitly asked that task decomposition not omit or
  mis-scope required work.
- Non-goals: UI initial history fetch integration, persistence/repository queries, provider execution, generated-content
  writes, schema/migration, dependency/package/lockfile, env/secret, deploy, payment, external-service, PR, force-push,
  formal authorization model changes, and Cost Calibration Gate work.

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
- `docs/05-execution-logs/evidence/2026-06-12-batch-132-personal-learning-ai-server-session-ownership-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-132-personal-learning-ai-server-session-ownership-normalization.md`

## Allowed Files

- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-133-personal-learning-ai-request-history-route-session-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-133-personal-learning-ai-request-history-route-session-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-133-personal-learning-ai-request-history-route-session-boundary.md`

## Implementation Plan

1. Add focused RED route unit tests proving:
   - `GET` exists on the personal AI generation request collection route.
   - `GET` requires a resolved user session and returns the standard unauthorized envelope when missing.
   - successful `GET` returns a redacted history list in the standard envelope and ignores query/client-owned user ids.
2. Implement the smallest route handler addition:
   - resolve the same required user context used by `POST`;
   - call the existing redacted history read-model with local-only empty history input because persistence is out of
     scope;
   - keep the route as a thin adapter and do not introduce repository/provider/schema work.
3. Export `GET` from the existing Next.js App Route file.
4. Extend the existing dedicated local e2e spec to call the real `GET` API with the local session token and assert the
   standard redacted empty history envelope.

## Risk Defense

- The route enforces session presence even though local history persistence is not implemented.
- Empty local history is explicit and provider-free; future persistence can replace the input source behind the same
  session boundary in a separate task.
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
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-133-personal-learning-ai-request-history-route-session-boundary`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-133-personal-learning-ai-request-history-route-session-boundary`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-133-personal-learning-ai-request-history-route-session-boundary`
