# Task Plan: batch-270-personal-learning-ai-local-ui-browser-experience-for-request-and

## Scope

- Task: `batch-270-personal-learning-ai-local-ui-browser-experience-for-request-and`
- Module: `personal-learning-ai`
- Closure item: local UI/browser experience for request and result reference where approved.
- Branch: `codex/batch-270-personal-ai-local-browser-experience`

## Readiness Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Inspected existing local browser experience service, model, and unit tests.

## Implementation Approach

- Keep this as docs/state-only closeout because existing source already covers the task boundary.
- Validate the service-level local browser experience contract with focused unit tests.
- Do not start a dev server, browser, Playwright, or e2e runtime.
- Record evidence that provider execution remains blocked and the deterministic local runner path has no env/provider access.

## Validation Plan

- `Test-ModuleRunV2WorkReadiness.ps1` pre-work and pre-edit for the task.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`.
- `Test-ModuleRunV2PreCommitHardening.ps1`.
- `Test-ModuleRunV2PrePushReadiness.ps1`.

## Risk Controls

- No browser/e2e/dev server runtime.
- No Provider/model calls.
- No env or secret access.
- No provider payload, raw prompt, raw AI output, raw employee answer, full paper content, plaintext redeem_code, token, or database URL exposure.
- Cost Calibration Gate remains blocked.
