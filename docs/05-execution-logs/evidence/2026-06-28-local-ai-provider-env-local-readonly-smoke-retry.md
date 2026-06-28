# Local AI Provider Env Local Readonly Smoke Retry Evidence

- Task id: `local-ai-provider-env-local-readonly-smoke-retry-2026-06-28`
- Branch: `codex/local-provider-env-smoke-20260628`
- Evidence mode: redacted Provider and localhost e2e status only.

## Approval Boundary

The user approved readonly access to `D:\tiku\.env.local` for `ALIBABA_API_KEY` only, current-command-process injection only, at most one real Provider smoke request, existing localhost e2e rerun, and local closeout through commit, fast-forward merge, push, and short-branch cleanup.

## Redaction Boundary

This evidence records no credentials, secret values, connection strings, tokens, cookies, localStorage, Authorization headers, database rows, internal ids, user emails/phones, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, raw student or employee answers, full question/paper/resource/chunk content, pricing, quota defaults, or Cost Calibration data.

## Smoke Results

| Smoke command           | Result         | Redacted detail                                                                                                                                                                                                                                |
| ----------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider dry-run runner | PASS           | `requestCount=0`, `providerCallExecuted=false`, `resultStatus=dry_run`, `redactionStatus=passed`.                                                                                                                                              |
| Provider execute runner | FAIL, redacted | `ALIBABA_API_KEY` was found through approved readonly `.env.local` lookup; one Provider request was attempted; `requestCount=1`, `providerCallExecuted=true`, `resultStatus=fail`, `failureCategory=provider_error`, `redactionStatus=passed`. |
| Focused localhost e2e   | PASS           | 3 specs / 3 tests passed on localhost/127.0.0.1.                                                                                                                                                                                               |

Provider conclusion: the retry consumed the approved single Provider request. It did not produce successful Provider smoke
evidence, so the post-provider rollup remains blocked.

## Coverage Matrix

| Surface                                 | Result         | Detail                                                       |
| --------------------------------------- | -------------- | ------------------------------------------------------------ |
| Provider dry-run                        | PASS           | Zero-request redaction gate.                                 |
| Provider execute                        | FAIL, redacted | One request attempted; sanitized `provider_error`; no retry. |
| Content AI generation e2e               | PASS           | Redacted local-contract route status only.                   |
| Organization AI generation e2e          | PASS           | Advanced allowed, standard denied.                           |
| Student AI explanation e2e              | PASS           | Status and citation-count class only.                        |
| Organization training and analytics e2e | PASS           | Summary/aggregate status only.                               |

## Blocked Gates Preserved

- Cost Calibration: blocked.
- Pricing/quota default decisions: not executed.
- Provider configuration changes: not executed.
- `.env*` modification: not executed.
- `.env.local` read: executed only for `ALIBABA_API_KEY`, no value output or evidence persistence.
- Package/lockfile, schema/migration, seed, `drizzle-kit push`: not touched.
- Staging/prod/deploy, payment/OCR/export, external service: not executed.
- Release readiness and final Pass: not claimed.

## Validation Results

Runtime validation:

| Gate                                      | Result                                                    |
| ----------------------------------------- | --------------------------------------------------------- |
| Provider dry-run runner                   | PASS                                                      |
| Provider execute runner                   | FAIL, redacted Provider error after one request           |
| Focused localhost e2e                     | PASS: 3 specs / 3 tests                                   |
| `test-results` transient artifact cleanup | PASS: generated local ignored directory removed after e2e |

Closeout validation is pending after documentation/state updates.

Final closeout validation:

| Gate                                                         | Result                                                                                                                                                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped Prettier write/check                                  | PASS                                                                                                                                                                                                                                                 |
| `git diff --check`                                           | PASS                                                                                                                                                                                                                                                 |
| `Get-TikuProjectStatus.ps1`                                  | PASS: idle/no pending executable task; Cost Calibration remains blocked. Diagnostic note: queue slimming still reports one high-risk repair blocked candidate for the prior closed Provider task's `validationCommands`, so it is not auto-repaired. |
| `Test-ModuleRunV2PreCommitHardening.ps1`                     | PASS                                                                                                                                                                                                                                                 |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` | PASS                                                                                                                                                                                                                                                 |
