# Provider/Cost Final Pass Boundary And Cost Calibration Decision Package

Package id: `PROVIDER_COST_FINAL_PASS_BOUNDARY_AND_COST_CALIBRATION_DECISION_PACKAGE_2026_06_26`

Task id: `provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26`

This package is docs/state-only. It does not execute Provider calls, read credentials, calibrate cost, modify source,
touch DB/schema/migration/seed/package/env files, or claim release readiness.

## Decision Summary

Provider/Cost is allowed to enter a follow-up local dev smoke/calibration task for the content and organization admin AI
local contract loops.

This does not change the already-recorded local-product MVP final Pass decision. It only defines what evidence is needed
before Provider/Cost can be considered in any later final Pass boundary.

## Provider/Cost Inclusion Rule

Provider/model calls may be included in a later final Pass decision only after a separate task records redacted local
Provider/Cost smoke or calibration evidence for the approved admin AI workflows.

The next approved task is:

`ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26`

## Provider And Model Selection

The follow-up task must use the existing repository configuration and prior gate convention:

| Field           | Required value                                    |
| --------------- | ------------------------------------------------- |
| environment     | local `dev` only                                  |
| modelProvider   | `openai_compatible`                               |
| providerName    | `alibaba-qwen`                                    |
| modelName       | `qwen3.7-max`                                     |
| baseUrlHost     | `dashscope.aliyuncs.com`                          |
| SDK path        | `ai` + `@ai-sdk/openai-compatible`                |
| secretAlias     | `ALIBABA_API_KEY`                                 |
| maxRetries      | `0`                                               |
| maxOutputTokens | `8`                                               |
| timeoutMs       | `30000`                                           |
| streaming       | blocked                                           |
| fallback        | blocked                                           |
| source basis    | existing Provider smoke and route-integrated code |

Changing provider, model, endpoint, retry policy, streaming, fallback, SDK package, or credential alias requires a new
approval package.

## Allowed Invocation Entrypoints

The follow-up task may execute real Provider calls only for these route/workflow labels:

| Workflow label             | Product surface                                   | Call limit |
| -------------------------- | ------------------------------------------------- | ---------- |
| `content_ai_question`      | content admin `AI出题` local contract loop        | 1          |
| `content_ai_paper`         | content admin `AI组卷` local contract loop        | 1          |
| `organization_ai_question` | `org_advanced_admin` `AI出题` local contract loop | 1          |
| `organization_ai_paper`    | `org_advanced_admin` `AI组卷` local contract loop | 1          |

Maximum total Provider calls: `4`.

No automatic retry is allowed. If a call fails, the follow-up task records the sanitized failure category and stops or
continues only while staying within the `4` call cap and without retrying the failed workflow.

## Local Contract Bridge Rule

Current admin AI routes are proven as local contract loops with `providerCallExecuted: false`. The follow-up task must
record whether each workflow still hits only a local contract summary or has an approved route-integrated Provider
bridge.

If the product route remains provider-disabled, the result is not a source-code defect in this task. It is a gate
finding: create a focused diagnostic or provider-disabled product loop implementation plan instead of widening scope.

## Credential Read Rule

Allowed credential source for the follow-up task:

1. Preferred: `ALIBABA_API_KEY` supplied as an ephemeral process environment variable.
2. Fallback: read-only local private credential source already approved for this repository, including local `.env.local`
   if the task records read-only Provider credential access.

Credential evidence may record only:

- `secretAlias`
- `secretSourceKind`
- `secretPresence`
- `credentialValueRecorded: false`

Credential evidence must not record the value, partial value, last four characters, raw `.env*` line, Authorization
header, token, cookie, local/session storage, screenshot, trace, or terminal echo of the secret.

## Evidence Redaction Fields

Allowed evidence fields:

- task id, branch, command identity, and local-only target statement;
- provider/model identifiers and base URL host;
- route/workflow label;
- call count, retry count, status, failure category, redaction status;
- latency/duration;
- token usage counters returned by the SDK;
- cost summary status, including `monetaryCostEstimated: false` when no approved pricing source is used;
- local contract summary hit status;
- sanitized provider error summary limited to HTTP status and provider error code.

Blocked evidence fields:

- raw prompt, prompt template body, provider request payload, provider response payload, raw generated text, raw AI
  output preview, API key, token, cookie, Authorization header, local/session storage, raw `.env*` values, database URL,
  raw DB rows, raw DOM, screenshot, trace, HTML report, account identifiers, full `question`, full `paper`, material,
  private answer content, or generated content body.

## Cost Calibration Boundary

The follow-up task may record token/call counts and a redacted token/cost summary. It must not compute production quota
defaults, pricing defaults, customer-facing package assumptions, monthly projections, or Cost Calibration Gate Pass.

If no approved local pricing source exists, the monetary cost summary must be:

`monetaryCostEstimated: false`

and the evidence must state that pricing lookup was not performed.

## Failure Branches

| Failure branch                 | Required handling                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Credential missing             | Stop before Provider call; record `secretPresence: missing`; recommend supplying local credential or disabled path.   |
| Provider error or timeout      | Record sanitized failure category; do not retry automatically; recommend focused Provider diagnostic.                 |
| Cost boundary exceeded         | Stop immediately; record call count and token summary; no further calls.                                              |
| Redaction violation            | Stop and mark gate blocked; do not commit sensitive evidence.                                                         |
| Product route remains disabled | Record provider-disabled product loop finding; recommend focused diagnostic or provider-disabled implementation plan. |

## Decision Outcome

Task 2 is allowed to proceed under this package.

Provider/Cost may be marked as locally smoke-passed only if task 2 records bounded redacted evidence and no product-chain
or redaction failure. Even then, `staging`, `prod`, deployment, payment, external service, and release readiness remain
unapproved.

## Non-Decision Statement

This package is not Provider/Cost Pass evidence, not Cost Calibration Gate Pass, not staging/prod readiness, not payment
or external-service readiness, not deployment approval, and not release readiness.
