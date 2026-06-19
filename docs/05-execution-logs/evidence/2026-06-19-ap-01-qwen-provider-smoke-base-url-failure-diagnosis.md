# AP-01 Qwen Provider Smoke Base URL Failure Diagnosis Evidence

result: pass
executionDecision: qwen_base_url_failure_diagnosis_complete_retry_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- Batch range: AP-01 Qwen failure diagnosis only.
- Commit: `553ffff7` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: read-only diagnosis after one redacted Qwen provider smoke with explicit base URL returned sanitized
  `provider_error`.
- Provider execution in this task: not run.
- `.env.local` content read/write in this task: not performed.

## RED / GREEN

- RED: `ap-01-qwen-provider-smoke-execution-base-url-ready` sent exactly one Qwen request with explicit Alibaba base URL
  and returned sanitized `failureCategory: provider_error`.
- GREEN: read-only official documentation lookup and local runner/provider package inspection completed without reading
  `.env.local` secret values and without sending any provider request.
- BLOCKED: any retry or provider/model execution remains blocked for a later fresh task.

## Diagnosis Findings

Confirmed locally:

- The latest failed AP-01 Qwen task executed exactly one provider request with provider `alibaba`, model `qwen-plus`,
  explicit public base URL host `dashscope.aliyuncs.com`, `requestCount: 1`, `providerCallExecuted: true`, and sanitized
  `failureCategory: provider_error`.
- `git check-ignore -v .env.local` confirms `.env.local` is ignored; this task did not read, print, copy, stage, commit,
  or modify `.env.local`.
- The smoke runner already passes explicit `--base-url` into `createAlibaba({ baseURL: ... })` and passes the credential
  as an explicit `apiKey`; therefore the local env alias `ALIBABA_API_KEY` is not itself a provider-protocol mismatch in
  this runner path.
- Installed `@ai-sdk/alibaba` `1.0.28` builds chat requests as `${baseURL}/chat/completions`, uses bearer auth, accepts
  `baseURL`, accepts an explicit `apiKey`, and includes `qwen-plus` in its model id surface.
- With explicit base URL `https://dashscope.aliyuncs.com/compatible-mode/v1`, the local call path aligns with Alibaba
  Cloud public Beijing-region OpenAI-compatible Chat Completions endpoint.
- The AI SDK Alibaba provider default base URL is the international DashScope OpenAI-compatible endpoint, but this is
  overridden by the explicit Beijing base URL in the failed AP-01 retry.

Official documentation facts checked:

- Alibaba Cloud documents Beijing-region OpenAI-compatible Chat Completions with base URL
  `https://dashscope.aliyuncs.com/compatible-mode/v1` and endpoint path `/chat/completions`.
- Alibaba Cloud examples use model `qwen-plus` for OpenAI-compatible chat calls.
- Alibaba Cloud API key guidance requires the API key, region/base URL, and model name to match the selected account and
  workspace context.
- Non-Beijing regions may require region-specific or workspace-specific base URLs, including `{WorkspaceId}` domains for
  Singapore/Germany/Japan style endpoints.
- Sub-workspace calls require an API key created in that sub-workspace, and standard models such as `qwen-plus` must be
  granted model call permission in that sub-workspace.
- Official error guidance maps authorization failures to possible invalid workspace, endpoint/region mismatch, missing
  workspace membership, model access denial, or unsupported model/API-mode combinations.
- Fine-tuned/deployed models can have different API-mode support; Alibaba Cloud documentation states some deployed
  fine-tuned model paths support DashScope native mode rather than OpenAI-compatible mode.

Current root-cause hypothesis:

- The local runner/provider wiring and Beijing OpenAI-compatible URL/model shape are aligned. The most likely remaining
  causes are console/account-side: API key region mismatch, API key workspace mismatch, sub-workspace permission missing,
  `qwen-plus` entitlement not enabled for the current workspace, or a key type that is not valid for this model API call
  surface.
- Switching from provider `alibaba` to the runner's generic `openai_compatible` path is not expected to fix
  region/workspace/model-permission problems by itself, because the Alibaba provider already uses the OpenAI-compatible
  `/chat/completions` path. It can still be useful as a later one-request isolation test after console checks confirm the
  exact base URL and model.

Sources:

- https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions
- https://help.aliyun.com/zh/model-studio/get-api-key
- https://help.aliyun.com/zh/model-studio/model-calling-in-sub-workspace
- https://help.aliyun.com/zh/model-studio/error-code
- https://ai-sdk.dev/providers/ai-sdk-providers/alibaba

## User Console Checklist Before Any Retry

User-side checks to complete before approving another one-request retry:

- Confirm the API key belongs to the same Alibaba Cloud site/region intended for the call. If the key is not Beijing
  mainland, do not reuse `dashscope.aliyuncs.com`; use the official region/workspace base URL for that key.
- Confirm whether the key belongs to the main workspace or a sub-workspace. If it is a sub-workspace key, confirm it was
  generated inside that sub-workspace and that the sub-workspace has standard model permission for `qwen-plus`.
- Confirm `qwen-plus` appears as callable/available in the same 百炼/DashScope workspace that owns the key.
- If the console recommends a workspace-specific endpoint, provide only the public base URL host/path for the next task;
  do not share the key value.
- If `qwen-plus` is not enabled, choose one console-confirmed model name for the next retry, such as another available
  Qwen chat model, and keep the next task to exactly one request.
- If the intended model is fine-tuned or separately deployed, do not assume OpenAI-compatible mode; confirm the supported
  API mode in the console first.

## Retry Recommendation

Recommended next task after user console confirmation:

- If the key is Beijing-region main workspace and `qwen-plus` is confirmed callable, approve one isolation retry using
  the existing runner with provider `openai_compatible`, provider name `alibaba-qwen`, explicit base URL
  `https://dashscope.aliyuncs.com/compatible-mode/v1`, model `qwen-plus`, `maxRequests=1`, `maxOutputTokens=8`,
  `timeoutMs=30000`, retry limit `0`, and the same redaction boundary.
- If the key belongs to a non-Beijing region or workspace-specific endpoint, approve one retry with the exact official
  base URL for that key/workspace and the console-confirmed model name.
- Do not run any additional Qwen retry until that fresh approval exists.

## Gates

- localFullLoopGate: not applicable; this is provider failure diagnosis only, not an app route or full local business
  flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after read-only diagnosis; do not read secret values or send any provider request in
  this task.
- nextModuleRunCandidate: `ap-01-qwen-openai-compatible-one-request-isolation-smoke` only after user confirms the
  correct Alibaba Cloud key region, workspace, model permission, and base URL.
- blocked remainder: `.env*` content reads/writes, Qwen retry/additional provider execution, provider configuration
  changes, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source, tests/e2e changes, PR, push, force push, destructive DB, raw provider error,
  raw prompt, raw payload, raw response, and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                    | Result                                                 |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `git check-ignore -v .env.local`                                                                           | pass: `.env.local` is ignored; secret content not read |
| read-only official Alibaba Cloud DashScope/Bailian documentation lookup                                    | pass                                                   |
| read-only local runner/provider package inspection                                                         | pass                                                   |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                     | pass                                                   |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                     | pass                                                   |
| `git diff --check`                                                                                         | pass                                                   |
| `npm.cmd run lint`                                                                                         | pass                                                   |
| `npm.cmd run typecheck`                                                                                    | pass                                                   |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-base-url-failure-diagnosis`      | pass                                                   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-base-url-failure-diagnosis` | pass                                                   |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public documentation facts,
provider/model ids, public base URL host, env key aliases, pass/fail status, redacted prior failure category, and blocked
gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw question bank
content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML
reports, or private file URLs.
