# 2026-07-04 Stage C-1 Provider Smoke Rerun

## Status

- Task ID: `stage-c-1-provider-smoke-rerun-2026-07-04`
- Execution status: completed
- Provider call status: executed once
- Result: `pass_local_provider_smoke_single_call_redacted`

## Approved Target

| Field               | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| Provider label      | `openai_compatible / alibaba-qwen`                       |
| Model label         | `qwen3.7-max`                                            |
| Host label          | `dashscope.aliyuncs.com`                                 |
| Base URL label      | `https://dashscope.aliyuncs.com/compatible-mode/v1`      |
| Env key alias       | `ALIBABA_API_KEY`                                        |
| Secret source       | readonly `.env.local` single-key lookup to child process |
| Max Provider calls  | `1`                                                      |
| Retry cap           | `0`                                                      |
| Timeout             | `60000 ms`                                               |
| Script output limit | `8` tokens                                               |

## Runtime Acceptance Criteria

| Criterion                                                | Expected result        | Status             |
| -------------------------------------------------------- | ---------------------- | ------------------ |
| `.env.local` exists                                      | true                   | pass               |
| `ALIBABA_API_KEY` key exists and is non-empty            | true                   | pass               |
| Secret value printed or committed                        | false                  | pass               |
| Provider request count                                   | `0` or `1` only        | pass, observed `1` |
| If call executes, target is approved Provider/model/host | true                   | pass               |
| If call executes, retry count                            | `0`                    | pass               |
| Redacted envelope records no forbidden runtime material  | `redactionStatus` pass | pass               |
| No DB/browser/e2e/dev server/staging/Cost Calibration    | true                   | pass               |

## Redacted Runtime Result

| Field                  | Value                    |
| ---------------------- | ------------------------ |
| Result status          | `pass`                   |
| Failure category       | `null`                   |
| Provider call executed | true                     |
| Request count          | `1`                      |
| Retry count            | `0`                      |
| Duration               | `10599 ms`               |
| Usage summary          | count-only token summary |
| Redaction status       | `passed`                 |

## Stop Rules

This task must stop after first block/fail/pass and must not retry. Missing key, Provider failure, redaction failure,
target mismatch, or boundary expansion are terminal for this task.

## Non-Claims

- No Provider readiness claim.
- No staging readiness claim.
- No Cost Calibration result.
- No production quota or pricing decision.
- No release readiness.
- No final Pass.
- No production usability.
