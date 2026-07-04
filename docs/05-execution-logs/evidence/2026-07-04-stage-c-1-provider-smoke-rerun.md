# 2026-07-04 Stage C-1 Provider Smoke Rerun Evidence

## Task

- Task ID: `stage-c-1-provider-smoke-rerun-2026-07-04`
- Branch: `codex/stage-c-1-provider-smoke-rerun-2026-07-04`
- Status: completed
- Result: `pass_local_provider_smoke_single_call_redacted`

## Redaction Statement

Evidence may include task IDs, file paths, public Provider/model/host labels, public env key aliases, boolean
presence/status, request count, duration/status categories, token usage count summaries, validation commands, and
redacted summaries only.

Evidence must not include credentials, tokens, cookies, sessions, Authorization headers, env values, connection strings,
raw DB rows, internal IDs, PII, phone, email, plaintext `redeem_code`, Provider payloads, prompt text, raw AI
input/output, full generated content, screenshots, traces, videos, raw DOM, or private fixture data.

## Approval Boundary

The owner approved checking `ALIBABA_API_KEY` in `.env.local` and rerunning a single local-only Stage C-1 Provider smoke
for:

- `openai_compatible / alibaba-qwen`
- `qwen3.7-max`
- `dashscope.aliyuncs.com`
- max one call, zero retries, timeout `60000 ms`
- runtime secret use only in current command process memory
- no `.env*` value printed or committed
- no raw prompt, Provider payload, AI output, or secrets in evidence
- stop on first missing-secret/provider-fail/unsafe/costly/unstable/redaction failure

## Execution Evidence

| Step                              | Result | Redacted summary                                                                         |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `.env.local` key presence check   | passed | `.env.local` exists and `ALIBABA_API_KEY` key is present; value was not output.          |
| Current command process injection | passed | Single key value was injected only into the current PowerShell/Node child process.       |
| Provider smoke runner             | passed | Redacted runner returned `resultStatus=pass`.                                            |
| Provider request count            | passed | `requestCount=1`, within approved cap of `1`; no retry executed.                         |
| Redaction check                   | passed | Runner returned `redactionStatus=passed`; raw prompt/payload/output/secret not recorded. |

Sanitized runtime result:

```yaml
providerLabel: openai_compatible
providerName: alibaba-qwen
modelLabel: qwen3.7-max
baseUrlHost: dashscope.aliyuncs.com
resultStatus: pass
failureCategory: null
requestCount: 1
providerCallExecuted: true
retryCount: 0
durationMs: 10599
usageSummary:
  inputTokens: 24
  outputTokens: 516
  totalTokens: 540
  reasoningTokens: 510
  cachedInputTokens: 0
redactionStatus: passed
```

## Runtime Command Summary

- `.env.local` read: executed for `ALIBABA_API_KEY` only
- `.env.local` write: false
- Secret value output or committed: false
- Provider call executed: true
- Provider request count: `1`
- Retry count: `0`
- Raw prompt/payload/AI output recorded: false

## Validation Log

| Command                                                                                                                                                                   | Result                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `npm.cmd exec -- prettier --write --ignore-unknown <task files>`                                                                                                          | passed, exit 0            |
| `npm.cmd exec -- prettier --check --ignore-unknown <task files>`                                                                                                          | passed, exit 0            |
| `git diff --check`                                                                                                                                                        | passed, exit 0            |
| `git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml src tests e2e src/db/schema drizzle migrations seed scripts ...`           | passed, exit 0, no output |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-provider-smoke-rerun-2026-07-04` | passed, exit 0            |

## Boundary Confirmation

- Env file read: executed, `.env.local` single key only
- Env file write: false
- Env value printed/recorded: false
- Provider call executed: true
- Provider request count: `1`
- Raw prompt/payload/AI output recorded: false
- DB connection/query/write executed: false
- Browser/e2e/dev server executed: false
- Staging/prod/cloud/deploy/payment executed: false
- Cost Calibration executed: false
- Product source/test/package/lockfile/schema/migration/script changed: false
- Release readiness claimed: false
- Final Pass claimed: false
- Production usability claimed: false
