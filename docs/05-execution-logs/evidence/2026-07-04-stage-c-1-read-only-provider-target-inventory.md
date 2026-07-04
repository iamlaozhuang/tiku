# 2026-07-04 Stage C-1 Read-Only Provider Target Inventory Evidence

## Task

- Task ID: `stage-c-1-read-only-provider-target-inventory-2026-07-04`
- Branch: `codex/stage-c-1-read-only-provider-target-inventory-2026-07-04`
- Status: completed read-only inventory, governance validation passed

## Redaction Statement

Evidence may include task IDs, file paths, package names, public Provider/model labels, public host labels, public env key
aliases, status categories, validation commands, and redacted summaries only. It must not include credentials, tokens,
cookies, sessions, Authorization headers, env values, connection strings, raw DB rows, internal IDs, PII, phone, email,
plaintext `redeem_code`, Provider payloads, prompt text, raw AI input/output, full generated content, screenshots,
traces, videos, raw DOM, or private fixture data.

## Read-Only Inventory Commands

| Command summary                                                                         | Result         | Evidence use                                                                          |
| --------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | -------- | ---------- | ------ | -------- | ------- | --------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------- |
| `git status --short --branch`                                                           | passed         | Confirmed short branch and clean starting worktree.                                   |
| `Get-Content AGENTS.md` and required ADR/requirements/Stage C documents                 | passed         | Loaded governance and Stage C approval boundaries.                                    |
| `rg ... --glob '!\*_/.env_' ... "@ai-sdk                                                | model_provider | model_config                                                                          | provider | Provider   | Qwen   | qwen     | alibaba | openai                                                    | modelName"` | passed | Located public Provider/model code anchors without reading `.env*`. |
| `rg --files src                                                                         | rg "provider   | model                                                                                 | ai       | generation | config | prompt"` | passed  | Located public source files for targeted follow-up reads. |
| Targeted `Get-Content` / `Select-String` on public source and `package.json` files      | passed         | Confirmed package, adapter, route-integrated Qwen, mock/local, and DB surface labels. |
| Provider/model endpoint call                                                            | not run        | Explicitly forbidden for this inventory.                                              |
| `.env*` file read                                                                       | not run        | Explicitly forbidden for this inventory.                                              |
| DB connection/query/write, browser/e2e/dev-server, staging/prod/cloud, Cost Calibration | not run        | Explicitly out of scope.                                                              |

One exploratory `Select-String` command had a PowerShell quoting error before reading target content. It did not read
`.env*`, call a Provider, or change files; the corrected public-source command was rerun successfully.

## Inventory Result

| Result type                     | Redacted result                                                                                                                                                      | Source anchors                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Installed packages              | `ai`, `@ai-sdk/alibaba`, `@ai-sdk/openai-compatible` are present in public `package.json`.                                                                           | `package.json`; ADR-006                                                                                                                      |
| Adapter provider labels         | `alibaba` and `openai_compatible` are accepted adapter labels; factories are `createAlibaba` and `createOpenAICompatible`.                                           | `src/server/contracts/ai-generation-task-provider-adapter-contract.ts`; `src/server/services/ai-generation-task-provider-adapter-service.ts` |
| Concrete route-integrated label | `modelProvider = openai_compatible`, `providerName = alibaba-qwen`, `modelName = qwen3.7-max`, host label `dashscope.aliyuncs.com`, env key alias `ALIBABA_API_KEY`. | `src/server/services/route-integrated-provider-execution-service.ts`; `src/server/contracts/route-integrated-provider-execution-contract.ts` |
| Route-integrated limits         | `maxRequests = 1`, `maxRetries = 0`, `maxOutputTokens = 1800`, `timeoutMs = 60000`.                                                                                  | `src/server/services/route-integrated-provider-execution-service.ts`                                                                         |
| Owner-preview env boundary      | Runtime control references `ALIBABA_API_KEY`, but no env file or env value was read.                                                                                 | `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`                                                                       |
| Admin sample labels             | Public sample labels include `alibaba` with `qwen-plus`, `qwen-turbo`, and `qwen-turbo-fallback`.                                                                    | `src/server/services/admin-ai-audit-log-ops-service.ts`                                                                                      |
| DB-configurable surface         | `model_provider` and `model_config` support provider key, secret reference/status, base URL, model name, fallback, and redacted metadata.                            | `src/db/schema/ai-rag.ts`; `src/app/api/v1/model-providers/route.ts`; `src/app/api/v1/model-configs/route.ts`                                |
| Local mock labels               | Public local labels include `mock`, `local_deterministic`, and mock/local model names for scoring, explanation, hint, recommendation, and learning suggestion.       | `src/server/services/model-config-runtime.ts`; `src/db/dev-seed.ts`; `src/ai/mock-provider.ts`                                               |

## Boundary Confirmation

- Provider call executed: false
- Env file read: false
- Env value printed/recorded: false
- DB connection/query/write executed: false
- Browser/e2e/dev server executed: false
- Staging/prod/cloud/deploy/payment/external service executed: false
- Cost Calibration executed: false
- Product source/test/package/lockfile/schema/migration/script changed: false
- Release readiness claimed: false
- Final Pass claimed: false
- Production usability claimed: false

## Validation Log

| Command                                                                                                                                                                                  | Result                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `npm.cmd exec -- prettier --write --ignore-unknown <task files>`                                                                                                                         | passed                                       |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                                         | passed                                       |
| `git diff --check`                                                                                                                                                                       | passed                                       |
| `git diff --name-only -- .env* package/lock/source/test/runtime blocked paths`                                                                                                           | passed, no blocked write-scope files changed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-read-only-provider-target-inventory-2026-07-04` | passed                                       |

Pre-commit hook initially used the stale `currentTask` pointer from the prior Stage B closeout task and blocked the new
inventory files as out of scope. `project-state.yaml` `currentTask` was corrected to this task, then scoped governance
validation was rerun successfully.

## Next Approval Boundary

The narrowest discovered next Provider smoke target is:

- target: local-only Stage C-1 Provider smoke
- provider label: `openai_compatible / alibaba-qwen`
- model label: `qwen3.7-max`
- host label: `dashscope.aliyuncs.com`
- maximum calls: 1
- maximum retries: 0
- maximum output tokens: 1800
- timeout: 60000 ms
- evidence: redacted summaries only

Execution remains blocked until the owner gives fresh approval that explicitly permits the Provider call and the necessary
runtime secret access method without printing or committing secret values.
