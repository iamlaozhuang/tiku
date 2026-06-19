# AP-01 Qwen In-App AI One-Request Execution Evidence

result: pass
executionDecision: pass_one_request_qwen_provider_runner_route_integration_pending

## Result

- Task id: `ap-01-qwen-in-app-ai-one-request-execution`
- Result: `pass_one_request_qwen_provider_runner_route_integration_pending`
- Batch range: AP-01 Qwen in-app AI one-request execution only.
- Branch: `codex/ap-01-qwen-in-app-ai-one-request-execution`
- Base commit: `50a50699`
- Provider calls executed: `1`
- `.env.local` read: `true`
- `.env.local` modified: `false`
- Product source changed: `false`
- Test source changed: `false`
- Schema/migration/dependency/script/e2e changes: `false`
- Cost Calibration Gate: `blocked`

## RED / GREEN

- RED: the approval task allowed one real Qwen request but did not execute it.
- GREEN: one approved local Qwen request was executed through the existing redacted provider runner. The run returned
  `resultStatus=pass`, `requestCount=1`, and `redactionStatus=passed`.

## Runtime Boundary

- Current in-app route real provider wiring: `not_implemented`.
- Execution entry: `scripts/ai/run-personal-ai-provider-smoke.mjs`
- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL host: `dashscope.aliyuncs.com`
- Env key alias: `ALIBABA_API_KEY`
- Request count: `1`
- Provider call executed: `true`
- Result status: `pass`
- Failure category: `null`
- Duration: `14583` ms
- Usage summary:
  - input tokens: `24`
  - output tokens: `692`
  - total tokens: `716`
  - reasoning tokens: `686`
  - cached input tokens: `0`
- Max retries: `0`
- Streaming: `blocked`
- Formal Cost Calibration Gate: `blocked`
- Stop threshold check: total tokens below `2000`; reasoning tokens below `1800`.
- Cost calibration observation: one request produced usage counts, but formal Cost Calibration Gate remains blocked.

## Redaction Boundary

Evidence records only sanitized summary values. It must not record `.env*` contents, provider key values, raw prompt, raw
response, raw model output, provider payload, provider error text, request body, raw answer, raw standard answer, raw
analysis, raw question body, raw DB rows, screenshots, traces, HTML reports, database URL, token, Authorization header, or
secret.

## Residual Blocked Gates

- localFullLoopGate: not executed; this task is one local provider request only.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after one request execution evidence.
- nextModuleRunCandidate: `ap-01-qwen-route-integrated-provider-execution-implementation-approval`
- blocked remainder: route-integrated real provider execution, additional provider calls, retries, streaming, raw
  sensitive evidence, `.env*` writes, env secret output, staging/prod/cloud/deploy, payment/external service,
  dependency/schema/migration changes, destructive DB work, PR, push, force push, and Cost Calibration Gate remain
  blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                         | Result | Notes                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| `git switch -c codex/ap-01-qwen-in-app-ai-one-request-execution`                                                                                                                | pass   | Short-lived execution branch created.                |
| `node --version`                                                                                                                                                                | pass   | Node runtime available.                              |
| `powershell.exe ... node scripts/ai/run-personal-ai-provider-smoke.mjs ... --execute`                                                                                           | pass   | 1 request, resultStatus pass, redacted summary only. |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                          | pass   | Changed docs/state files formatted.                  |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                          | pass   | All matched files use Prettier style.                |
| `git diff --check`                                                                                                                                                              | pass   | No whitespace errors.                                |
| `npm.cmd run lint`                                                                                                                                                              | pass   | ESLint passed.                                       |
| `npm.cmd run typecheck`                                                                                                                                                         | pass   | `tsc --noEmit` passed.                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution`      | pass   | Scope and sensitive evidence checks passed.          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-in-app-ai-one-request-execution` | pass   | Module closeout readiness passed.                    |
