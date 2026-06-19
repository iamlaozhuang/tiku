# AP-01 Qwen3.7-Max one-request smoke approval audit review

## Decision

APPROVE_PROVIDER_SMOKE_PASS_CLOSEOUT

## Scope Review

- Task id: `ap-01-qwen3-7-max-one-request-smoke-approval`
- Scope is limited to one redacted Qwen provider request and docs/state/evidence/audit closeout.
- Allowed runtime secret interaction is scoped to reading `ALIBABA_API_KEY` from local-only `.env.local` into a child
  process environment without output, copy, staging, commit, or file modification.
- Provider request limit is exactly one request with retry limit `0`.
- Model is `qwen3.7-max`.

## Redaction Review

- Evidence records one successful redacted provider smoke call with `requestCount: 1`, `resultStatus: pass`, and
  aggregate token usage only.
- Evidence does not record raw prompt, raw response, raw provider error, raw model output, payload, key, token,
  Authorization header, env value, database URL, screenshots, traces, HTML reports, or private source content.

## Findings

- No blocking findings for the approved provider smoke boundary.
- The request completed through `openai_compatible/alibaba-qwen/qwen3.7-max` using the Beijing compatible-mode base URL.
- Aggregate usage included reasoning tokens despite a low max output token cap; this supports keeping Cost Calibration
  Gate blocked before any in-app AI experience execution.

## Residual Blocked Gates

Cost Calibration Gate, provider retry beyond the single approved request, additional provider execution, model/provider
configuration changes, staging/prod/cloud/deploy, payment/external-service, dependency, schema/migration, product
source, test/e2e changes, PR, push, force-push, destructive DB, and raw sensitive evidence remain blocked.
