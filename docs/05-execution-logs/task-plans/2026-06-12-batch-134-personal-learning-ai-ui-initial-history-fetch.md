# Task Plan: batch-134-personal-learning-ai-ui-initial-history-fetch

## Scope

- Task id: `batch-134-personal-learning-ai-ui-initial-history-fetch`
- Branch: `codex/batch-134-personal-learning-ai-ui-initial-history-fetch`
- Goal: wire the student `/ai-generation` page initial request history section to the existing local
  `GET /api/v1/personal-ai-generation-requests` route and keep the display redacted.
- Fresh approval: user approved execution of the next suggested follow-up; provider, env/secret, schema/migration,
  dependency/package/lockfile, deploy, payment, external-service, PR, force-push, formal generated-content write paths,
  authorization model changes, persistence/repository work, and Cost Calibration Gate remain blocked.

## Governance Read

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
- `docs/05-execution-logs/evidence/2026-06-12-batch-133-personal-learning-ai-request-history-route-session-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-133-personal-learning-ai-request-history-route-session-boundary.md`

## Allowed Files

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-134-personal-learning-ai-ui-initial-history-fetch.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-134-personal-learning-ai-ui-initial-history-fetch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-134-personal-learning-ai-ui-initial-history-fetch.md`

## Blocked Files And Capabilities

- Blocked files: `.env*`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `src/app/**`,
  `src/server/services/**`, `src/server/repositories/**`, `src/server/mappers/**`, `src/server/contracts/**`,
  `src/server/models/**`, `playwright-report/**`, and `test-results/**`.
- Blocked capabilities: provider execution/configuration, schema/migration, dependency changes, formal generated-content
  writes, deploy, payment, external-service, PR, force-push, authorization model changes, persistence/repository work,
  and Cost Calibration Gate.

## Implementation Plan

1. Add a focused UI unit test that expects initial page render with a stored student token to issue `GET
/api/v1/personal-ai-generation-requests` and render server-returned camelCase redacted history rows.
2. Observe RED before implementation.
3. Add a `fetchPersonalAiGenerationRequestHistory` client helper using the existing student runtime API envelope helper.
4. Add a history-specific UI state in `StudentPersonalAiGenerationPage` so history loading/empty/error/unauthorized
   states are independent from submit request state.
5. Use `useEffect` to fetch initial history only when a local student session token exists; handle unauthorized,
   non-zero envelope, null data, and thrown errors without exposing session material.
6. Keep submit behavior session-aligned and redacted; after a successful submit, continue to show local redacted summary
   history for the newly submitted request.
7. Extend the existing local e2e spec to observe the page's initial GET call and standard empty history envelope.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Focused unit RED/GREEN:
  `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- Targeted local e2e:
  `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- Full gates:
  `npm.cmd run lint`
  `npm.cmd run typecheck`
  `npm.cmd run test:unit`
  `npm.cmd run build`
  `git diff --check`
- Module Run v2:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-134-personal-learning-ai-ui-initial-history-fetch`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-134-personal-learning-ai-ui-initial-history-fetch`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-134-personal-learning-ai-ui-initial-history-fetch`

## Risk Controls

- Do not change route handlers or server services; batch-133 already owns the route boundary.
- Do not introduce persistence or repository calls; local GET currently returns the approved local no-persistence history
  shape.
- Do not expose Authorization headers, session tokens, raw provider payloads, raw generated content, full paper content,
  or internal numeric ids in UI, tests, or evidence.
- Keep all API JSON fields camelCase and standard-envelope expectations aligned with ADR-002.
