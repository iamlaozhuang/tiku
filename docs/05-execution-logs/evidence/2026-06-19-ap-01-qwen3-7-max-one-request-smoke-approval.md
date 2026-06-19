# AP-01 Qwen3.7-Max one-request smoke approval evidence

result: pass
executionDecision: pass_qwen3_7_max_one_request_smoke_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen3-7-max-one-request-smoke-approval`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen3-7-max-one-request-smoke-approval`
- Batch range: AP-01 Qwen3.7-Max one-request smoke only.
- Commit: `1577edc7` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: exactly one redacted local dev provider smoke request against Qwen `qwen3.7-max` through the
  `openai_compatible` runner path.
- `.env.local` content read/write in this task: approved to read only `ALIBABA_API_KEY` into a child process; no value
  output, modification, staging, or commit.

## RED / GREEN

- RED: AP-01 Qwen exact model handoff identified the next execution candidate as `qwen3.7-max`, with provider execution
  still blocked pending fresh approval.
- GREEN: The governed execution path reached the provider smoke runner, read only `ALIBABA_API_KEY` from `.env.local`,
  injected it only into the child process environment, and sent exactly one Qwen3.7-Max request through the generic
  `openai_compatible` path.

## Execution Boundary

- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Env key alias: `ALIBABA_API_KEY`
- Base URL host: `dashscope.aliyuncs.com`
- Max requests: `1`
- Max output tokens: `8`
- Timeout: `30000` ms
- Retry limit: `0`
- Spend ceiling: USD `0.05`
- Model changes: blocked.

## Provider Execution Result

- `.env.local` was read only for `ALIBABA_API_KEY`.
- The key value was injected only into the child command process and cleared after execution.
- The key value was not printed, copied, staged, committed, or written to evidence.
- Provider: `openai_compatible`.
- Provider name: `alibaba-qwen`.
- Model: `qwen3.7-max`.
- Base URL host: `dashscope.aliyuncs.com`.
- Max requests: `1`.
- Max output tokens: `8`.
- Timeout: `30000` ms.
- Retry limit: `0`.
- Max spend ceiling: USD `0.05`.
- Request count: `1`.
- Provider call executed: `true`.
- Result status: `pass`.
- Failure category: `null`.
- Provider error summary: `null`.
- Duration: `15821` ms.
- Usage summary:
  - input tokens: `24`
  - output tokens: `824`
  - total tokens: `848`
  - reasoning tokens: `818`
  - cached input tokens: `0`
- Redaction status: `passed`.

## Runtime Summary

- The one approved Qwen3.7-Max smoke request passed through the Beijing OpenAI-compatible endpoint.
- The result proves the local key, endpoint, model id, and generic OpenAI-compatible runner path can complete a minimal
  provider call.
- The observed reasoning-token usage is intentionally recorded only as aggregate usage metadata; it does not approve or
  complete Cost Calibration Gate.

## Gates

- localFullLoopGate: not applicable; this is provider smoke retry only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after the approved single request; do not retry or inspect raw provider details in this
  task.
- nextModuleRunCandidate: `ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`.
- blocked remainder: `.env*` writes/value output, Qwen retry beyond this single request, additional provider execution,
  raw provider diagnostics, provider/base URL configuration changes, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, dependencies, schema/drizzle/migration, product source, tests/e2e changes, PR, push, force
  push, destructive DB, raw provider error, raw prompt, raw payload, raw response, raw model output, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                                 | Result                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `git check-ignore -v .env.local`                                                                                                                                                                                                                                        | pass; `.env.local` ignored by `.gitignore`                                                                      |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen3.7-max --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `baseUrlHost: dashscope.aliyuncs.com`, redaction passed |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen3-7-max-one-request-smoke-approval -Capability providerKey -Intent use_capability`                                                                                                                           | pass; capability ready, gate itself performed no env write/read                                                 |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen3-7-max-one-request-smoke-approval -Capability providerCall -Intent use_capability`                                                                                                                          | pass; capability ready, gate itself performed no provider call                                                  |
| direct PowerShell `.env.local` scoped `ALIBABA_API_KEY` preflight                                                                                                                                                                                                       | pass; `ALIBABA_API_KEY present_redacted: true`                                                                  |
| powershell.exe scoped child process executes exactly one redacted provider call with `TIKU_PROVIDER_SMOKE_APPROVED=1`                                                                                                                                                   | pass; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: pass`, redaction passed                   |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                  | pass                                                                                                            |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                                                                                  | pass                                                                                                            |
| `git diff --check`                                                                                                                                                                                                                                                      | pass                                                                                                            |
| `npm.cmd run lint`                                                                                                                                                                                                                                                      | pass                                                                                                            |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                 | pass                                                                                                            |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen3-7-max-one-request-smoke-approval`                                                                                                                                                                           | pass                                                                                                            |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen3-7-max-one-request-smoke-approval`                                                                                                                                                                      | pass                                                                                                            |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public provider/model/base URL
host, env key alias, pass/fail status, request count, sanitized failure category, sanitized provider error summary,
redacted token usage summary if available, and blocked gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, raw model output, secrets, env values, tokens, Authorization headers, database URLs, raw
question bank content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots,
traces, HTML reports, or private file URLs.
