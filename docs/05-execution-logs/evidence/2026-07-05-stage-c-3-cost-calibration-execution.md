# 2026-07-05 Stage C-3 Cost Calibration Execution Evidence

## Task

- Task ID: `stage-c-3-cost-calibration-execution-2026-07-05`
- Branch: `codex/stage-c-3-cost-calibration-execution-2026-07-05`
- Status: closed
- Result: `pass_bounded_local_cost_calibration_aggregate_redacted`

## Redaction Statement

Evidence may include task id, branch, file paths, public Provider/model/host labels, pricing source URL/access date,
request count, retry count, aggregate token/cost/duration/status summaries, command names, pass/fail/block, failure
category, and redacted summaries only.

Evidence must not include credentials, tokens, sessions, cookies, Authorization headers, env values, connection strings,
raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`, Provider payloads, raw Prompt, raw AI
input/output, complete generated content, full question/paper/material/resource/chunk content, screenshots, traces, raw
DOM, or private fixture contents.

## Source Evidence

| Source                                                                                                        | Use                         | Redacted finding                                                                    |
| ------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `docs/05-execution-logs/acceptance/2026-07-05-stage-c-3-cost-calibration-execution-boundary.md`               | execution boundary          | Allows a separate bounded run after fresh approval.                                 |
| `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`       | Provider freshness baseline | One local Provider smoke passed; it is not Cost Calibration or Provider readiness.  |
| `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`           | gate separation baseline    | Cost Calibration remains separate from Provider freshness and staging.              |
| `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md` | local acceptance baseline   | Local S1-S12 scope is closed; Provider, Cost, staging, and release remain separate. |
| Official Alibaba Cloud pricing page                                                                           | pricing source              | Public source rechecked before execution.                                           |
| Official Alibaba Cloud model page                                                                             | model source                | Target model label exists as a public model label.                                  |
| Official Alibaba Cloud DashScope API page                                                                     | API source                  | Target host is a public DashScope-compatible API host label.                        |

## Pricing Preflight

| Check                     | Result                                                         |
| ------------------------- | -------------------------------------------------------------- |
| Pricing source rechecked  | pass, official source accessed on `2026-07-05`                 |
| Model mapping             | pass, `qwen3.7-max` public model label confirmed               |
| Currency/mode             | pass, CNY public non-discount, non-Batch, non-Token-Plan basis |
| Pricing basis             | input `CNY 12 / 1M tokens`, output `CNY 36 / 1M tokens`        |
| Estimated max spend cap   | pass, conservative preflight stayed below `CNY 5.00`           |
| Stop before call required | false                                                          |

## Runtime Evidence

| Check                          | Status | Redacted result                                                                                         |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| `.env.local` single-key lookup | pass   | Only the `ALIBABA_API_KEY` key label was used; value was not output or recorded.                        |
| Child process injection        | pass   | Secret existed only in the Provider child process environment and was removed after execution.          |
| Provider target                | pass   | `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com`                               |
| Request cap                    | pass   | `requestCount=4`                                                                                        |
| Retry cap                      | pass   | `retryCount=0`                                                                                          |
| Timeout cap                    | pass   | each request used `60000 ms` timeout boundary                                                           |
| Output token boundary          | pass   | all request output token counts were below `1800`                                                       |
| Spend cap                      | pass   | estimated aggregate cost `CNY 0.072936` below cap `CNY 5.00`                                            |
| Redaction check                | pass   | no raw Prompt, payload, output, secret, full content, DB rows, screenshots, traces, or raw DOM recorded |

Sanitized aggregate runtime result:

```yaml
providerLabel: openai_compatible
providerName: alibaba-qwen
modelLabel: qwen3.7-max
baseUrlHost: dashscope.aliyuncs.com
resultStatus: pass
failureCategory: null
requestCount: 4
retryCount: 0
durationSummary:
  totalDurationMs: 39825
  minDurationMs: 7090
  maxDurationMs: 17281
usageSummary:
  inputTokens: 96
  outputTokens: 1994
  totalTokens: 2090
  reasoningTokens: 1970
  cachedInputTokens: 0
costSummary:
  estimatedCostCny: 0.072936
  spendCapCny: 5.00
  spendStatus: pass
redactionStatus: passed
```

Per-request count summary:

| Request | Status | Duration ms | Input tokens | Output tokens | Total tokens | Reasoning tokens | Cached input tokens |
| ------- | ------ | ----------- | ------------ | ------------- | ------------ | ---------------- | ------------------- |
| 1       | pass   | 17281       | 24           | 901           | 925          | 895              | 0                   |
| 2       | pass   | 7770        | 24           | 374           | 398          | 368              | 0                   |
| 3       | pass   | 7090        | 24           | 339           | 363          | 333              | 0                   |
| 4       | pass   | 7684        | 24           | 380           | 404          | 374              | 0                   |

## Validation Log

| Command                            | Result          |
| ---------------------------------- | --------------- |
| bounded Cost Calibration command   | pass            |
| scoped Prettier write              | pass            |
| scoped Prettier check              | pass            |
| `git diff --check`                 | pass            |
| blocked path diff                  | pass, no output |
| Module Run v2 pre-commit hardening | pass            |
| Module Run v2 pre-push readiness   | pass            |

## Boundary Confirmation

- `.env.local` read: true, single key only
- Secret value accessed/output/recorded: value accessed in child process memory only; output/recorded false
- Provider call executed: true
- Provider request count: `4`
- Provider retry count: `0`
- Raw Prompt/payload/AI output recorded: false
- DB connection/query/write executed: false
- Browser/e2e/dev server executed: false
- Staging/prod/cloud/deploy/payment executed: false
- Product source/test/package/lockfile/schema/migration/script changed: false
- Cost Calibration executed: true, bounded local aggregate sample only
- Release readiness claimed: false
- Final Pass claimed: false
- Production usability claimed: false
- Production readiness claimed: false
