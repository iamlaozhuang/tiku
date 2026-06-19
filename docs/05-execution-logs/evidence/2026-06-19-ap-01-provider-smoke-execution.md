# AP-01 Provider Smoke Execution Evidence

result: blocked
executionDecision: blocked_missing_deepseek_process_env_no_provider_call

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution`
- Batch range: AP-01 DeepSeek only.
- Commit: `513b414c` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: one redacted local process provider smoke against DeepSeek `deepseek-v4-flash`.

## RED / GREEN

- RED: AP-01 provider execution was blocked until a fresh approval named one provider/model and exact command boundary.
- GREEN: blocked evidence captured without provider call or spend because the current process environment did not expose
  `DEEPSEEK_API_KEY`.

## Runtime Failure Summary

- First execute attempt: command quoting error prevented `TIKU_PROVIDER_SMOKE_APPROVED` from being set; the runner
  returned `missing_execution_approval` with `requestCount: 0` and `providerCallExecuted: false`.
- Corrected execute attempt: runner passed the approval gate but could not find process environment alias
  `DEEPSEEK_API_KEY`; it returned `missing_env` with `requestCount: 0` and `providerCallExecuted: false`.
- No provider request was sent.
- No provider cost was incurred by this task.
- No `.env*` file was read.
- Qwen and all second-provider execution remain blocked.

## Gates

- localFullLoopGate: not applicable; this is a provider smoke only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after blocked DeepSeek evidence; do not run Qwen.
- nextModuleRunCandidate: `ap-01-provider-smoke-execution-deepseek-process-env-ready`.
- blocked remainder: Qwen or any second provider execution, provider configuration, `.env*` read/write/output, secret/env
  value disclosure, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                         | Result                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible ... --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `maxOutputTokens: 8`, redaction passed                                         |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability providerKey -Intent use_capability`        | pass; task-specific capability ready, no execution by gate                                                                             |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability providerCall -Intent use_capability`       | pass; task-specific capability ready, no execution by gate                                                                             |
| malformed `powershell.exe -NoProfile -Command ... --execute` command                            | blocked; quoting prevented approval env from being set, `missing_execution_approval`, `requestCount: 0`, `providerCallExecuted: false` |
| corrected `powershell.exe -NoProfile -Command ... --execute` command                            | blocked; `missing_env` for `DEEPSEEK_API_KEY`, `requestCount: 0`, `providerCallExecuted: false`, redaction passed                      |
| scoped Prettier write/check                                                                     | pass                                                                                                                                   |
| `git diff --check`                                                                              | pass                                                                                                                                   |
| `npm.cmd run lint`                                                                              | pass                                                                                                                                   |
| `npm.cmd run typecheck`                                                                         | pass                                                                                                                                   |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                        | pass                                                                                                                                   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                   | pass after evidence execute-command anchor correction                                                                                  |

## Redaction

This evidence records only AP ids, task ids, file paths, command names, pass/fail status, provider/model ids, env key
aliases, request counts, token caps, sanitized usage summary if returned, failure category if any, and redaction status.
It does not include `.env*` content, provider key values, raw prompts, raw model/provider responses, provider payloads,
secrets, env values, tokens, Authorization headers, database URLs, raw question bank content, student answers, standard
answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML reports, or private file URLs.
