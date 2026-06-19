# AP-01 Qwen Provider Smoke Execution Base URL Ready Evidence

result: blocked
executionDecision: blocked_qwen_base_url_provider_error_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-provider-smoke-execution-base-url-ready`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-provider-smoke-execution-base-url-ready`
- Batch range: AP-01 Qwen only.
- Commit: `c3f87412` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: one redacted local dev provider smoke against Qwen `qwen-plus`, reading only `ALIBABA_API_KEY` from
  `.env.local`, with explicit Alibaba base URL.

## RED / GREEN

- RED: Previous Qwen one-request execution reached the provider but failed with sanitized `provider_error` before the
  runner supported explicit Alibaba base URL.
- GREEN: The governed execution path reached the provider smoke runner, read only `ALIBABA_API_KEY` from `.env.local`,
  injected it only into the child process environment, and sent exactly one Qwen request with explicit Alibaba base URL.
- BLOCKED: The single Qwen request failed with sanitized `failureCategory: provider_error`; no retry was run because the
  task limit is one request and retry limit is 0.

## Runtime Summary

- `.env.local` was read only for `ALIBABA_API_KEY`.
- The key value was injected only into the child command process and cleared after execution.
- The key value was not printed, copied, staged, committed, or written to evidence.
- Env key alias: `ALIBABA_API_KEY`.
- Provider: `alibaba`.
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
- Duration: `637` ms.
- Usage summary: `null`.
- Redaction status: `passed`.

## Gates

- localFullLoopGate: not applicable; this is provider smoke only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after one Qwen result; do not retry or run any additional provider call in this task.
- nextModuleRunCandidate: `ap-01-qwen-provider-smoke-base-url-failure-diagnosis`.
- blocked remainder: Qwen retry/additional provider execution, provider configuration outside the explicit CLI base URL,
  `.env*` output/commit, secret value disclosure, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, dependencies, schema/drizzle/migration, product source, tests/e2e changes, PR, push, force
  push, destructive DB, raw provider error, raw prompt, raw payload, raw response, and raw sensitive evidence remain
  blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                        | Result                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `git check-ignore -v .env.local`                                                                                                                                                                                               | pass; `.env.local` ignored by `.gitignore`                                                                                          |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `baseUrlHost: dashscope.aliyuncs.com`, redaction passed                     |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready -Capability providerKey -Intent use_capability`                                                                            | pass; capability ready, gate itself performed no env write/read                                                                     |
| initial `Test-ModuleRunV2LocalCapabilityGate.ps1 ... -Capability providerCall ...` before capability schema correction                                                                                                         | blocked; queue capability value was too specific for the approved schema; no provider call occurred                                 |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready -Capability providerCall -Intent use_capability`                                                                           | pass after queue capability schema correction; gate itself performed no provider call                                               |
| direct PowerShell `.env.local` presence preflight                                                                                                                                                                              | pass; `ALIBABA_API_KEY present_redacted`                                                                                            |
| direct PowerShell `.env.local` injection Qwen execute command with explicit base URL                                                                                                                                           | blocked; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: fail`, `failureCategory: provider_error`, redaction passed |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                                         | pass; 6 files checked                                                                                                               |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                                         | pass; all matched files use Prettier style                                                                                          |
| `git diff --check`                                                                                                                                                                                                             | pass                                                                                                                                |
| `npm.cmd run lint`                                                                                                                                                                                                             | pass                                                                                                                                |
| `npm.cmd run typecheck`                                                                                                                                                                                                        | pass                                                                                                                                |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready`                                                                                                                            | pass; filesToScan 6                                                                                                                 |
| initial `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready`                                                                                                               | failed; blocked evidence required audit marker `APPROVE_BLOCKED_EVIDENCE_CLOSEOUT`; no provider call occurred                       |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready`                                                                                                                       | pass after blocked evidence closeout marker was added                                                                               |

## Redaction

This evidence records only AP ids, task ids, branch name, file paths, command names, pass/fail status, provider/model
ids, public base URL host, env key aliases, redacted env presence, request counts, token caps, sanitized failure
category, duration, usage summary, and redaction status.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw question bank
content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML
reports, or private file URLs.
