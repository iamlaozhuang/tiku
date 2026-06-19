# AP-01 Qwen In-App AI One-Request Execution Task Plan

taskId: ap-01-qwen-in-app-ai-one-request-execution

## Objective

Execute exactly one local Qwen provider request under the AP-01 in-app AI approval boundary, then record only redacted
evidence.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-one-request-execution-approval.md`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Execution Boundary

- Local-only execution.
- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Env key alias: `ALIBABA_API_KEY`
- Env source: local `.env.local`, key alias only.
- Max provider requests: `1`
- Max retries: `0`
- Timeout: `30000` ms
- Max output tokens: approval ceiling `32`; existing redacted runner uses a stricter `8` token setting.
- Streaming: blocked.
- Cost Calibration Gate: blocked.

## Runtime Note

The current `/api/v1/personal-ai-generation-requests` local browser route exposes a default-blocked `runtimeBridge` read
model. Real provider execution is not wired into that route yet. This task therefore executes one approved Qwen request
through the existing redacted local provider runner while preserving the in-app AP-01 provider/model/base URL boundary.
If full route-integrated execution is required, a separate implementation task is needed.

## Redaction Boundary

Evidence may record only command name, pass/fail, request count, provider/model/base URL host, sanitized HTTP status,
sanitized provider error code, aggregate token counts, duration, and redaction pass/fail.

Evidence must not record raw prompt, raw response, raw model output, raw provider error text, provider payload, request
body, Authorization header, API key, token, secret, `.env*` content, database URL, raw DB rows, raw question, raw answer,
raw standard answer, raw analysis, raw material, screenshots, traces, or HTML reports.

## Stop Conditions

- Stop after the first provider request regardless of pass or fail.
- Do not retry provider failures.
- Stop before provider call if code, dependency, schema, migration, environment write, staging/prod/cloud/deploy,
  payment, external service, PR, push, or force-push work becomes necessary.
- Stop if raw sensitive evidence would be required for diagnosis.

## Validation Plan

- `node --version`
- one approved redacted provider runner command
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution`
