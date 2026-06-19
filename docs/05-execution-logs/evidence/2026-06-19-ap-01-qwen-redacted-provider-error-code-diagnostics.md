# AP-01 Qwen Redacted Provider Error Code Diagnostics Evidence

result: pass
executionDecision: redacted_provider_error_code_diagnostics_ready_provider_call_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-redacted-provider-error-code-diagnostics`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-redacted-provider-error-code-diagnostics`
- Batch range: AP-01 Qwen redacted provider diagnostics support only.
- Commit: `6ce3d6b3` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: add sanitized HTTP status/provider error code summary to the smoke runner and focused unit coverage.
- Provider execution in this task: not run.
- `.env.local` content read/write in this task: not performed.

## RED / GREEN

- RED: previous Qwen smoke attempts returned only sanitized `failureCategory: provider_error`, which was too coarse to
  distinguish account/workspace/model permission problems from other provider-side rejections.
- GREEN: The smoke runner now records only a sanitized `providerErrorSummary` with `httpStatus` and
  `providerErrorCode` fields on provider failure, and focused unit coverage confirms raw message/body/key values are not
  recorded.
- BLOCKED: Qwen retry, provider/model execution, raw provider diagnostics, and Cost Calibration Gate remain blocked.

## Implementation Summary

- Added focused unit coverage for a provider failure carrying `statusCode: 403` and provider code
  `Model.AccessDenied`.
- Verified RED: the new unit test failed because the prior envelope did not include a sanitized provider error summary.
- Implemented minimal error summary extraction:
  - `httpStatus`: numeric status only, limited to `100..599`;
  - `providerErrorCode`: string code only, trimmed, max 80 characters, restricted to `A-Z`, `a-z`, `0-9`, `.`, `_`, `:`,
    and `-`;
  - raw `message`, response body, payload, key, token, and Authorization header are not read into evidence.
- Verified GREEN: focused unit test file passed with `10` tests.
- Ran CLI dry-run only; no `.env.local` read and no provider call.

## Gates

- localFullLoopGate: not applicable; this is smoke runner diagnostics support only, not an app route or full local
  business flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after code/test/docs validation; do not execute provider requests in this task.
- nextModuleRunCandidate: `ap-01-qwen-one-request-redacted-error-code-diagnostic-run` only after fresh approval.
- blocked remainder: `.env*` reads/writes/value output, Qwen retry, provider/model execution, raw provider diagnostics,
  provider configuration changes, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service,
  dependencies, schema/drizzle/migration, product source outside the smoke runner, tests outside the focused unit file,
  e2e changes, PR, push, force push, destructive DB, raw provider error, raw prompt, raw payload, raw response, and raw
  sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                               | Result                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| RED `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`                                                                                                                                                                                      | failed as expected; 1 failed / 9 passed because `providerErrorSummary` was missing                              |
| GREEN `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`                                                                                                                                                                                    | pass; 1 file, 10 tests                                                                                          |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run` | pass; `requestCount: 0`, `providerCallExecuted: false`, `baseUrlHost: dashscope.aliyuncs.com`, redaction passed |
| `npx.cmd prettier --write --ignore-unknown <changed files>`                                                                                                                                                                                                           | pass                                                                                                            |
| `npx.cmd prettier --check --ignore-unknown <changed files>`                                                                                                                                                                                                           | pass                                                                                                            |
| `git diff --check`                                                                                                                                                                                                                                                    | pass                                                                                                            |
| `npm.cmd run lint`                                                                                                                                                                                                                                                    | pass                                                                                                            |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                               | pass                                                                                                            |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-redacted-provider-error-code-diagnostics`                                                                                                                                                                  | pass                                                                                                            |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-redacted-provider-error-code-diagnostics`                                                                                                                                                             | pass                                                                                                            |

## Redaction

This evidence records only AP ids, task ids, branch name, local file paths, command names, public provider/model/base URL
host, env key aliases, pass/fail status, test counts, sanitized HTTP status, sanitized provider error code, and blocked
gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, raw error text, secrets, env values, tokens, Authorization headers, database URLs, raw
question bank content, student answers, standard answers, cleartext `redeem_code`, private row data, screenshots,
traces, HTML reports, or private file URLs.
