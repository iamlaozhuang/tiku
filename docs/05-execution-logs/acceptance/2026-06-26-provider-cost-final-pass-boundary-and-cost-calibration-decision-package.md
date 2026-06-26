# Provider/Cost Final Pass Boundary And Cost Calibration Decision Package

Package id: `PROVIDER_COST_FINAL_PASS_BOUNDARY_AND_COST_CALIBRATION_DECISION_PACKAGE_2026_06_26`

Task id: `provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26`

This package is docs/state-only. It does not execute Provider calls, read credentials, calibrate cost, modify source,
touch DB/schema/migration/seed/package/env files, or claim release readiness.

## Current-State Refresh

This package is refreshed after admin generated-result storage, route integration, and history/read UI closure.

Current state:

- content and organization admin local routes can create task records and persist redacted generated-result draft
  summaries;
- content and organization admin GET history can read the persisted summaries;
- admin history UI can display the redacted summaries;
- admin runtime still defaults to `local_contract_only`, `provider_call_blocked`, and `providerCallExecuted: false`;
- no admin route-integrated real Provider bridge is approved by this package.

## Decision Summary

Task 2 is allowed to run a bounded local Provider smoke/cost-summary calibration, but the result must be classified
narrowly.

Allowed classification:

- local Provider/model capability smoke mapped to the approved admin workflow labels;
- redacted token/call/cost-summary evidence;
- product-chain status showing whether the admin workflow remained `local_contract_only`/`provider_call_blocked` or
  reached an approved `provider_call_executed` path.

Not allowed classification:

- admin route-integrated Provider Pass when the route still reports `provider_call_blocked`;
- Provider/Cost final Pass for staging, prod, release readiness, payment, deployment, or external services;
- formal `question` or `paper` write readiness.

## Provider/Cost Inclusion Rule

Provider/model calls may be considered in a later final Pass boundary only after a separate task records bounded redacted
local evidence for the approved admin AI workflows.

The next approved task is:

`ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26`

That task may mark Provider/Cost as locally smoke-passed only for Provider/model capability and cost-summary boundaries
unless it proves an already-approved admin route path returned `providerCallExecuted: true`. If the admin route remains
provider-disabled, the result is a provider-disabled product-chain diagnostic, not a route-integrated Provider Pass.

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

| Workflow label             | Product surface                                       | Call limit |
| -------------------------- | ----------------------------------------------------- | ---------- |
| `content_ai_question`      | content admin local-contract question workflow        | 1          |
| `content_ai_paper`         | content admin local-contract paper workflow           | 1          |
| `organization_ai_question` | `org_advanced_admin` local-contract question workflow | 1          |
| `organization_ai_paper`    | `org_advanced_admin` local-contract paper workflow    | 1          |

Maximum total Provider calls: `4`.

No automatic retry is allowed. The call cap must not be used to compensate for a missing route bridge. If a call fails,
the follow-up task records the sanitized failure category and stops or continues only while staying within the `4` call
cap and without retrying the failed workflow.

## Local Contract Bridge Rule

Current admin AI routes are proven as local contract loops with generated-result draft persistence and history/read UI.
They are still Provider-disabled unless a later approved task changes or proves the route execution path.

The follow-up task must record each workflow under exactly one product-chain status:

- `local_contract_only`;
- `provider_call_blocked`;
- `provider_call_executed`.

If the product route remains provider-disabled, the result is not a source-code defect in task 2. It is a gate finding:
create a focused diagnostic or admin runtime bridge implementation plan instead of widening scope.

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
- product-chain status;
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

Task 2 is allowed to proceed under this refreshed package.

Provider/Cost may be marked as locally smoke-passed only for bounded Provider/model capability and redacted cost-summary
evidence unless task 2 also proves `providerCallExecuted: true` through an already-approved admin route path. Even then,
`staging`, `prod`, deployment, payment, external service, and release readiness remain unapproved.

## Non-Decision Statement

This package is not Provider/Cost Pass evidence, not Cost Calibration Gate Pass, not staging/prod readiness, not payment
or external-service readiness, not deployment approval, and not release readiness.
