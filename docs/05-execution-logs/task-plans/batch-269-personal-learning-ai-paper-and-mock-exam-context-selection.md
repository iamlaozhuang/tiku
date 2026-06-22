# Task Plan: batch-269-personal-learning-ai-paper-and-mock-exam-context-selection

## Scope

- Task: `batch-269-personal-learning-ai-paper-and-mock-exam-context-selection`
- Module: `personal-learning-ai`
- Closure item: paper and mock_exam context selection.
- Branch: `codex/batch-269-personal-ai-context-selection`

## Readiness Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Inspected existing personal AI generation context selection model, service, and unit tests.

## Implementation Approach

- Keep this as docs/state-only closeout because existing source already covers the task boundary.
- Validate paper and mock_exam context selection with focused unit tests.
- Record evidence that context references stay redacted and use public ids only.
- Do not edit source, tests, dependencies, schema, env, provider configuration, browser/e2e, database, deployment, PR, or force-push surfaces.

## Validation Plan

- `Test-ModuleRunV2WorkReadiness.ps1` pre-work and pre-edit for the task.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`.
- `Test-ModuleRunV2PreCommitHardening.ps1`.
- `Test-ModuleRunV2PrePushReadiness.ps1`.

## Risk Controls

- No Provider/model calls.
- No env or secret access.
- No provider payload, raw prompt, raw AI output, raw employee answer, full paper content, plaintext redeem_code, token, or database URL exposure.
- Cost Calibration Gate remains blocked.
