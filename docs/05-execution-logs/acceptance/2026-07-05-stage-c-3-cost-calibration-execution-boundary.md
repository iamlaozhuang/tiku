# 2026-07-05 Stage C-3 Cost Calibration Execution Boundary

Task ID: `stage-c-3-cost-calibration-execution-boundary-2026-07-05`

Status: closed.

## Purpose

This packet pins down the allowed shape of a future Cost Calibration execution. It is a boundary package only.

No spend-bearing Provider call, Cost Calibration run, secret access, DB, browser/e2e, staging/prod, source/test,
dependency, schema/migration/seed, release readiness, final Pass, production usability, or production readiness action is
approved or executed in this task.

## Approved Future Target

| Field          | Boundary value                                      |
| -------------- | --------------------------------------------------- |
| Provider label | `openai_compatible / alibaba-qwen`                  |
| Model label    | `qwen3.7-max`                                       |
| Host label     | `dashscope.aliyuncs.com`                            |
| Environment    | local `dev` only                                    |
| Input class    | synthetic/reviewed non-sensitive calibration inputs |
| Product data   | forbidden                                           |
| Browser/DB     | forbidden                                           |
| Staging/prod   | forbidden                                           |

## Pricing Source Boundary

| Item                    | Boundary                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Primary pricing source  | `https://help.aliyun.com/zh/model-studio/model-pricing`                                               |
| Model reference source  | `https://www.alibabacloud.com/help/en/model-studio/models`                                            |
| API billing reference   | `https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope`                                      |
| Access date             | `2026-07-05`                                                                                          |
| Price values in packet  | Not recorded. Future execution must re-read official pricing before any call.                         |
| Ambiguity rule          | If pricing, discount, token plan, billing currency, or model mapping is ambiguous, stop before calls. |
| Formula boundary        | Use official execution-time input/output and any listed billable token classes.                       |
| Production pricing rule | Forbidden. This packet cannot set production pricing or quota defaults.                               |

## Future Execution Caps

| Cap                 | Value       |
| ------------------- | ----------- |
| Max requests        | `4`         |
| Retry cap           | `0`         |
| Timeout per request | `60000 ms`  |
| Max output tokens   | `1800`      |
| Max estimated spend | `CNY 5.00`  |
| Stop after failure  | immediately |

The future execution task must run a preflight cost estimate using execution-time official pricing. If the worst-case
estimate exceeds the cap, it must stop before any Provider call.

## Evidence Shape

Allowed evidence:

- task id, branch, command names, pass/fail/block;
- public Provider/model/host labels;
- pricing source URL and access date;
- sample count, request count, retry count;
- aggregate input/output/reasoning/cached token counts when available;
- aggregate duration bucket or total duration;
- aggregate estimated cost summary;
- failure category and redacted summary.

Forbidden evidence:

- secret/env values, credentials, connection strings;
- token/session/cookie/localStorage/Authorization header;
- raw Prompt, Provider payload, raw AI input/output, raw Provider error body;
- full generated content, full question/paper/material/resource/chunk content;
- raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`;
- screenshots, traces, raw DOM, private fixture contents.

## Quota And Cost Decision Boundary

- Quota owner category may be recorded only as `platform_cost_probe`, `personal_auth_context_sample`, or
  `org_auth_context_sample`.
- No production quota default may be calculated or set from this run.
- No billing plan, subscription, package, payment, invoice, or external-service decision is approved.
- Any future quota policy requires a separate product decision after Cost Calibration evidence exists.

## Future Approval Text

```text
批准执行单独的 Stage C-3 Cost Calibration execution 任务：在独立短分支上，只针对本地 Tiku 目标
openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com；执行前必须重新读取官方 Alibaba Cloud
Model Studio pricing source 并记录 source/date，若价格、折扣、Token Plan、币种或模型映射不清晰则 stop before call；
允许使用任务内明确的 runtime secret source label，但不得输出、提交或记录 secret 值；最多 4 次 Provider 请求、0 次重试、
每次 timeout 60000 ms、每次 max output tokens 1800、预估总花费上限 CNY 5.00；只允许 synthetic/reviewed
non-sensitive calibration 输入；证据只记录 task id、branch、public target labels、pricing source/date、request count、
retry count、aggregate token/cost/duration/status summaries、failure category、pass/fail/block 和 redacted summary；
禁止记录 raw Prompt、Provider payload、raw AI I/O、完整题目/试卷/材料/资源内容、secret/env value、token/session/cookie/header、
raw DB rows、截图、trace、raw DOM、PII、plaintext redeem_code；不执行 staging/prod、DB、browser/e2e、schema/migration/seed/
dependency；不得声明 Provider readiness、production pricing、quota default、release readiness、final Pass 或 production
usability。
```

## Non-Claims

- No Cost Calibration execution in this task.
- No Provider call in this task.
- No Provider readiness.
- No production pricing or quota default.
- No staging readiness.
- No release readiness.
- No final Pass.
- No production usability.
- No production readiness.
