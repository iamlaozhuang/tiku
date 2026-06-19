# AP-01 Qwen In-App AI One-Request Execution Approval Task Plan

taskId: ap-01-qwen-in-app-ai-one-request-execution-approval

## Objective

Materialize the fresh approval boundary for exactly one future real in-app Qwen request after the default-blocked runtime
bridge passed. This task is approval-only and must not execute the request.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-implementation.md`

## Scope

Allowed files are limited to task queue, project state, coverage matrix, this task plan, evidence, and audit review.

No source, test, schema, migration, script, dependency, package, lockfile, or environment file may be modified.

## Fresh Approval Boundary

Approved for the next execution task only:

- Target next task: `ap-01-qwen-in-app-ai-one-request-execution`
- Local environment only.
- In-app entry: `/ai-generation`
- Submit route: `POST /api/v1/personal-ai-generation-requests`
- Request mode: `local_browser_experience`
- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Env key alias: `ALIBABA_API_KEY`
- Max provider requests: `1`
- Max retries: `0`
- Streaming: blocked
- Timeout: `30000` ms
- Max output tokens: `32`
- Max spend: `0.10` USD
- Formal Cost Calibration Gate: blocked

## Evidence Redaction Boundary

Evidence may record only command names, pass/fail, request count, sanitized provider/model/base URL host, sanitized HTTP
status, sanitized provider error code, aggregate token counts, duration, and redaction pass/fail.

Evidence must not record raw prompt, raw response, raw model output, raw provider error text, provider payload, request
body, Authorization header, API key, token, secret, `.env*` content, database URL, raw DB rows, raw question, raw standard
answer, raw analysis, raw material, screenshots, traces, or HTML reports.

## Stop Conditions

- Stop before provider call if a code change, package change, env write, schema/migration, DB destructive operation,
  staging/prod/cloud/deploy, payment, external service, PR, push, or force-push is needed.
- Stop after the first provider request regardless of pass or fail.
- Do not retry provider failures.
- Stop if the response would require recording raw prompt, raw response, raw error, or raw payload to diagnose.
- Stop if observed total tokens exceed `2000` or observed reasoning tokens exceed `1800`; record only aggregate counts.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution-approval`

## Non-Goals

- No provider/model call in this approval task.
- No `.env.local` read, write, copy, echo, staging, or commit in this approval task.
- No product source or test changes.
- No Cost Calibration Gate execution.
- No staging/prod/cloud/deploy/payment/external-service work.
