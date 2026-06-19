# AP-01 Qwen OpenAI-Compatible One-Request Isolation Smoke Evidence

result: blocked
executionDecision: blocked_qwen_openai_compatible_provider_error_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- Batch range: AP-01 Qwen OpenAI-compatible isolation smoke only.
- Commit: `1925f984` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: exactly one redacted local dev provider smoke against Qwen `qwen-plus` through the `openai_compatible` runner
  path.
- `.env.local` content read/write in this task: read only `ALIBABA_API_KEY` into a child process; no value output,
  modification, staging, or commit.

## RED / GREEN

- RED: previous `alibaba/qwen-plus` explicit-base-URL smoke sent one request and returned sanitized
  `failureCategory: provider_error`.
- GREEN: The governed execution path reached the provider smoke runner, read only `ALIBABA_API_KEY` from `.env.local`,
  injected it only into the child process environment, and sent exactly one Qwen request through the generic
  `openai_compatible` path.
- BLOCKED: The single Qwen request failed with sanitized `failureCategory: provider_error`; no retry was run because the
  task limit is one request and retry limit is 0.

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
- Duration: `390` ms.
- Usage summary: `null`.
- Redaction status: `passed`.

## Diagnosis Impact

- This result lowers the likelihood that the earlier failure was specific to the `@ai-sdk/alibaba` wrapper, because the
  generic OpenAI-compatible path also reached the provider boundary and failed with the same sanitized category.
- Remaining likely causes are outside the local runner path: Alibaba Cloud account/workspace permission, sub-workspace
  model entitlement, key type, model availability, or a provider-side request rejection whose raw details are deliberately
  not recorded in this evidence.

## Gates

- localFullLoopGate: not applicable; this is provider smoke isolation only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after the approved single request; do not retry or inspect raw provider details in this
  task.
- nextModuleRunCandidate: `ap-01-qwen-console-online-debug-handoff-or-redacted-error-code-diagnostics`.
- blocked remainder: `.env*` writes/value output, Qwen retry, additional provider execution, raw provider diagnostics,
  provider configuration changes, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service,
  dependencies, schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, raw
  provider error, raw prompt, raw payload, raw response, and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                               | Result                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `git check-ignore -v .env.local`                                                                                                                                                                                                                                      | pass; `.env.local` ignored by `.gitignore`                                                                                          |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `baseUrlHost: dashscope.aliyuncs.com`, redaction passed                     |
| initial `Test-ModuleRunV2LocalCapabilityGate.ps1 ... -Capability providerKey ...` before capability schema correction                                                                                                                                                 | blocked; queue capability value was too specific for the approved schema; no provider call occurred                                 |
| initial `Test-ModuleRunV2LocalCapabilityGate.ps1 ... -Capability providerCall ...` before capability schema correction                                                                                                                                                | blocked; queue capability value was too specific for the approved schema; no provider call occurred                                 |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke -Capability providerKey -Intent use_capability`                                                                                                             | pass; capability ready, gate itself performed no env write/read                                                                     |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke -Capability providerCall -Intent use_capability`                                                                                                            | pass; capability ready, gate itself performed no provider call                                                                      |
| direct PowerShell `.env.local` scoped `ALIBABA_API_KEY` preflight                                                                                                                                                                                                     | pass; `ALIBABA_API_KEY present_redacted`                                                                                            |
| powershell.exe scoped child process executes exactly one redacted provider call with `TIKU_PROVIDER_SMOKE_APPROVED=1`                                                                                                                                                 | blocked; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: fail`, `failureCategory: provider_error`, redaction passed |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                | pass                                                                                                                                |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                | pass                                                                                                                                |
| `git diff --check`                                                                                                                                                                                                                                                    | pass                                                                                                                                |
| `npm.cmd run lint`                                                                                                                                                                                                                                                    | pass                                                                                                                                |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                               | pass                                                                                                                                |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke`                                                                                                                                                             | pass                                                                                                                                |
| initial `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke`                                                                                                                                                | failed; validation command text did not exactly match queue text; no provider call occurred                                         |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke`                                                                                                                                                        | pass                                                                                                                                |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public provider/model/base URL
host, env key alias, pass/fail status, request count, sanitized failure category, redacted token usage summary if
available, and blocked gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw question bank
content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML
reports, or private file URLs.
