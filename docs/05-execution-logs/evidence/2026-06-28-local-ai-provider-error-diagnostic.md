# Local AI Provider Error Diagnostic Evidence

- Task id: `local-ai-provider-error-diagnostic-2026-06-28`
- Branch: `codex/local-provider-error-diagnostic-20260628`
- Evidence mode: redacted Provider diagnostic status only.

## Approval Boundary

The user fresh-approved Provider error diagnostics. This task may read `D:\tiku\.env.local` only for
`ALIBABA_API_KEY`, inject it only into the current command process, and execute at most one real Provider diagnostic
call. It must not modify `.env*` or Provider configuration.

## Redaction Boundary

This evidence records no credentials, secret values, connection strings, tokens, cookies, localStorage, Authorization
headers, database rows, internal ids, user emails/phones, raw DOM, screenshots, traces, Provider payloads, prompts, raw
AI output, raw student or employee answers, full question/paper/resource/chunk content, pricing, quota defaults, or Cost
Calibration data.

## Diagnostic Results

| Diagnostic step                   | Result | Redacted detail                                                                                                                                                                                                                                          |
| --------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static route comparison           | PASS   | Previous failed path was direct `alibaba` / `qwen-plus`; existing route-integrated metadata and historical passing evidence point to `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` / `dashscope.aliyuncs.com`.                                    |
| OpenAI-compatible dry-run         | PASS   | `requestCount=0`, `providerCallExecuted=false`, `resultStatus=dry_run`, `redactionStatus=passed`.                                                                                                                                                        |
| OpenAI-compatible diagnostic call | PASS   | `ALIBABA_API_KEY` was found through approved readonly `.env.local` lookup; one request was attempted; `requestCount=1`, `providerCallExecuted=true`, `resultStatus=pass`, `failureCategory=null`, `providerErrorSummary=null`, `redactionStatus=passed`. |

Diagnostic conclusion: the prior redacted `provider_error` is path-specific to the direct `alibaba` / `qwen-plus` smoke
attempt. The viable local Provider route is the existing OpenAI-compatible DashScope route using `alibaba-qwen` /
`qwen3.7-max` and host `dashscope.aliyuncs.com`.

No follow-up Provider call was executed.

## Validation Results

Runtime diagnostic:

| Gate                                 | Result                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| OpenAI-compatible DashScope dry-run  | PASS                                                      |
| One-request Provider diagnostic call | PASS                                                      |
| Provider request cap                 | PASS: exactly one real diagnostic request                 |
| Provider retry cap                   | PASS: zero retries                                        |
| Redaction wrapper                    | PASS: key value, raw output, and usage summary suppressed |

Closeout validation is pending after documentation/state updates.

Final closeout validation:

| Gate                                                         | Result                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Scoped Prettier write/check                                  | PASS                                                                     |
| `git diff --check`                                           | PASS                                                                     |
| `Test-ModuleRunV2PreCommitHardening.ps1`                     | PASS                                                                     |
| `Get-TikuProjectStatus.ps1` after task close                 | PASS: idle/no pending executable task; Cost Calibration remains blocked. |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` | PASS                                                                     |

## Blocked Gates Preserved

- Cost Calibration: blocked.
- Pricing/quota default decisions: not executed.
- Provider configuration changes: not executed.
- `.env*` modification: not executed.
- Package/lockfile, schema/migration, seed, `drizzle-kit push`: not touched.
- Staging/prod/deploy, payment/OCR/export, external service: not executed.
- Release readiness and final Pass: not claimed.
