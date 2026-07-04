# 2026-07-04 Stage C-1 Read-Only Provider Target Inventory

## Status

- Task ID: `stage-c-1-read-only-provider-target-inventory-2026-07-04`
- Inventory status: completed read-only inventory
- Execution status: not executed
- Provider call: not executed
- `.env*` read: false
- DB/browser/dev-server/staging/Cost Calibration: not executed

This file lists Provider/model labels discoverable from committed public code and public configuration only. It is not a
Provider smoke result and does not prove credentials, runtime reachability, model quality, cost, staging readiness,
release readiness, final Pass, production usability, or production safety.

## Read Boundary

Allowed sources used:

- `package.json`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `src/server/contracts/ai-generation-task-provider-adapter-contract.ts`
- `src/server/services/ai-generation-task-provider-adapter-service.ts`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/model-config-runtime.ts`
- `src/db/schema/ai-rag.ts`
- `src/db/dev-seed.ts`
- `src/app/api/v1/model-providers/route.ts`
- `src/app/api/v1/model-configs/route.ts`
- `src/app/api/v1/model-configs/[publicId]/test-connection/route.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`

Forbidden sources/actions remained unused:

- `.env*` files were not read.
- Provider/model endpoints were not called.
- DB was not connected or queried.
- Browser/e2e/dev server was not used.
- Source, tests, dependencies, schemas, migrations, scripts, and lockfiles were not changed.

## Candidate Provider And Model Labels

| Candidate class                  | Provider label                | Model label(s)                                                                                                                                                                                                      | Source anchor                                                                                                                                                | Stage C-1 reading                                                                                                                                                                                   |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installed package capability     | `alibaba`                     | caller-supplied model name                                                                                                                                                                                          | `package.json`; `src/server/contracts/ai-generation-task-provider-adapter-contract.ts`; `src/server/services/ai-generation-task-provider-adapter-service.ts` | Package and adapter support exist through `@ai-sdk/alibaba` / `createAlibaba` / `languageModel`. No concrete active runtime model or secret was verified.                                           |
| Installed package capability     | `openai_compatible`           | caller-supplied model name                                                                                                                                                                                          | `package.json`; `src/server/contracts/ai-generation-task-provider-adapter-contract.ts`; `src/server/services/ai-generation-task-provider-adapter-service.ts` | Package and adapter support exist through `@ai-sdk/openai-compatible` / `createOpenAICompatible` / `languageModel`. Base URL is required for an OpenAI-compatible target.                           |
| Route-integrated Qwen candidate  | `openai_compatible`           | `qwen3.7-max`                                                                                                                                                                                                       | `src/server/services/route-integrated-provider-execution-service.ts`; `src/server/contracts/route-integrated-provider-execution-contract.ts`                 | This is the only concrete real Provider smoke candidate found in route-integrated execution code. Public metadata also names `providerName = alibaba-qwen` and host label `dashscope.aliyuncs.com`. |
| Owner-preview Qwen control       | `alibaba-qwen` via metadata   | `qwen3.7-max`                                                                                                                                                                                                       | `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`                                                                                       | Control code can read the public env key alias `ALIBABA_API_KEY` from runtime env, but this inventory did not read any env value or execute that path.                                              |
| Admin sample model-config labels | `alibaba`                     | `qwen-plus`, `qwen-turbo`, `qwen-turbo-fallback`                                                                                                                                                                    | `src/server/services/admin-ai-audit-log-ops-service.ts`                                                                                                      | These are sample/admin-management labels in committed code. They are not confirmed as active DB runtime targets because no DB/API/runtime call was approved or executed.                            |
| DB-configurable Provider surface | DB `model_provider` row       | DB `model_config.model_name` row                                                                                                                                                                                    | `src/db/schema/ai-rag.ts`; API route files under `src/app/api/v1/model-providers` and `src/app/api/v1/model-configs`                                         | The schema supports configured provider/model rows, secret references, base URL, fallback, and redacted metadata. Current local/staging DB contents are unknown in this read-only, no-DB inventory. |
| Local mock/runtime labels        | `mock`, `local_deterministic` | `mock-ai-scoring`, `mock-ai-scoring-fallback`, `mock-ai-explanation`, `mock-ai-explanation-fallback`, `mock-ai-hint`, `local-kn-recommendation-v1`, `mock-learning-suggestion`, `mock-learning-suggestion-fallback` | `src/server/services/model-config-runtime.ts`; `src/db/dev-seed.ts`; `src/ai/mock-provider.ts`                                                               | These are local deterministic/mock labels, useful for local non-Provider behavior. They are not external Provider smoke targets and should not be used to claim Provider readiness.                 |

## Non-Candidate Or Deferred Labels

| Label/source                                               | Status                                                                                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zhipu-ai-provider`, `@ai-sdk/openai`, `@ai-sdk/anthropic` | Mentioned historically in ADR-001 as ecosystem options, but not installed in current `package.json`. Introducing them would require a separate dependency gate. |
| Any model label only present in old execution evidence     | Historical provenance only unless current public code/config also exposes it.                                                                                   |
| Any secret, key, endpoint credential, or env value         | Not inventoried. `.env*` and private secret sources were intentionally not read.                                                                                |

## Recommended Stage C-1 Approval Target Options

Option A is the narrowest concrete Provider smoke target discovered from current source:

```text
Approve Stage C-1 Provider smoke for local-only Tiku using provider label openai_compatible / alibaba-qwen,
model label qwen3.7-max, host label dashscope.aliyuncs.com, max 1 call, max 0 retries, max output tokens 1800,
timeout 60000 ms, synthetic/reviewed non-sensitive data only, no raw prompts/payloads/AI output/secrets in evidence,
stop on first unsafe/costly/unstable failure, and no release readiness/final Pass/production claim.
```

Option B is a decision-only alternative if the owner wants to test the admin `model_config` path instead of the
route-integrated Qwen path:

```text
Approve a separate Stage C-1 target-decision task to choose one admin model_config label from qwen-plus, qwen-turbo,
or qwen-turbo-fallback, confirm whether it is a public sample label or a runtime DB row, and only then request Provider
smoke approval.
```

## Open Decisions Before Any Provider Smoke

- Which target to run: route-integrated `openai_compatible / alibaba-qwen / qwen3.7-max`, or a separately confirmed
  admin `model_config` target.
- Whether the next task may read the runtime secret source for `ALIBABA_API_KEY` without printing or committing the
  value.
- Exact data class and prompt fixture for the smoke, with no raw prompt or raw AI output in committed evidence.
- Maximum spend/call count and stop authority.
- Whether Stage C-3 Cost Calibration waits for a successful C-1 smoke or uses a separate fresh approval path.

## Explicit Non-Claims

- No Provider readiness.
- No model quality result.
- No credential availability result.
- No staging readiness.
- No Cost Calibration result.
- No release readiness.
- No final Pass.
- No production usability.
