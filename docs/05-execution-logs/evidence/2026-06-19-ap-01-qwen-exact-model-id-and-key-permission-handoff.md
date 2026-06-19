# AP-01 Qwen exact model id and key permission handoff evidence

result: pass
executionDecision: qwen3_7_max_exact_model_env_handoff_ready_retry_blocked

## Summary

- Task id: `ap-01-qwen-exact-model-id-and-key-permission-handoff`
- Branch: `codex/ap-01-qwen-exact-model-id-and-key-permission-handoff`
- Date: 2026-06-19
- Batch range: AP-01 Qwen exact model id and key permission handoff only.
- Commit: `f0b9be36` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: docs/state only.
- Result: pass.
- Provider calls executed: 0.
- `.env.local` read or modified: no.

## RED / GREEN

- RED: previous AP-01 Qwen post-console retry used `qwen-plus` and failed with sanitized HTTP `403`,
  `providerErrorCode: null`; the remaining ambiguity was exact API model id, key workspace permission, or
  OpenAI-compatible endpoint permission.
- GREEN: official Alibaba Bailian/DashScope documentation and project runner behavior now identify the next explicit
  configuration candidate as Beijing base URL `https://dashscope.aliyuncs.com/compatible-mode/v1`, env key alias
  `ALIBABA_API_KEY`, and model id `qwen3.7-max`, with the next provider call still blocked pending fresh approval.

## User Context

- Platform: Alibaba Bailian / DashScope.
- Region selected in console: `华北2（北京）`.
- Business space: `TIKUProject` / `TIKUProject` as shown in user screenshots.
- Intended next Qwen model: `qwen3.7-max`.
- User screenshot shows an API Key row under `TIKUProject`, but this evidence intentionally does not copy or record any visible masked key fragment.

## Official Documentation Findings

| Topic                                   | Finding                                                                                                                                              | Source                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAI-compatible migration knobs       | Alibaba Bailian Qwen OpenAI-compatible usage requires adjusting API Key, base URL, and model name.                                                   | `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`                                                        |
| Beijing base URL                        | Official Beijing OpenAI-compatible `base_url` is `https://dashscope.aliyuncs.com/compatible-mode/v1`.                                                | `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`; `https://help.aliyun.com/zh/model-studio/get-api-key` |
| API Key env naming in official examples | Official docs commonly use `DASHSCOPE_API_KEY` as the environment variable name.                                                                     | `https://help.aliyun.com/zh/model-studio/configure-api-key-through-environment-variables`                                               |
| Exact model id                          | Official model tables list current Qwen3.7 model id `qwen3.7-max`; dated snapshot ids include `qwen3.7-max-2026-05-20` and `qwen3.7-max-2026-06-08`. | `https://help.aliyun.com/zh/model-studio/text-generation-model/`                                                                        |
| Business-space permission               | API Key permissions are determined by the key's owning business space; sub-business-space keys can call standard models authorized for that space.   | `https://help.aliyun.com/zh/model-studio/get-api-key`; `https://help.aliyun.com/zh/model-studio/permission-management-overview`         |
| Sub-business-space usage                | The permission docs state a sub-business-space API Key can be used directly for that business space.                                                 | `https://help.aliyun.com/zh/model-studio/permission-management-overview`                                                                |

## Project-Specific Findings

| Check                            | Result                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.example` provider key name | `ALIBABA_API_KEY` is present.                                                                                                                 |
| Smoke runner secret behavior     | `scripts/ai/run-personal-ai-provider-smoke.mjs` reads whichever env key is passed by `--env-key`; previous AP-01 tasks use `ALIBABA_API_KEY`. |
| Smoke runner base URL behavior   | `--base-url` is required for `--provider openai_compatible`; the runner does not automatically read `ALIBABA_BASE_URL`.                       |
| Smoke runner model behavior      | Model is passed by `--model`; the runner does not automatically read `ALIBABA_MODEL`.                                                         |
| Current prior Qwen failure       | Latest post-console retry used `qwen-plus` and failed with sanitized HTTP 403, provider error code null.                                      |

## `.env.local` Guidance For This Project

Use the full, unmasked Bailian API Key that belongs to the Beijing `TIKUProject` business space.

```env
ALIBABA_API_KEY=<full Beijing Bailian API Key for TIKUProject>
```

Optional human-readable entries can be kept if you want the intended endpoint/model visible in `.env.local`, but the current smoke runner will not automatically consume them unless a later task changes or wraps the runner:

```env
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen3.7-max
```

For the current project runner, the next approved command must still pass base URL and model explicitly:

```powershell
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen3.7-max --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
```

The actual one-request execution remains blocked until a separate fresh approval explicitly authorizes `qwen3.7-max`.

## Permission Checklist For User Console

- Confirm the key row belongs to the same Beijing `TIKUProject` business space.
- Confirm the key uses the full API Key value shown at creation/reset time, not the masked list value.
- Confirm `Qwen3.7-Max` / API model id `qwen3.7-max` is authorized in `TIKUProject`.
- If key permission is custom IP allowlist, confirm the current outbound IP is allowed.
- Do not share the raw key in chat or evidence.

## Next Fresh Approval Boundary

Recommended next task id:

- `ap-01-qwen3-7-max-one-request-smoke-approval`

Proposed execution boundary for that later task:

- Provider: `openai_compatible`.
- Provider name: `alibaba-qwen`.
- Model: `qwen3.7-max`.
- Env key alias: `ALIBABA_API_KEY`.
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Max requests: 1.
- Max output tokens: 8.
- Timeout: 30000 ms.
- Retry limit: 0.
- Spend ceiling: USD 0.05 or lower.
- Evidence: sanitized HTTP status/provider error code only; no raw prompt, raw response, raw error, provider payload, key, token, Authorization header, or environment value.

Still blocked:

- Provider/model execution until fresh approval.
- Any additional provider call.
- Any model id different from `qwen3.7-max`.
- Cost Calibration Gate.
- Staging/prod/cloud/deploy.
- Provider source/configuration changes.
- `.env.local` edits by Codex.
- Business code, tests, e2e, schema, migration, dependency, package, lockfile, script changes.

## Gates

- localFullLoopGate: not applicable; this is a docs-only AP-01 provider handoff, not an app route or full local business
  flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after docs-only handoff; do not read `.env.local`, do not retry Qwen, and do not inspect
  raw provider details in this task.
- nextModuleRunCandidate: `ap-01-qwen3-7-max-one-request-smoke-approval`.
- blocked remainder: provider/model execution, additional provider calls, model ids other than `qwen3.7-max`,
  `.env.local` reads/writes/value output, raw provider diagnostics, provider configuration source changes, Cost
  Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies, package/lockfiles,
  schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, raw provider error,
  raw prompt, raw payload, raw response, and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Commands And Validation

| Command                                                                                                                                                                                   | Result                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `git status --short --branch`                                                                                                                                                             | pass; clean branch before edits |
| `git switch -c codex/ap-01-qwen-exact-model-id-and-key-permission-handoff`                                                                                                                | pass                            |
| Official Alibaba documentation research                                                                                                                                                   | pass                            |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                    | pass                            |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                    | pass                            |
| `git diff --check`                                                                                                                                                                        | pass                            |
| `npm.cmd run lint`                                                                                                                                                                        | pass                            |
| `npm.cmd run typecheck`                                                                                                                                                                   | pass                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-exact-model-id-and-key-permission-handoff`      | pass                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-exact-model-id-and-key-permission-handoff` | pass after closeout fields      |

## Redaction Statement

This evidence does not include `.env.local` contents, raw API key, masked key fragment, token, Authorization header, provider payload, raw prompt, raw response, raw error text, database URL, screenshot file copy, trace, or HTML report.
