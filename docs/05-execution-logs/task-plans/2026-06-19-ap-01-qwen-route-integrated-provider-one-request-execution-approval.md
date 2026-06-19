# AP-01 Qwen Route-Integrated Provider One-Request Execution Approval Task Plan

taskId: ap-01-qwen-route-integrated-provider-one-request-execution-approval

## Objective

Materialize a fresh approval for the next task to run exactly one real local route-integrated Qwen request through the
server-side controlled personal AI generation route path.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-execution-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen3-7-max-one-request-smoke-approval.md`

## Approval Decision

Approve the next execution task only:

- Next task: `ap-01-qwen-route-integrated-provider-one-request-execution`
- Target route service: `src/server/services/personal-ai-generation-request-route.ts`
- Target submit route: `POST /api/v1/personal-ai-generation-requests`
- Target mode: `local_browser_experience`
- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Env key alias: `ALIBABA_API_KEY`

## Execution Limits For Next Task

- Read `.env.local` only to load `ALIBABA_API_KEY` into the local process.
- Execute exactly one route-integrated provider request.
- `maxRequests=1`
- `maxRetries=0`
- `maxOutputTokens=8`
- `timeoutMs=30000`
- `maxSpendUsd=0.10`
- Stop after the first request regardless of pass or fail.
- Do not retry provider failures.
- Do not enable streaming.
- Do not run Cost Calibration Gate.

## Guardrails

- This approval task must not read `.env.local`.
- This approval task must not execute a provider/model call.
- This approval task must not modify source, tests, scripts, packages, lockfiles, schema, migrations, e2e specs, or
  `.env*`.
- The next execution task must not output, modify, copy, stage, or commit `.env*` content.
- Provider retry, streaming, additional provider calls, Cost Calibration Gate, staging/prod/cloud/deploy, payment,
  external service, schema/migration, dependency changes, PR, push, and force-push remain blocked.

## Redaction Boundary

Evidence may record only command name, pass/fail, request count, provider/model/base URL host, sanitized HTTP status,
sanitized provider error code, aggregate token counts, duration, and redaction pass/fail.

Evidence must not record raw prompt, raw response, raw model output, raw provider error text, provider payload, request
body, Authorization header, API key, token, secret, `.env*` content, database URL, raw DB rows, raw question, raw answer,
raw standard answer, raw analysis, raw material, screenshots, traces, or HTML reports.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution-approval`

## Non-Goals

- No provider/model call in this approval task.
- No `.env.local` read in this approval task.
- No source/test/schema/migration/script/package/lockfile/e2e change.
- No Cost Calibration Gate execution.
- No staging/prod/cloud/deploy/payment/external-service work.
