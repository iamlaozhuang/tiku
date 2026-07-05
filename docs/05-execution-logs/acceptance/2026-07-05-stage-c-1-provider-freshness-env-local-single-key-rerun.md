# 2026-07-05 Stage C-1 Provider Freshness Env Local Single-Key Rerun

Task ID: `stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05`

Status: closed.

## Approved Target

| Field              | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Provider label     | `openai_compatible / alibaba-qwen`                   |
| Model label        | `qwen3.7-max`                                        |
| Host label         | `dashscope.aliyuncs.com`                             |
| Secret source      | readonly `.env.local` single key `ALIBABA_API_KEY`   |
| Injection scope    | current child process memory only                    |
| Max Provider calls | `1`                                                  |
| Retry cap          | `0`                                                  |
| Timeout            | `60000 ms`                                           |
| Input class        | synthetic/reviewed non-sensitive smoke input only    |
| Output evidence    | redacted status, count, duration, token summary only |

## Runtime Acceptance Criteria

| Criterion                                     | Expected result             | Status |
| --------------------------------------------- | --------------------------- | ------ |
| State and queue point to this task            | true                        | pass   |
| `.env.local` single key is present if calling | true or stop before calling | pass   |
| Secret value printed, stored, or committed    | false                       | pass   |
| Provider request count                        | `0` on block or `1` on call | pass   |
| Retry count                                   | `0`                         | pass   |
| Redacted envelope contains no forbidden data  | true                        | pass   |
| DB/browser/e2e/dev server/staging/Cost        | false                       | pass   |

## Redacted Runtime Result

| Field                  | Value                               |
| ---------------------- | ----------------------------------- |
| Result status          | `pass`                              |
| Failure category       | `null`                              |
| Provider call executed | true                                |
| Request count          | `1`                                 |
| Retry count            | `0`                                 |
| Duration               | `12459 ms`                          |
| Usage summary          | count-only token summary            |
| Redaction status       | `passed`                            |
| Closeout state         | closeout gates passed after runtime |

## Stop Rules

- `.env.local` missing or `ALIBABA_API_KEY` missing/empty.
- Target/model/host differs from the approved labels.
- More than one request or any retry would be required.
- Timeout, Provider failure, unsafe output handling, or redaction failure.
- Any need for DB, browser/e2e, dev server, schema/migration/seed, dependency, source/test, Cost Calibration, or
  staging/prod work.
- Any request to claim Provider readiness, release readiness, final Pass, production usability, or production readiness.

## Non-Claims

- No Provider readiness.
- No staging readiness.
- No Cost Calibration result.
- No release readiness.
- No final Pass.
- No production usability.
- No production readiness.
