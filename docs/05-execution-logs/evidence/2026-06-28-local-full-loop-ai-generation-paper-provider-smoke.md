# Local Full Loop AI Generation Paper Provider Smoke Evidence

## Scope

- Task id: `local-full-loop-ai-generation-paper-provider-smoke-2026-06-28`
- Branch: `codex/local-full-loop-ai-generation-20260628`
- Local target: localhost/127.0.0.1 only
- Evidence mode: redacted metadata only

## Redaction Boundary

This evidence intentionally omits credential values, connection strings, secrets, session values, cookies, localStorage,
Authorization headers, raw DB rows, internal ids, user email/phone values, plaintext redeem codes, raw DOM, screenshots,
traces, Provider payloads, prompts, raw AI output, employee subjective answers, full question or paper content, raw
resource content, full chunk text, embeddings, storage paths, and object keys.

## Localhost E2E Evidence

- Command:
  `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts --reporter=line`
- Result: passed, 1 test.

Redacted flow summary:

| Actor role         | Route surface                             | Generation kind | Result                              |
| ------------------ | ----------------------------------------- | --------------- | ----------------------------------- |
| content_admin      | content AI generation request             | question        | pass succeeded redacted task/result |
| content_admin      | content AI generation request             | paper           | pass succeeded redacted task/result |
| org_advanced_admin | organization AI generation request        | question        | pass succeeded redacted task/result |
| org_advanced_admin | organization AI generation request        | paper           | pass succeeded redacted task/result |
| content_admin      | content AI generation history             | n/a             | pass redacted visible history       |
| org_advanced_admin | organization AI generation history        | n/a             | pass redacted visible history       |
| org_standard_admin | organization AI generation direct request | paper           | pass denied                         |

## Focused Unit Evidence

- Command:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts tests/unit/run-personal-ai-provider-smoke.test.ts`
- Result: passed, 4 files, 36 tests.

## Provider Gate Evidence

- Dry-run command:
  `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- Dry-run result: passed with `requestCount = 0`, `providerCallExecuted = false`, and redaction passed.
- Execute command:
  `$env:TIKU_PROVIDER_SMOKE_APPROVED="1"; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --execute`
- Execute result: safely blocked as `missing_env` because the current process did not expose the Provider credential.
- Provider call executed: no.
- `.env*` file read or changed: no.
- Prompt, Provider payload, raw Provider response, raw AI output, and credential value recorded: no.

## Requirement Mapping Result

| Requirement surface                                | Mapping result                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Content admin AI question generation               | pass via localhost API smoke                                                                                                      |
| Content admin AI `paper` generation                | pass via localhost API smoke                                                                                                      |
| Organization advanced admin AI question generation | pass via localhost API smoke                                                                                                      |
| Organization advanced admin AI `paper` generation  | pass via localhost API smoke                                                                                                      |
| Organization standard admin denial                 | pass via direct API denied state                                                                                                  |
| Formal content separation                          | pass; formal `question` and `paper` writes/publish remain blocked                                                                 |
| Provider gate                                      | pass dry-run; execute mode safely blocked without Provider call due missing current process credential                            |
| API envelope and JSON naming rules                 | pass via e2e assertions                                                                                                           |
| Redaction                                          | pass; no credentials, session values, prompts, Provider payloads, raw AI output, DB rows, or full question/paper content recorded |

## Boundary Evidence

- Package or lockfile changed: no.
- `.env*` changed or read: no.
- Schema or migration changed: no.
- Provider configuration changed: no.
- Provider call executed: no, blocked by missing current process credential.
- Cost Calibration: blocked and not executed.
- Staging/prod/deploy: blocked and not executed.
- Payment/OCR/export/external-service: blocked and not executed.
- PR or force push: blocked and not executed.
- Release readiness/final Pass: not claimed.
