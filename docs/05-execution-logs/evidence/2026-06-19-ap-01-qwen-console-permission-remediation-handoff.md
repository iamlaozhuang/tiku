# AP-01 Qwen Console Permission Remediation Handoff Evidence

result: pass
executionDecision: qwen_console_permission_handoff_ready_retry_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-console-permission-remediation-handoff`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-console-permission-remediation-handoff`
- Batch range: AP-01 Qwen console permission remediation handoff only.
- Commit: `fd390158` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: docs-only handoff from the prior sanitized HTTP `403` diagnostic and the user-provided Bailian/DashScope
  console screenshot.
- `.env.local` content read/write in this task: none.
- Provider/model calls in this task: none.

## RED / GREEN

- RED: the previous approved one-request Qwen diagnostic returned sanitized HTTP `403` with
  `providerErrorCode: null`, leaving account/workspace/model/key permission as the likely remaining blocker.
- GREEN: the screenshot-derived handoff is recorded without reading `.env.local`, without outputting any key, and without
  sending any provider request.

## Console Facts From User-Provided Screenshot

Confirmed:

- Console: Bailian/DashScope business space management.
- Region: `华北2（北京）`.
- Workspace/business space: `TIKUProject`.
- Visible page: model list.
- Visible authorized model invocation rows include:
  - `Qwen3.7-Plus`
  - `Qwen3.7-Max`
  - `Qwen3.6-Plus`

Not confirmed by the screenshot:

- Whether the local `ALIBABA_API_KEY` belongs to the same Beijing `TIKUProject` workspace/sub-workspace.
- Whether the exact API model id `qwen-plus` is enabled for this workspace through the OpenAI-compatible endpoint.
- Whether the key has permission for `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Any raw key value, Authorization header, raw provider error, or raw console secret.

## Handoff For User Console Remediation

Before approving another Qwen request, the user should confirm:

1. The console region remains `华北2（北京）`.
2. The selected business space remains `TIKUProject`.
3. The API key stored locally as `ALIBABA_API_KEY` was created for, or has access to, that same workspace/sub-workspace.
4. The intended retry model id is valid for API calls. If the API reference or model detail page shows a model id other
   than `qwen-plus`, the next retry approval must explicitly state that changed model id.
5. The key has permission for the OpenAI-compatible endpoint
   `https://dashscope.aliyuncs.com/compatible-mode/v1`.
6. No key value, raw Authorization header, raw provider error, or raw console secret should be pasted into chat or
   evidence.

## Gates

- localFullLoopGate: not applicable; this is docs-only provider permission handoff, not an app route or local business
  flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after docs-only handoff; do not retry Qwen until the user confirms console remediation
  and fresh-approves one request.
- nextModuleRunCandidate: `ap-01-qwen-one-request-post-console-remediation-retry-approval`.
- blocked remainder: `.env*` read/write/value output, Qwen retry, additional provider execution, raw provider
  diagnostics, provider configuration changes, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, dependencies, schema/drizzle/migration, product source, tests/e2e changes, PR, push, force
  push, destructive DB, raw provider error, raw prompt, raw payload, raw response, screenshots, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                 | Result |
| ------------------------------------------------------------------------------------------------------- | ------ |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                  | pass   |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                  | pass   |
| `git diff --check`                                                                                      | pass   |
| `npm.cmd run lint`                                                                                      | pass   |
| `npm.cmd run typecheck`                                                                                 | pass   |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-console-permission-remediation-handoff`      | pass   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-console-permission-remediation-handoff` | pass   |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public provider/model/base URL
host, public console labels visible in the user-provided screenshot, pass/fail status, and blocked gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw screenshots, raw
question bank content, student answers, standard answers, cleartext `redeem_code`, private row data, traces, HTML
reports, or private file URLs.
