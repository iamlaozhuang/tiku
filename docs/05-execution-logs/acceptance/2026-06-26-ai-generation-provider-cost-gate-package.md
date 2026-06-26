# AI Generation Provider And Cost Gate Package

Package id: `AI_GENERATION_PROVIDER_COST_GATE_PACKAGE_2026_06_26`

Prepared as a docs-only gate package. This package does not execute Provider calls, read credentials, run Cost
Calibration, change runtime behavior, or claim MVP final Pass.

## Purpose

Materialize the owner's Provider/Cost and real model call authorization into exact execution rules for the next local
Provider smoke task, and decide whether that smoke should include full Cost Calibration.

## Gate Decision

| Decision item            | Decision                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Next execution task      | `ai-generation-provider-smoke-execution-2026-06-26`                                                                                       |
| Run order                | Run the real Provider smoke before content/organization AI product-loop implementation planning.                                          |
| Cost Calibration now     | No. The next smoke may collect usage counters, but it must not declare quota pricing, production cost defaults, or Cost Calibration Pass. |
| Full Cost Calibration    | Separate future task only: `ai-generation-cost-calibration-gate-execution-2026-06-26` or later owner-selected equivalent.                 |
| MVP final Pass inclusion | Provider/Cost can be included in a later final Pass decision only after Provider smoke and any selected Cost Calibration gate close.      |

Rationale:

- The Provider smoke is a smaller risk than implementing the content/organization AI product loop against an unverified
  Provider path.
- One redacted smoke can confirm SDK wiring, credential handling, endpoint reachability, model availability, timeout
  behavior, and usage-counter availability.
- Full Cost Calibration should not be bundled into a smoke because pricing, quota defaults, and production cost posture
  are separate product decisions.

## Future Provider Smoke Profile

The next execution task must use this exact profile unless a later owner approval changes it.

| Field             | Required value                     |
| ----------------- | ---------------------------------- |
| environment       | local `dev` only                   |
| modelProvider     | `openai_compatible`                |
| providerName      | `alibaba-qwen`                     |
| modelName         | `qwen3.7-max`                      |
| baseUrlHost       | `dashscope.aliyuncs.com`           |
| SDK path          | `ai` + `@ai-sdk/openai-compatible` |
| secretAlias       | `ALIBABA_API_KEY`                  |
| executionMode     | `route_integrated_provider`        |
| maxRequests       | `1`                                |
| maxRetries        | `0`                                |
| maxOutputTokens   | `8`                                |
| timeoutMs         | `30000`                            |
| streaming         | blocked                            |
| fallbackProvider  | blocked                            |
| rawOutputEvidence | blocked                            |

The profile matches the existing route-integrated Provider execution service. A future task may implement or call a
controlled runner, but it must not widen model, endpoint, retry, output, or evidence scope without a new approval.

## Credential Read Method

Credential handling for the next smoke must follow this order:

1. Preferred: owner supplies `ALIBABA_API_KEY` as an ephemeral process environment variable for the single execution
   command.
2. Fallback: read `ALIBABA_API_KEY` from local `.env.local` only if the future smoke task explicitly lists `.env.local`
   read permission and records that permission in its task queue entry.
3. Never commit, edit, print, screenshot, persist, or store the credential in evidence.

Allowed credential evidence:

- `secretAlias: ALIBABA_API_KEY`
- `secretSourceKind: ephemeral_process_env | local_dotenv`
- `secretPresence: present | missing`
- `credentialValueRecorded: false`
- `envSecretAccessed: true | false`

Blocked credential evidence:

- full or partial API key;
- last four characters;
- Authorization header;
- raw `.env*` lines;
- local credential file content;
- terminal echo of the secret;
- screenshot, trace, local storage, or clipboard content containing the secret.

## Allowed Provider Smoke Evidence Fields

The next Provider smoke evidence may record only these fields:

- task id and branch;
- command name, not raw command containing secrets;
- local-only target statement;
- provider metadata: `modelProvider`, `providerName`, `modelName`, `baseUrlHost`;
- execution controls: `maxRequests`, `maxRetries`, `maxOutputTokens`, `timeoutMs`, `streaming`, `fallbackProvider`;
- credential metadata: `secretAlias`, `secretSourceKind`, `secretPresence`, `credentialValueRecorded`;
- runtime status: `providerCallExecuted`, `providerConfigurationRead`, `envSecretAccessed`;
- execution summary: `requestCount`, `resultStatus`, `failureCategory`, `durationMs`, `redactionStatus`;
- usage counters returned by the SDK, limited to numeric token/call counts;
- sanitized provider error summary: HTTP status and provider error code only;
- Cost status: `costCalibrationExecuted: false`, `costEstimateRecorded: false`;
- blocked remainder and next task.

## Blocked Provider Smoke Evidence Fields

The next Provider smoke must not record:

- raw prompt or prompt template body;
- provider request payload;
- provider response payload;
- raw generated text;
- raw AI output preview;
- API key, token, Authorization header, cookie, localStorage, or session data;
- `.env*` values;
- database URL or raw DB rows;
- stack trace or raw exception body;
- full question, `paper`, material, answer, employee data, or generated content;
- screenshots, traces, HTML reports, or browser debug dumps.

## Cost Calibration Decision

The next Provider smoke must not execute full Cost Calibration.

Allowed in Provider smoke:

- usage token/call counters if returned by the SDK;
- duration;
- whether usage counters were present or absent;
- explicit statement that pricing and quota defaults are not calibrated.

Blocked in Provider smoke:

- production quota defaults;
- per-role or per-edition quota pricing decisions;
- customer-facing price or package assumptions;
- cost pass/fail conclusion;
- production budget or monthly cost projection;
- Cost Calibration Gate Pass.

Full Cost Calibration requires a later task that defines:

- pricing source and timestamp;
- environment boundary;
- representative request set;
- max call count and budget cap;
- quota owner model;
- failure/overrun stop condition;
- owner acceptance of residual risk.

## Pass, Fail, And Blocked Semantics For Next Smoke

| Outcome   | Meaning                                                                                                          | Follow-up                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pass`    | Exactly one real Provider call executed with redacted evidence and no forbidden fields.                          | Proceed to content/organization AI product-loop implementation planning.                              |
| `blocked` | No Provider call was executed because credential is missing, local gate is incomplete, or redaction guard stops. | Fix credential/gate issue or decide to proceed with product-loop implementation disabled.             |
| `fail`    | One Provider call executed but returned provider error or timeout.                                               | Do not retry automatically; create a focused Provider diagnostic or choose implementation-first path. |

## Next Task Selection

Primary next task:

`ai-generation-provider-smoke-execution-2026-06-26`

If that smoke passes:

`content-organization-ai-generation-product-loop-implementation-plan-2026-06-26`

If that smoke is blocked because no credential is available:

- either supply the local credential and rerun the smoke under the same gate;
- or proceed to content/organization AI product-loop implementation planning with Provider execution disabled.

If that smoke fails because the Provider endpoint/model rejects or times out:

- create a focused Provider diagnostic gate;
- do not start Cost Calibration until the Provider smoke is pass.

## Non-Decision Statement

This package is a gate definition only. It does not read credentials, call a model, configure Provider, calibrate cost,
change source, implement content/organization AI generation, approve staging/prod/payment/external service work, or claim
MVP final Pass.
