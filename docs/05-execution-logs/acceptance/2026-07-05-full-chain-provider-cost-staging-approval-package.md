# 2026-07-05 Full-chain Provider Cost Staging Approval Package

Task id: `full-chain-provider-cost-staging-approval-package-2026-07-05`

Status: prepared for human decision only.

Execution status: not executed.

## Purpose

This package separates the remaining external-runtime decisions after local S1-S12 acceptance:

1. Provider/model execution.
2. Cost Calibration.
3. Staging preview or deployment rehearsal.

This task does not execute any of those gates. It only records the current evidence baseline, serial order, stop rules,
and copyable future approval text.

## Current Evidence Baseline

| Evidence area           | Current reading                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local full-chain S1-S12 | Closed for the local isolated DB acceptance scope only. No Provider, Cost Calibration, staging, release, final Pass, or production claim.        |
| Queue cleanup           | Closed as docs-only governance cleanup. It does not create runtime evidence.                                                                     |
| Stage C-1 target        | Current public-source target inventory found a concrete local smoke candidate: `openai_compatible / alibaba-qwen / qwen3.7-max`.                 |
| Stage C-1 first attempt | Blocked before Provider call because the runtime secret was unavailable in that process.                                                         |
| Secret decision         | Selected owner-controlled process injection or tightly scoped runtime secret access; no secret value is recorded in committed evidence.          |
| Stage C-1 rerun         | One local Provider smoke call passed with redacted evidence. This is a single-call smoke only, not Provider readiness or business AI acceptance. |
| AI generation baseline  | AI出题 / AI组卷 local/bounded baseline is closed for its declared scope; Cost Calibration and release/staging claims remain blocked.             |

## Serial Decision Matrix

| Gate                     | Current state                  | Next allowed shape                                                                                          | Still forbidden until fresh approval                                                                          |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Provider target decision | prior single-call smoke exists | Decide whether prior smoke is fresh enough or rerun one bounded smoke under exact target/secret boundaries. | Broad Provider readiness, unbounded calls, raw prompts/payloads/AI output, secret values, business adoption.  |
| Cost Calibration         | blocked                        | Separate calibration plan with pricing source/date, max spend, sample size, and aggregate evidence.         | Spend-bearing runs, quota defaults, pricing claims, raw Provider material, production economics claims.       |
| Staging preview          | blocked                        | Separate staging resource/secret/data/deploy/rollback package per ADR-005.                                  | Cloud/deploy/resource creation, prod connection, production data import, release readiness, final Pass claim. |

Recommended order:

1. Provider freshness decision or bounded rerun.
2. Cost Calibration only after Provider target and call boundary are explicit.
3. Staging preview only after staging resources, owners, data policy, secrets, deployment, rollback, and monitoring are
   explicit.

If staging is considered before Provider, the staging task must keep Provider disabled unless a separate Provider approval
is embedded in that staging task boundary.

## Future Minimum Preflight Checklist

Before any future runtime gate starts, its task must record:

- exact task id, branch, target environment, and owner approval source;
- Provider/model/host labels or staging target label;
- secret source label and rule that values are never printed or committed;
- maximum calls, retry cap, timeout, output/token boundary, and stop threshold where Provider is involved;
- pricing source/date, sample size, max spend, and outlier/failure counting where Cost Calibration is involved;
- staging resource owner, rollback owner, monitoring owner, stop owner, and redaction reviewer where staging is involved;
- evidence shape limited to task ids, labels, counts, timings, statuses, command names, and redacted summaries;
- explicit no release readiness, no final Pass, no production usability, and no production readiness claim.

## Copyable Future Approval Text

### Provider Freshness Decision Or Rerun

```text
批准执行单独的 Stage C-1 Provider freshness decision / bounded smoke rerun 任务：在独立短分支上，只针对本地
Tiku 目标 openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com；允许按任务边界使用
ALIBABA_API_KEY 的运行时 secret source label，但不得输出、提交或记录 secret 值；最多 1 次 Provider 调用、0 次重试、
timeout 60000 ms、max output tokens 1800；仅使用 synthetic/reviewed non-sensitive 输入；证据只记录 task id、
branch、public target labels、boolean presence/status、request count、duration/token count summary、pass/fail/block 和
redacted summary；禁止记录 raw Prompt、Provider payload、raw AI I/O、完整题目/试卷/材料/资源内容、secret/env value、
token/session/cookie/header、raw DB rows、截图、trace、raw DOM；不执行 Cost Calibration、staging/prod、DB、browser/e2e、
schema/migration/seed/dependency；不声明 Provider readiness、release readiness、final Pass 或 production usability。
```

### Cost Calibration Planning Or Execution Package

```text
批准执行单独的 Stage C-3 Cost Calibration package 任务：必须先记录 Provider target、pricing source/date、sample size、
max spend、stop threshold、retry/timeout/failure/outlier counting、quota owner category 和 redacted evidence shape；只允许
记录聚合 cost/token/duration/status summaries，不记录 raw Provider payload、raw Prompt、raw AI I/O、secret/env value、PII、
raw DB rows 或完整内容；未在任务中再次明确批准前，不得执行实际 spend-bearing Provider calls；不得推出生产 pricing、quota
default、release readiness、final Pass 或 production usability。
```

### Staging Preview Preparation Or Execution Package

```text
批准执行单独的 Stage C-2 staging preview package 任务：必须先记录 staging target/URL、isolated database/storage/auth
resource boundary、staging-only secret ownership、sample data policy、deployment owner、rollback owner、monitoring owner、
stop owner 和 redaction reviewer；禁止 production data import、shared writable prod resources、prod deploy、prod secret
reuse、raw DB rows、secret/env value、Provider payload、raw Prompt、raw AI I/O、截图/trace/raw DOM evidence；除非任务内另有
明确 Provider approval，否则 staging 中 Provider 保持 disabled；不得声明 release readiness、final Pass、production
usability 或 production readiness。
```

## Stop Conditions

Future execution must stop and split a repair, provisioning, or decision task if any of these occur:

- target Provider/model/host/secret source differs from approval text;
- secret value would be printed, committed, or recorded;
- raw prompt, Provider payload, raw AI I/O, full content, raw DB rows, internal ids, PII, cookie/session/token/header, or
  screenshot/trace/raw DOM would enter evidence;
- Provider request would exceed approved call, retry, timeout, output, token, or cost boundary;
- staging/prod boundary is ambiguous;
- schema, migration, seed, dependency, DB mutation, deployment, payment, or external-service work becomes necessary;
- release readiness, final Pass, production usability, or production readiness claim is requested.

## Non-Claims

- No Provider execution in this task.
- No Cost Calibration in this task.
- No staging/prod/cloud/deploy action in this task.
- No Provider readiness.
- No staging readiness.
- No Cost Calibration result.
- No release readiness.
- No final Pass.
- No production usability.
- No production readiness.
