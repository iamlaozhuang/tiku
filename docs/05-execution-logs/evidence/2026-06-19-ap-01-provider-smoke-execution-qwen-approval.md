# AP-01 Provider Smoke Execution Qwen Approval Evidence

result: pass
executionDecision: qwen_provider_smoke_approval_ready_execution_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-qwen-approval`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-qwen-approval`
- Batch range: AP-01 Qwen approval and local key handoff only.
- Commit: `d20bd85e` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: define the second-provider Qwen smoke boundary and local `.env.local` handoff. No Qwen provider call executed.

## RED / GREEN

- RED: DeepSeek smoke passed, but the second-provider Qwen smoke still lacks a user-confirmed local key handoff and a
  fresh execution task.
- GREEN: This task records the Qwen provider/model/env/request/cost/redaction boundaries and the exact user-managed
  `.env.local` line shape, while keeping Qwen execution blocked.

## Qwen Boundary

- Provider adapter: `alibaba`
- Model: `qwen-plus`
- Env key alias: `ALIBABA_API_KEY`
- Local user-managed file: `D:\tiku\.env.local`
- Future execution entrypoint: `scripts/ai/run-personal-ai-provider-smoke.mjs`
- Future command shape:
  `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --execute`
- Future execution approval flag: `TIKU_PROVIDER_SMOKE_APPROVED=1`
- Max requests: `1`
- Max output tokens: `8`
- Timeout: `30000` ms
- Retry limit: `0`
- Max spend: `USD 0.05`
- Evidence mode: redacted envelope only.

## User Key Handoff

The user may now add this line to local-only `D:\tiku\.env.local`:

```env
ALIBABA_API_KEY=<your Alibaba Cloud Bailian/DashScope API key>
```

Rules:

- Do not send the key value in chat.
- Do not commit `.env.local`.
- Prefer no quotes unless the key provider explicitly requires them.
- After saving the file, tell Codex only: `已写入 ALIBABA_API_KEY，可以继续`.

## Gates

- localFullLoopGate: not applicable; this is provider smoke governance only, not an app route or full local business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after Qwen approval/handoff; do not execute Qwen in this task.
- nextModuleRunCandidate: `ap-01-provider-smoke-execution-qwen-env-local-ready`.
- blocked remainder: Qwen provider execution until user confirms the key and opens the next execution task, provider
  configuration, `.env*` read/write/output/commit by Codex in this task, secret value disclosure, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment/external-service, dependencies, schema/drizzle/migration, product source,
  tests/e2e changes, PR, push, force push, destructive DB, and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                        | Result                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `git check-ignore -v .env.local`                                                                                                                                                                                               | pass; `.env.local` is ignored, no content read                                                 |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`                                                              | pass; `requestCount: 0`, `providerCallExecuted: false`, `maxOutputTokens: 8`, redaction passed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval -Capability providerKey -Intent declare_adapter`  | pass; destination confirmation adapter declared, no env write/read                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval -Capability providerCall -Intent declare_adapter` | pass; provider call adapter declared, no provider execution                                    |
| scoped Prettier write/check                                                                                                                                                                                                    | pass                                                                                           |
| `git diff --check`                                                                                                                                                                                                             | pass                                                                                           |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                                                                                                       | pass                                                                                           |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                                                                                                  | pass                                                                                           |

## Redaction

This evidence records only AP ids, task ids, use case ids, public file paths, provider/model ids, env key aliases,
command names, status decisions, request/token/cost ceilings, and handoff boundaries. It does not include `.env*`
content, provider key values, raw prompts, raw model/provider responses, provider payloads, secrets, env values, tokens,
Authorization headers, database URLs, raw question bank content, student answers, standard answers, cleartext
`redeem_code`, private row data, screenshots, traces, HTML reports, or private file URLs.
