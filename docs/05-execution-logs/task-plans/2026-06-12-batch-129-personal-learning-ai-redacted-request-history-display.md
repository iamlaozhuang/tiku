# Task Plan: batch-129-personal-learning-ai-redacted-request-history-display

## Scope

- Task id: `batch-129-personal-learning-ai-redacted-request-history-display`
- Branch: `codex/batch-129-personal-learning-ai-redacted-request-history-display`
- Goal: display a redacted recent personal learning AI request history section on the existing student `/ai-generation` page.
- Non-goals: new route creation, persistence, provider execution, schema/migration, dependency/env/deploy/payment/external-service changes, new e2e spec authoring, PR, force push, and Cost Calibration Gate.

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
- Recent evidence/audit: batch-128 request history read-model.

## Allowed Files

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-129-personal-learning-ai-redacted-request-history-display.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-129-personal-learning-ai-redacted-request-history-display.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-129-personal-learning-ai-redacted-request-history-display.md`

## Implementation Plan

1. Inspect the existing student AI page, runtime helper, and focused UI unit tests.
2. Add a focused RED UI unit test proving redacted history rows render from camelCase fields and private content stays absent.
3. Extend the runtime helper with local-only history DTO handling using the existing page/runtime patterns.
4. Add a compact history section with loading, empty, error, and unauthorized-safe behavior without adding a new route or e2e spec.
5. Keep styling consistent with existing tokens/classes and avoid exposing provider payload, generated content, full paper content, numeric ids, or session material.

## Risk Defense

- UI boundary: only existing student personal AI page and runtime helper are modified.
- E2E boundary: run approved existing local e2e list and `e2e/local-auth-route-guard.spec.ts`; do not edit `e2e/**`.
- Provider/persistence boundary: no provider calls, repository changes, schema/migration, or generated-content write path.
- Evidence redaction: record only commands, pass/fail, counts, and summaries.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Focused RED/GREEN: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-129-personal-learning-ai-redacted-request-history-display`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-129-personal-learning-ai-redacted-request-history-display`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-129-personal-learning-ai-redacted-request-history-display`
