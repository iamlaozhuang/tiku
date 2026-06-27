# Layer 3 Provider Smoke Local Dev Redacted Execution Approval Package Acceptance

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27`

Decision: `PROVIDER_SMOKE_EXECUTION_APPROVAL_PACKAGE_PREPARED_EXECUTION_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This acceptance document prepares a Provider smoke execution approval package only. It does not execute Provider calls,
read or output credentials, read `.env*`, change Provider configuration, run Cost Calibration, connect to DB, run browser,
dev-server, or e2e, mutate runtime state, publish content, touch staging/prod/deploy/payment/external service, run
OCR/export, create PRs, force push, claim release readiness, or claim final Pass.

## Provider Smoke Execution Boundary

Future execution must choose exactly one Provider path and must stop if the future approval does not name that path.

| Path          | Provider/model candidate                    | Credential alias       | Execution status after this task                                                                                     |
| ------------- | ------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Preferred     | `alibaba` / `qwen-plus`                     | `ALIBABA_API_KEY`      | Candidate only; future execution approval required before any credential use or Provider call                        |
| Alternate     | `openai_compatible_dashscope` / `qwen-plus` | `ALIBABA_API_KEY`      | Candidate only; future execution approval must name endpoint/base URL boundary if this path is selected              |
| Future custom | Owner-named Provider/model                  | Owner-named alias only | Blocked unless the future approval names Provider, model, alias, endpoint/config boundary, caps, and redaction rules |

## Caps And Stop Rules

| Control               | Future execution cap or rule                                      | Notes                                                                          |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Provider target count | `1`                                                               | No fallback chain or second Provider without fresh approval                    |
| Call cap              | `1`                                                               | No retry loop, no second request                                               |
| Retry cap             | `0`                                                               | Failure becomes `blocked` or `fail`; retry needs fresh approval                |
| Max output tokens     | `64`                                                              | Output text itself must not be copied into evidence                            |
| Timeout cap           | `30000ms`                                                         | Timeout becomes blocked/fail evidence only                                     |
| Spend stop limit      | `USD 0.05`                                                        | Stop limit only; not pricing, quota default, or Cost Calibration               |
| Prompt envelope       | Synthetic or already-approved minimal prompt only                 | Raw prompt must not be logged                                                  |
| Evidence mode         | Redacted envelope only                                            | Provider/model labels, pass/fail/blocked, counts, cap status, redaction status |
| Stop condition        | Any need to read/output secret, inspect payload, retry, or config | Stop and request fresh approval                                                |

## Credential And Redaction Boundary

Future execution evidence may record only:

- provider label;
- model label;
- pass/fail/blocked;
- call count;
- retry count;
- cap status;
- redaction status;
- stop condition;
- forbidden-action checklist.

Future execution evidence must not record:

- `.env*` content;
- secret/token/API key/DB URL values;
- Authorization headers;
- raw prompt;
- raw response;
- Provider payload;
- raw generated AI content;
- full `paper` or `material` content;
- DB rows or SQL output;
- screenshots, traces, localStorage, cookies, or private account material.

## Serial Order After This Package

1. Close this docs/state Provider smoke approval package.
2. Stop for fresh Provider smoke execution approval.
3. If approved, execute exactly one local dev redacted Provider smoke using the selected candidate and caps.
4. Roll up Provider smoke evidence in a docs/state-only task.
5. Decide whether Cost Calibration is still needed or deferred; Cost Calibration execution remains a separate fresh
   approval.
6. Keep staging/prod/deploy, payment/external-service, OCR/export, release readiness, and final Pass blocked until their
   own approvals.

## Copyable Next Approval Text

```text
我 fresh approve 一个 Layer 3 local dev redacted Provider smoke execution 任务：
layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27。
允许选择一个 Provider 路径，优先 `alibaba` / `qwen-plus`，credential alias 为 `ALIBABA_API_KEY`；如选择
`openai_compatible_dashscope` / `qwen-plus`，必须只使用本审批文本中命名的 endpoint/base URL 边界。允许最多一次
Provider smoke 调用、零 retry、max output tokens 64、timeout 30000ms、spend stop limit USD 0.05。允许只记录
provider label、model label、pass/fail/blocked、call count、retry count、cap status、redaction status、stop condition
和 forbidden-action checklist。
禁止打开、输出、复制、记录或提交任何 .env* 内容、secret、token、DB URL、Provider credential、Authorization header、
raw prompt、raw response、Provider payload、raw generated AI content、完整 paper/material 内容、DB row、SQL output、
截图、trace、cookie/localStorage。禁止浏览器/dev-server/e2e、DB 连接或读写、Provider configuration 变更、第二次调用、
retry loop、Cost Calibration、真实 mutation、formal publish、student-visible runtime、staging/prod/deploy/payment
external service、OCR/export、PR、force push、release readiness 或 final Pass。
```

## Remaining Task Estimate

| Slice                                 | Estimated tasks | Notes                                                                                                     |
| ------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| Provider-only Layer 3 smoke path      | 1-2 tasks       | one execution task if approved, then optional docs/state rollup                                           |
| Cost Calibration after Provider smoke | 2-4 tasks       | approval package, execution if approved, rollup, optional defer/default decision                          |
| staging/prod/deploy pre-release       | 2-4 tasks       | staging package, staging execution if approved, prod/deploy decision package, release-boundary rollup     |
| Clear high-risk package queue noise   | 2-4 tasks       | nonterminal status apply and archive/index apply still need fresh approval                                |
| Release readiness/final Pass          | 1+ tasks        | only after selected Provider/cost/pre-release gates have evidence and owner gives separate final approval |

These are estimates, not execution authorization.

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, migration, seed, rollback, destructive operation, broad scan, raw row dump, or runtime
  mutation was run.
- No credential, token, `.env*`, Authorization header, Provider payload, raw prompt, raw response, or raw generated
  output was read.
- No Provider call/configuration/retry or Cost Calibration was executed.
- No formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export, archive/index
  movement, PR, force push, release readiness, production readiness, final Pass, or Layer 3 readiness is claimed.
