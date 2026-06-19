# AP-01 Provider Smoke Execution DeepSeek env.local Ready Evidence

result: pass
executionDecision: deepseek_provider_smoke_pass_env_local_redacted

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-deepseek-env-local-ready`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-deepseek-env-local-ready`
- Batch range: AP-01 DeepSeek only.
- Commit: `70de0459` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: one redacted local dev provider smoke against DeepSeek `deepseek-v4-flash`, reading only
  `DEEPSEEK_API_KEY` from `.env.local`.

## RED / GREEN

- RED: AP-01 provider execution was previously blocked by missing visible `DEEPSEEK_API_KEY`.
- GREEN: DeepSeek `deepseek-v4-flash` provider smoke passed with one request, fixed `maxOutputTokens: 8`, retry limit 0,
  and redacted evidence only.

## Runtime Summary

- `.env.local` was read only for `DEEPSEEK_API_KEY`.
- The key value was injected only into the child command process and cleared after execution.
- The key value was not printed, copied, staged, committed, or written to evidence.
- First nested `powershell.exe -Command` preflight/execute attempt failed due command quoting before provider execution;
  no provider request was sent by that attempt.
- Corrected direct PowerShell script executed exactly one DeepSeek provider request.
- Provider smoke result: pass.
- Request count: `1`.
- Provider call executed: `true`.
- Result status: `pass`.
- Failure category: `null`.
- Duration: `1095` ms.
- Usage summary: `inputTokens=18`, `outputTokens=8`, `totalTokens=26`, `reasoningTokens=8`,
  `cachedInputTokens=0`.
- Redaction status: `passed`.
- Qwen and all second-provider execution remain blocked.

## Gates

- localFullLoopGate: not applicable; this is a provider smoke only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after DeepSeek result; do not run Qwen in this task.
- nextModuleRunCandidate: `ap-01-provider-smoke-execution-qwen-approval`.
- blocked remainder: Qwen or any second provider execution, provider configuration, `.env*` output/commit, secret value
  disclosure, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                           | Result                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `maxOutputTokens: 8`, redaction passed         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-deepseek-env-local-ready -Capability providerKey -Intent use_capability`           | pass; capability ready, gate itself performed no real local action                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-deepseek-env-local-ready -Capability providerCall -Intent use_capability`          | pass; capability ready, gate itself performed no real provider call                                    |
| nested `powershell.exe -Command` preflight and execute attempt                                                                                                                                                                                    | blocked by command quoting before provider execution; no provider request sent                         |
| corrected direct PowerShell `.env.local` presence preflight                                                                                                                                                                                       | pass; `DEEPSEEK_API_KEY present_redacted`                                                              |
| corrected direct PowerShell `.env.local` injection DeepSeek execute command                                                                                                                                                                       | pass; `requestCount: 1`, `providerCallExecuted: true`, `resultStatus: pass`, `redactionStatus: passed` |
| scoped Prettier write/check                                                                                                                                                                                                                       | pass                                                                                                   |
| `git diff --check`                                                                                                                                                                                                                                | pass                                                                                                   |
| `npm.cmd run lint`                                                                                                                                                                                                                                | pass                                                                                                   |
| `npm.cmd run typecheck`                                                                                                                                                                                                                           | pass                                                                                                   |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                                                                                                                          | pass                                                                                                   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                                                                                                                     | pass after evidence command-anchor correction                                                          |

## Redaction

This evidence records only AP ids, task ids, file paths, command names, pass/fail status, provider/model ids, env key
aliases, redacted env presence, request counts, token caps, sanitized usage summary, failure category, duration bucketed
as a millisecond count, and redaction status. It does not include `.env*` content, provider key values, raw prompts, raw
model/provider responses, provider payloads, secrets, env values, tokens, Authorization headers, database URLs, raw
question bank content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces,
HTML reports, or private file URLs.
