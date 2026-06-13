# Task Plan: batch-127-personal-learning-ai-student-session-auth-bridge

## Scope

- Task id: `batch-127-personal-learning-ai-student-session-auth-bridge`
- Branch: `codex/batch-127-personal-learning-ai-student-session-auth-bridge`
- Goal: bridge the existing local student session runtime into `/api/v1/personal-ai-generation-requests` so the route resolves `userPublicId` from session context and ignores request-body user identity.
- Non-goals: auth model changes, schema/migration, repository/mapper edits, provider calls, generated-content persistence, dependency/env/deploy/payment/external-service work, new e2e spec authoring, PR, force push, and Cost Calibration Gate.

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
- Recent evidence/audit: seed next personal-learning-ai auth-flow tasks, batch-126 local browser flow validation, and post-batch-126 state hygiene repair.

## Allowed Files

- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-127-personal-learning-ai-student-session-auth-bridge.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-127-personal-learning-ai-student-session-auth-bridge.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-127-personal-learning-ai-student-session-auth-bridge.md`

## Implementation Plan

1. Inspect the existing route adapter, route service, local session runtime helper, and focused unit tests.
2. Add a focused failing unit test that proves the route uses a resolved session `userPublicId` and ignores spoofed request-body identity.
3. Implement the smallest route/service change needed to inject or resolve the local session identity without touching `src/server/auth/**`.
4. Keep API responses in the standard `{ code, message, data }` envelope and keep JSON fields camelCase.
5. Preserve evidence redaction: do not write raw Authorization headers, session material, provider payloads, raw generated content, full paper content, or numeric internal ids.

## Risk Defense

- Authorization model boundary: use only existing runtime/session helper surfaces already available outside blocked paths.
- Provider boundary: no provider execution or provider configuration.
- Persistence boundary: no schema, migration, repository, mapper, or generated-content storage work.
- E2E boundary: run existing approved local e2e spec only; do not edit or create `e2e/**`.
- Dependency boundary: do not modify `package.json` or lockfiles.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Focused RED/GREEN: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-127-personal-learning-ai-student-session-auth-bridge`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-127-personal-learning-ai-student-session-auth-bridge`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-127-personal-learning-ai-student-session-auth-bridge`
