# AP-01 Qwen Provider Config Approval Package Evidence

result: pass
executionDecision: qwen_provider_config_approval_package_ready_execution_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-provider-config-approval-package`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-provider-config-approval-package`
- Batch range: AP-01 Qwen provider config approval package only.
- Commit: `d75e16f0` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: docs/state/evidence/audit only.
- Previous Qwen smoke evidence:
  `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-qwen-env-local-ready.md`
- Provider execution in this task: not run.
- `.env.local` read/write in this task: not performed.

## RED / GREEN

- RED: The previous AP-01 Qwen smoke consumed exactly one redacted `alibaba/qwen-plus` request and stopped with
  sanitized `provider_error`.
- GREEN: Official Bailian configuration requirements and the local runner gap are now documented in a recoverable
  approval package, with no provider call and no `.env.local` read/write.
- BLOCKED: Qwen retry remains blocked until a future fresh task approves runner base URL configuration and then a
  separate one-request retry.

## Official Bailian Configuration Findings

Official sources checked:

- `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- `https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions`
- `https://help.aliyun.com/zh/model-studio/first-api-call-to-qwen`
- `https://help.aliyun.com/zh/model-studio/model-calling-in-sub-workspace`
- `https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope`
- `https://help.aliyun.com/zh/model-studio/qwen-vl-compatible-with-openai`

Findings:

- Bailian Qwen supports OpenAI-compatible access, but the integration must align API Key, `BASE_URL`, and model name.
- For OpenAI-compatible Chat in Beijing / China Mainland, SDK `base_url` is:
  `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- The Beijing HTTP endpoint is:
  `POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`.
- Official examples commonly use environment variable `DASHSCOPE_API_KEY` and model `qwen-plus`.
- Official OpenAI-compatible Chat docs state `model` is required, and exact available model names and pricing should be
  checked in the Bailian console.
- Region and workspace must match the API key:
  - Beijing: `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - Virginia: `https://dashscope-us.aliyuncs.com/compatible-mode/v1`
  - Singapore: `https://{WorkspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`
  - Germany: `https://{WorkspaceId}.eu-central-1.maas.aliyuncs.com/compatible-mode/v1`
  - Japan: `https://{WorkspaceId}.ap-northeast-1.maas.aliyuncs.com/compatible-mode/v1`
- DashScope native API has a different endpoint shape, for example
  `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`, and should not be mixed with the
  OpenAI-compatible `chat/completions` base URL.

## Local Runner Findings

Read-only inspection:

- `node_modules/@ai-sdk/alibaba/dist/index.d.ts`
  - `AlibabaProviderSettings` supports `baseURL?: string`.
  - API key defaults to the `ALIBABA_API_KEY` environment variable.
- `node_modules/@ai-sdk/alibaba/dist/index.mjs`
  - If `baseURL` is not supplied, `createAlibaba()` defaults to
    `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`.
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
  - For provider `alibaba`, the runner calls `createAlibaba({ apiKey, includeUsage: true })`.
  - The runner passes `config.model` into `providerFactory.languageModel(config.model)`.
  - The runner does not currently pass `baseURL` into `createAlibaba()`.
  - The runner does not currently read `ALIBABA_BASE_URL`, `DASHSCOPE_BASE_URL`, `QWEN_BASE_URL`, or `ALIBABA_MODEL`
    from `.env.local`.

Conclusion:

- The previous `alibaba/qwen-plus` smoke may have used the `@ai-sdk/alibaba` default international compatible endpoint
  rather than the Beijing endpoint expected by many Bailian keys.
- This task does not assert that endpoint mismatch is the only cause. Other remaining possibilities include key region,
  workspace mismatch, model entitlement, account quota/billing status, or service enablement.
- Adding extra values to `.env.local` alone will not change the current runner until a later approved code/config task
  wires those values into `createAlibaba()`.

## User-Facing `.env.local` Guidance

Do not commit `.env.local`. Do not share or paste secret values into evidence or chat.

For the current project naming boundary, the recommended user-managed shape is:

```env
ALIBABA_API_KEY=<your Bailian or DashScope API key>
ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus
```

If the API key belongs to another official region or sub-workspace, replace `ALIBABA_BASE_URL` with the matching
official OpenAI-compatible base URL and keep the key from the same region or workspace:

```env
ALIBABA_BASE_URL=https://dashscope-us.aliyuncs.com/compatible-mode/v1
```

```env
ALIBABA_BASE_URL=https://{WorkspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1
```

```env
ALIBABA_BASE_URL=https://{WorkspaceId}.eu-central-1.maas.aliyuncs.com/compatible-mode/v1
```

```env
ALIBABA_BASE_URL=https://{WorkspaceId}.ap-northeast-1.maas.aliyuncs.com/compatible-mode/v1
```

Official examples use `DASHSCOPE_API_KEY`, but this project currently uses `ALIBABA_API_KEY` for `@ai-sdk/alibaba` and
the AP-01 smoke runner. A future approved implementation may optionally add a fallback mapping from `DASHSCOPE_API_KEY`
to `ALIBABA_API_KEY`, but this approval package does not make that source change.

## Proposed Next Approval Package

Recommended next task id:

- `ap-01-qwen-provider-smoke-runner-base-url-config`

Proposed approval boundary:

- Allowed source file if approved: `scripts/ai/run-personal-ai-provider-smoke.mjs`.
- Allowed focused test file if approved: the existing provider smoke runner unit test file, if present or task-scoped.
- Allow runner support for one of these explicit shapes:
  - CLI: `--base-url https://dashscope.aliyuncs.com/compatible-mode/v1` for provider `alibaba`; or
  - environment: `ALIBABA_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Keep `ALIBABA_MODEL=qwen-plus` optional because the current runner already accepts `--model qwen-plus`.
- No provider call during the runner wiring task unless a separate fresh execution approval is attached.
- After runner support is verified by dry run and focused tests, create a separate fresh Qwen retry task with:
  - provider: `alibaba`
  - model: `qwen-plus`
  - base URL host only recorded in evidence, not the key value
  - max requests: `1`
  - max output tokens: `8`
  - timeout: `30000` ms
  - retry limit: `0`
  - max spend: `USD 0.05`
  - redacted evidence only

## Gates

- highest local validation level: L0 docs-only governance.
- localFullLoopGate: L0 docs-only governance only; no app route, role flow, or provider runtime was executed.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after approval package; do not retry Qwen or read `.env.local` in this task.
- nextModuleRunCandidate: `ap-01-qwen-provider-smoke-runner-base-url-config`.
- provider call: blocked.
- provider retry: blocked.
- provider configuration execution: blocked until a fresh task approves runner configuration wiring.
- `.env.local` read/write: blocked in this task.
- Cost Calibration Gate: blocked.
- staging/prod/cloud/deploy: blocked.
- payment/external-service: blocked.
- dependency/schema/migration/product/test/e2e changes: blocked.
- blocked remainder: `.env.local` read/write, Qwen retry, additional provider execution, provider configuration
  execution, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependency, schema/migration,
  product source, test/e2e changes, PR, push, force-push, raw provider payload, raw prompt, raw response, raw error, and
  raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Result |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-config-approval-package.md` | pass   |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-config-approval-package.md` | pass   |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass   |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-config-approval-package`                                                                                                                                                                                                                                                                                                                                                                                                | pass   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-config-approval-package`                                                                                                                                                                                                                                                                                                                                                                                           | pass   |

## Redaction

This evidence records only public official documentation facts, task ids, branch name, local file paths, env key aliases,
placeholder `.env.local` line shapes, provider/model ids, official base URL examples, command names, pass/fail status,
and blocked-gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw DB rows, full
question bank content, student answers, standard answers, cleartext `redeem_code`, screenshots, traces, HTML reports, or
private file URLs.
