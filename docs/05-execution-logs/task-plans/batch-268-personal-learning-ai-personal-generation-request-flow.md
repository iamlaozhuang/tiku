# Task Plan: batch-268-personal-learning-ai-personal-generation-request-flow

## Scope

- Task: `batch-268-personal-learning-ai-personal-generation-request-flow`
- Module: `personal-learning-ai`
- Closure item: personal generation request flow.
- Branch: `codex/batch-268-personal-ai-request-flow`

## Readiness Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Inspected existing personal AI generation request flow model, validator, service, contract, and unit tests.

## Implementation Approach

- Keep this as docs/state-only closeout because existing source already covers the task boundary.
- Validate existing request flow behavior with focused unit tests.
- Record evidence that the flow remains local contract-only, redacted, personal-auth scoped, and blocked before provider execution for invalid boundaries.
- Do not edit source, tests, dependencies, schema, env, provider configuration, browser/e2e, database, deployment, PR, or force-push surfaces.

## Validation Plan

- `Test-ModuleRunV2WorkReadiness.ps1` pre-work and pre-edit for the task.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`.
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
- If a high-risk action becomes necessary, record it as blocked or fresh approval required and do not execute it.
