# 2026-07-05 Stage C-4 AI Cost Quota Decision Package

Task ID: `stage-c-4-ai-cost-quota-decision-package-2026-07-05`

Status: closed.

## Purpose

Turn the bounded Stage C-3 local Cost Calibration sample into a local AI budget and quota discussion packet. This is a
planning and decision artifact only. It does not set production pricing, production quota defaults, Provider readiness,
staging readiness, release readiness, final Pass, production usability, or production readiness.

## Source Sample

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Sample source  | `stage-c-3-cost-calibration-execution-2026-07-05`           |
| Provider label | `openai_compatible / alibaba-qwen`                          |
| Model label    | `qwen3.7-max`                                               |
| Host label     | `dashscope.aliyuncs.com`                                    |
| Price basis    | official public non-discount, non-Batch, non-Token-Plan CNY |
| Access date    | `2026-07-05`                                                |
| Requests       | `4`                                                         |
| Retries        | `0`                                                         |
| Input tokens   | `96`                                                        |
| Output tokens  | `1994`                                                      |
| Total tokens   | `2090`                                                      |
| Reasoning      | `1970`                                                      |
| Cached input   | `0`                                                         |
| Estimated cost | `CNY 0.072936`                                              |

Pricing formula for the current local discussion packet:

```text
estimated_cost_cny = input_tokens * 12 / 1_000_000 + output_tokens * 36 / 1_000_000
```

Average sample-like request:

| Metric                 | Value          |
| ---------------------- | -------------- |
| Cost                   | `CNY 0.018234` |
| Input tokens           | `24`           |
| Output tokens          | `498.5`        |
| Total tokens           | `522.5`        |
| Reasoning tokens       | `492.5`        |
| Cached input tokens    | `0`            |
| Output-cost dominance  | true           |
| Request-count-only cap | insufficient   |

## Local Budget Vocabulary

The following table is a discussion aid only. `sample-like request` means a request shaped like the Stage C-3 sample,
not a production AI出题, AI组卷, AI解析, enterprise training, or content draft/review request.

| Local budget | Sample-like requests | 3x conservative band | 10x conservative band | 30x conservative band |
| ------------ | -------------------- | -------------------- | --------------------- | --------------------- |
| `CNY 1`      | `54`                 | `18`                 | `5`                   | `1`                   |
| `CNY 5`      | `274`                | `91`                 | `27`                  | `9`                   |
| `CNY 10`     | `548`                | `182`                | `54`                  | `18`                  |
| `CNY 50`     | `2742`               | `914`                | `274`                 | `91`                  |

Rounding is intentionally downward for quota discussion. The multiplier bands exist because product routes with longer
materials, larger output caps, or stronger reasoning behavior can consume materially more output tokens than this sample.

## Quota Decision Axes

| Axis                   | Local discussion question                                                                             | Production default status |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- |
| Scope owner            | Should budget be tracked per user, per `organization`, per `org_auth`, per route, or as platform cap? | unset                     |
| Authorization boundary | Should `personal_auth` and `org_auth` quota policies differ after entitlement is verified?            | unset                     |
| Route class            | Should AI出题, AI组卷, AI解析, draft review, and training suggestion have separate caps?              | unset                     |
| Time window            | Should caps be per request, per day, per month, or per task batch?                                    | unset                     |
| Token dimension        | Should enforcement use request count, billable output tokens, estimated cost, or combined caps?       | unset                     |
| Safety stop            | What local alert and hard-stop thresholds should block repeated expensive runs?                       | unset                     |
| Override               | Which admin role may approve temporary quota extension, and how is it audited?                        | unset                     |
| Pricing refresh        | How fresh must official pricing be before a budget decision or production rollout?                    | unset                     |

Authorization remains the first gate. Quotas must not grant capability beyond edition-aware `authorization`; they can
only limit already-authorized usage.

## Local Discussion Options

These are not defaults. They are options to help decide what to approve later:

| Option label         | Meaning                                                                                 | Local-only use |
| -------------------- | --------------------------------------------------------------------------------------- | -------------- |
| `request_cap`        | Limit count of calls, simple but weak when token sizes vary.                            | allowed        |
| `output_token_cap`   | Limit billable output class; better aligned with the observed cost driver.              | allowed        |
| `estimated_cost_cap` | Limit estimated CNY using current formula; easiest for budget owners to discuss.        | allowed        |
| `route_cap`          | Separate caps by AI出题, AI组卷, AI解析, enterprise training, and content draft review. | allowed        |
| `soft_alert`         | Warn or require review before hard stop.                                                | allowed        |
| `hard_stop`          | Stop execution when a task or actor exceeds approved budget.                            | allowed        |

## Required Future Decisions

Before any production quota default or pricing policy exists, a later task must separately decide:

- which product routes are quota-bearing;
- whether budget is per `personal_auth`, per `org_auth`, per `organization`, per user, or per platform;
- request/token/cost cap hierarchy and audit ownership;
- retry policy and timeout policy for cost-bearing routes;
- representative samples for each route shape, especially routes using longer materials or larger output caps;
- official pricing freshness rule and fallback when pricing source is unavailable;
- how quota events appear in statistics, audit logs, and admin operations surfaces.

## Boundaries Confirmed

| Boundary                       | Status |
| ------------------------------ | ------ |
| Provider call in this task     | false  |
| Cost Calibration in this task  | false  |
| Secret/env access              | false  |
| DB/browser/dev server/e2e      | false  |
| Source/test/dependency/schema  | false  |
| Staging/prod/cloud/deploy      | false  |
| Production quota default set   | false  |
| Provider/readiness/final claim | false  |
| Redaction boundary             | pass   |

## Non-Claims

- No Provider readiness.
- No production pricing.
- No production quota default.
- No staging readiness.
- No release readiness.
- No final Pass.
- No production usability.
- No production readiness.
