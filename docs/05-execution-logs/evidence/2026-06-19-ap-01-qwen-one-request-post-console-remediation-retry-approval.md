# AP-01 Qwen One-Request Post-Console-Remediation Retry Approval Evidence

result: blocked
executionDecision: blocked_qwen_post_console_retry_http_403_provider_error_code_null_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-one-request-post-console-remediation-retry-approval`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-one-request-post-console-remediation-retry-approval`
- Batch range: AP-01 Qwen post-console-remediation one-request retry only.
- Commit: `5c6b6dc0` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: exactly one redacted local dev provider smoke retry against Qwen `qwen-plus` through the `openai_compatible`
  runner path.
- `.env.local` content read/write in this task: read only `ALIBABA_API_KEY` into a child process; no value output,
  modification, staging, or commit.

## RED / GREEN

- RED: previous Qwen one-request diagnostic returned sanitized HTTP `403` with `providerErrorCode: null`, followed by a
  docs-only console permission handoff.
- GREEN: The governed execution path reached the provider smoke runner, read only `ALIBABA_API_KEY` from `.env.local`,
  injected it only into the child process environment, and sent exactly one Qwen retry request through the generic
  `openai_compatible` path.
- BLOCKED: The single Qwen retry failed again with sanitized `failureCategory: provider_error`,
  `providerErrorSummary.httpStatus: 403`, and `providerErrorSummary.providerErrorCode: null`; no retry was run because
  the task limit is one request and retry limit is 0.

## Execution Boundary

- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen-plus`
- Env key alias: `ALIBABA_API_KEY`
- Base URL host: `dashscope.aliyuncs.com`
- Max requests: `1`
- Max output tokens: `8`
- Timeout: `30000` ms
- Retry limit: `0`
- Spend ceiling: USD `0.05`
- Model changes: blocked without later fresh approval.

## Provider Execution Result

- `.env.local` was read only for `ALIBABA_API_KEY`.
- The key value was injected only into the child command process and cleared after execution.
- The key value was not printed, copied, staged, committed, or written to evidence.
- Provider: `openai_compatible`.
- Provider name: `alibaba-qwen`.
- Model: `qwen-plus`.
- Base URL host: `dashscope.aliyuncs.com`.
- Max requests: `1`.
- Max output tokens: `8`.
- Timeout: `30000` ms.
- Retry limit: `0`.
- Max spend ceiling: USD `0.05`.
- Request count: `1`.
- Provider call executed: `true`.
- Result status: `fail`.
- Failure category: `provider_error`.
- Provider error summary httpStatus: `403`.
- Provider error summary providerErrorCode: `null`.
- Duration: `399` ms.
- Usage summary: `null`.
- Redaction status: `passed`.

## Runtime Failure Summary

- The post-console-remediation retry reached the provider boundary and returned sanitized HTTP `403`.
- The result matches the previous sanitized diagnostic: HTTP `403`, provider error code `null`.
- Inference from sanitized fields only: the remaining blocker is still likely Alibaba/Bailian-side authorization or API
  compatibility, especially exact API model id, API key workspace/sub-workspace binding, or OpenAI-compatible endpoint
  permission. This evidence does not prove the exact provider-side reason because raw error body capture remains
  blocked.

## Gates

- localFullLoopGate: not applicable; this is provider smoke retry only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after the approved single request; do not retry or inspect raw provider details in this
  task.
- nextModuleRunCandidate: `ap-01-qwen-exact-model-id-and-key-permission-handoff`.
- blocked remainder: `.env*` writes/value output, Qwen retry beyond this single request, model changes, additional
  provider execution, raw provider diagnostics, provider/base URL configuration changes, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment/external-service, dependencies, schema/drizzle/migration, product source,
  tests/e2e changes, PR, push, force push, destructive DB, raw provider error, raw prompt, raw payload, raw response,
  and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                               | Result                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git check-ignore -v .env.local`                                                                                                                                                                                                                                      | pass; `.env.local` ignored by `.gitignore`                                                                                                                                        |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `baseUrlHost: dashscope.aliyuncs.com`, redaction passed                                                                   |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-one-request-post-console-remediation-retry-approval -Capability providerKey -Intent use_capability`                                                                                                       | pass; capability ready, gate itself performed no env write/read                                                                                                                   |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-one-request-post-console-remediation-retry-approval -Capability providerCall -Intent use_capability`                                                                                                      | pass; capability ready, gate itself performed no provider call                                                                                                                    |
| direct PowerShell `.env.local` scoped `ALIBABA_API_KEY` preflight                                                                                                                                                                                                     | pass; `ALIBABA_API_KEY present_redacted`                                                                                                                                          |
| powershell.exe scoped child process executes exactly one redacted provider retry call with `TIKU_PROVIDER_SMOKE_APPROVED=1`                                                                                                                                           | blocked; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: fail`, `failureCategory: provider_error`, `httpStatus: 403`, `providerErrorCode: null`, redaction passed |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                | pass                                                                                                                                                                              |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                | pass                                                                                                                                                                              |
| `git diff --check`                                                                                                                                                                                                                                                    | pass                                                                                                                                                                              |
| `npm.cmd run lint`                                                                                                                                                                                                                                                    | pass                                                                                                                                                                              |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                               | pass                                                                                                                                                                              |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-one-request-post-console-remediation-retry-approval`                                                                                                                                                       | pass                                                                                                                                                                              |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-one-request-post-console-remediation-retry-approval`                                                                                                                                                  | pass                                                                                                                                                                              |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public provider/model/base URL
host, env key alias, pass/fail status, request count, sanitized failure category, sanitized provider error summary,
redacted token usage summary if available, and blocked gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw question bank
content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML
reports, or private file URLs.
