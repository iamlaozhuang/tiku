# Task Plan: batch-267-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence

## Scope

- Task: `batch-267-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
- Module: `ai-task-and-provider`
- Closure item: local provider sandbox proposal and evidence rules.
- Branch: `codex/batch-267-ai-task-sandbox-proposal`

## Readiness Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Inspected existing local implementation and unit tests for provider sandbox proposal coverage.

## Implementation Approach

- Keep this as docs/state-only closeout because existing source already covers the task boundary.
- Validate existing provider sandbox proposal read model with focused unit tests.
- Record evidence that the provider boundary remains proposal-only, redacted, and blocked for high-risk runtime actions.
- Do not edit source, tests, dependencies, schema, env, provider configuration, browser/e2e, database, deployment, PR, or force-push surfaces.

## Validation Plan

- `Test-ModuleRunV2WorkReadiness.ps1` pre-work and pre-edit for the task.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`.
- `Test-ModuleRunV2PreCommitHardening.ps1`.
- `Test-ModuleRunV2PrePushReadiness.ps1`.

## Risk Controls

- No provider/model calls.
- No env or secret access.
- No provider payload, raw prompt, raw AI output, raw employee answer, full paper content, plaintext redeem_code, token, or database URL exposure.
- Cost Calibration Gate remains blocked.
- If a high-risk action becomes necessary, record it as blocked or fresh approval required and do not execute it.
