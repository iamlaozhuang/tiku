# 2026-07-05 Stage C-3 Cost Calibration Execution

Task ID: `stage-c-3-cost-calibration-execution-2026-07-05`

Status: closed.

## Purpose

Run a bounded local Cost Calibration sample for the already approved Qwen Provider target. This task produces only
aggregate token, cost, duration, and status evidence. It does not claim Provider readiness, production pricing, quota
defaults, staging readiness, release readiness, final Pass, production usability, or production readiness.

## Approved Runtime Boundary

| Field          | Boundary value                                     |
| -------------- | -------------------------------------------------- |
| Provider label | `openai_compatible / alibaba-qwen`                 |
| Model label    | `qwen3.7-max`                                      |
| Host label     | `dashscope.aliyuncs.com`                           |
| Environment    | local `dev` only                                   |
| Secret source  | readonly `.env.local` single key label             |
| Input class    | synthetic/reviewed non-sensitive calibration input |
| Product data   | forbidden                                          |
| Browser/DB     | forbidden                                          |
| Staging/prod   | forbidden                                          |

## Pricing Boundary

| Item                   | Boundary                                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| Primary pricing source | `https://help.aliyun.com/zh/model-studio/model-pricing`                    |
| Model reference source | `https://www.alibabacloud.com/help/en/model-studio/models`                 |
| API reference source   | `https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope`           |
| Access date            | `2026-07-05`                                                               |
| Price basis            | official public non-discount, non-Batch, non-Token-Plan price              |
| Spend cap              | `CNY 5.00`                                                                 |
| Ambiguity rule         | stop before call if source, model mapping, price, currency, or mode drifts |

## Execution Caps

| Cap                 | Value       |
| ------------------- | ----------- |
| Max requests        | `4`         |
| Retry cap           | `0`         |
| Timeout per request | `60000 ms`  |
| Max output tokens   | `1800`      |
| Stop after failure  | immediately |

## Acceptance Criteria

| Criterion                              | Expected result              |
| -------------------------------------- | ---------------------------- |
| Official pricing rechecked before call | pass                         |
| `.env.local` single-key handling       | value not output or recorded |
| Provider request count                 | `0..4`, never above `4`      |
| Retry count                            | `0`                          |
| Aggregate cost                         | below `CNY 5.00`             |
| Evidence redaction                     | no forbidden material        |
| DB/browser/staging/source/dependency   | not executed or changed      |
| Readiness/final/production claim       | not made                     |

## Runtime Result

| Field                  | Result                           |
| ---------------------- | -------------------------------- |
| Result status          | `pass`                           |
| Failure category       | `null`                           |
| Provider call executed | true                             |
| Request count          | `4`                              |
| Retry count            | `0`                              |
| Duration summary       | aggregate total/min/max recorded |
| Usage summary          | aggregate token counts recorded  |
| Estimated cost         | `CNY 0.072936`                   |
| Spend cap              | `CNY 5.00`                       |
| Spend status           | `pass`                           |
| Redaction status       | `passed`                         |
| Closeout state         | closeout gates passed            |

Acceptance mapping: the task executed only the approved local bounded Cost Calibration sample. It produced aggregate
cost/token/duration/status evidence and did not record raw Prompt, payload, raw AI I/O, full generated content, secret
value, DB rows, screenshots, traces, or raw DOM.

## Non-Claims

- No Provider readiness.
- No production pricing.
- No production quota default.
- No staging readiness.
- No release readiness.
- No final Pass.
- No production usability.
- No production readiness.
