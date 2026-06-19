# AP-01 Provider Smoke Execution Qwen env.local Ready Evidence

result: blocked
executionDecision: blocked_qwen_provider_error_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-qwen-env-local-ready`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-qwen-env-local-ready`
- Batch range: AP-01 Qwen only.
- Commit: `2dfb46ea` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: one redacted local dev provider smoke against Qwen `qwen-plus`, reading only `ALIBABA_API_KEY` from
  `.env.local`.

## RED / GREEN

- RED: Qwen second-provider smoke was pending after user-managed `ALIBABA_API_KEY` handoff.
- GREEN: The governed Qwen execution path reached the provider smoke runner and sent exactly one request with redacted
  evidence.
- BLOCKED: The single Qwen request failed with sanitized `failureCategory: provider_error`; no retry was run because the
  task limit is one request and retry limit is 0.

## Runtime Summary

- `.env.local` was read only for `ALIBABA_API_KEY`.
- The key value was injected only into the child command process and cleared after execution.
- The key value was not printed, copied, staged, committed, or written to evidence.
- Provider smoke result: blocked by provider error.
- Request count: `1`.
- Provider call executed: `true`.
- Result status: `fail`.
- Failure category: `provider_error`.
- Duration: `1126` ms.
- Usage summary: `null`.
- Redaction status: `passed`.

## Gates

- localFullLoopGate: not applicable; this is provider smoke only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after one Qwen result; do not retry or run any additional provider call in this task.
- nextModuleRunCandidate: `ap-01-qwen-provider-smoke-failure-diagnosis`.
- blocked remainder: Qwen retry/additional provider execution, provider configuration, `.env*` output/commit, secret
  value disclosure, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, raw provider error,
  raw prompt, raw payload, raw response, and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                              | Result                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`                                                                    | pass; `requestCount: 0`, `providerCallExecuted: false`, `maxOutputTokens: 8`, redaction passed   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready -Capability providerKey -Intent use_capability`  | pass; capability ready, gate itself performed no env write/read                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready -Capability providerCall -Intent use_capability` | pass; capability ready, gate itself performed no provider call                                   |
| direct PowerShell `.env.local` presence preflight                                                                                                                                                                                    | pass; `ALIBABA_API_KEY present_redacted`                                                         |
| direct PowerShell `.env.local` injection Qwen execute command                                                                                                                                                                        | blocked; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: fail`, redaction passed |
| scoped Prettier write/check                                                                                                                                                                                                          | pass                                                                                             |
| `git diff --check`                                                                                                                                                                                                                   | pass                                                                                             |
| `npm.cmd run lint`                                                                                                                                                                                                                   | pass                                                                                             |
| `npm.cmd run typecheck`                                                                                                                                                                                                              | pass                                                                                             |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                                                                                                             | pass                                                                                             |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                                                                                                        | pass                                                                                             |

## Redaction

This evidence records only AP ids, task ids, file paths, command names, pass/fail status, provider/model ids, env key
aliases, redacted env presence, request counts, token caps, sanitized failure category, duration, and redaction status.
It does not include `.env*` content, provider key values, raw prompts, raw model/provider responses, provider payloads,
secrets, env values, tokens, Authorization headers, database URLs, raw question bank content, student answers, standard
answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML reports, or private file URLs.
