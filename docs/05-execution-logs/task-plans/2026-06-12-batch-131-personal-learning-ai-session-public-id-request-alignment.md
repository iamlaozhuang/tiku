# Task Plan: batch-131-personal-learning-ai-session-public-id-request-alignment

## Scope

- Task id: `batch-131-personal-learning-ai-session-public-id-request-alignment`
- Branch: `codex/batch-131-personal-learning-ai-session-public-id-request-alignment`
- Goal: align the student personal AI request actor, owner, and quota owner publicIds with the current local student
  session and remove the batch-130 Playwright test-only payload alignment.
- Fresh approval: user approved executing the suggested next task after batch-130 closeout.
- Non-goals: provider execution, generated-content writes, schema/migration, dependency/package/lockfile, env/secret,
  deploy, payment, external-service, PR, force-push, and authorization model changes.

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
- `docs/05-execution-logs/evidence/2026-06-12-batch-130-personal-learning-ai-dedicated-local-e2e-spec.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-130-personal-learning-ai-dedicated-local-e2e-spec.md`

## Allowed Files

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-131-personal-learning-ai-session-public-id-request-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-131-personal-learning-ai-session-public-id-request-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-131-personal-learning-ai-session-public-id-request-alignment.md`

## Implementation Plan

1. Add a focused RED unit assertion that the page reads the current session through `/api/v1/sessions` and submits
   actor, owner, and quota owner publicIds matching that session.
2. Add a focused RED e2e expectation by removing the batch-130 route payload rewrite and asserting the real request
   succeeds.
3. Add a small `studentRuntimeApi` helper for current student session lookup using existing auth headers and standard
   API envelopes.
4. Update `StudentPersonalAiGenerationPage` to derive only session-owned publicIds from the current session before
   building the request body.
5. Keep all content/result rendering redacted and keep the existing local-only route contract.

## Risk Defense

- The fix is client/runtime-helper scoped; no route, service, repository, schema, provider, dependency, or env changes.
- The existing route remains authoritative for session auth and still overrides `userPublicId`.
- Evidence must not record tokens, authorization headers, raw provider payload, generated content, or full paper content.
- The e2e artifact directories remain blocked and uncommitted.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- RED/GREEN focused unit: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- Targeted e2e: `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`
