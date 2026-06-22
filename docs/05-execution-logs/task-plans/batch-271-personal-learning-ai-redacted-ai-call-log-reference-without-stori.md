# Task Plan: batch-271-personal-learning-ai-redacted-ai-call-log-reference-without-stori

## Scope

- Task: `batch-271-personal-learning-ai-redacted-ai-call-log-reference-without-stori`
- Module: `personal-learning-ai`
- Closure item: redacted ai_call_log reference without storing raw generated AI content.
- Branch: `codex/batch-271-personal-ai-call-log-reference`

## Readiness Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Inspected existing redacted ai_call_log reference model, service, and unit tests.

## Implementation Approach

- Keep this as docs/state-only closeout because existing source already covers the task boundary.
- Validate redacted ai_call_log references with focused unit tests.
- Record evidence that raw prompt, raw generated content, provider payload, full paper content, and secret fixtures are not exposed.
- Do not edit source, tests, dependencies, schema, env, provider configuration, browser/e2e, database, deployment, PR, or force-push surfaces.

## Validation Plan

- `Test-ModuleRunV2WorkReadiness.ps1` pre-work and pre-edit for the task.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`.
- `Test-ModuleRunV2PreCommitHardening.ps1`.
- `Test-ModuleRunV2PrePushReadiness.ps1`.

## Risk Controls

- No Provider/model calls.
- No env or secret access.
- No raw prompt, raw generated AI content, provider payload, raw employee answer, full paper content, plaintext redeem_code, token, or database URL exposure.
- Cost Calibration Gate remains blocked.
