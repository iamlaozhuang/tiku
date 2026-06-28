# Local AI Provider Error Diagnostic Traceability

## Task

- Task id: `local-ai-provider-error-diagnostic-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-provider-error-diagnostic-20260628`
- Scope: diagnose the redacted Provider error from the local Provider smoke without changing source, Provider
  configuration, package/lockfile, schema, migration, seed, or `.env*` files.

## Requirement Mapping

| Requirement area           | Mapping                                                                                                                 | Boundary                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Provider-backed AI smoke   | Compares the failed direct `alibaba` / `qwen-plus` path with the historically passing OpenAI-compatible DashScope path. | At most one real diagnostic request; no retry loop.                             |
| Environment isolation      | Reads local `dev` `.env.local` only for `ALIBABA_API_KEY` under fresh approval.                                         | No `.env*` modification and no staging/prod/cloud connection.                   |
| AI generation              | Supports the local full-loop AI generation smoke by identifying the viable Provider route.                              | Does not generate or persist formal `question` or `paper` content.              |
| Organization AI generation | Preserves advanced organization AI generation scope and standard-admin denial requirements.                             | No browser/e2e execution or organization data mutation in this task.            |
| Evidence redaction         | Evidence records command status, Provider route labels, request-count class, result status, and failure category only.  | No prompt, payload, raw output, credential, answer, or full content evidence.   |
| Cost Calibration           | Explicitly not executed.                                                                                                | No cost measurement, pricing, quota defaults, release readiness, or final Pass. |

## Expected Decision Output

The task classified the previous `provider_error` as path-specific failure with OpenAI-compatible DashScope diagnostic
passing.

Observed diagnostic route:

- provider label: `openai_compatible`
- provider name: `alibaba-qwen`
- model label: `qwen3.7-max`
- base URL host: `dashscope.aliyuncs.com`
- request count: `1`
- retry count: `0`
- result: `pass`

Any follow-up Provider/model/endpoint/configuration work requires a new approval unless it is the already-recorded
post-Provider rollup with no runtime execution.
