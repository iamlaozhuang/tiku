# AP-01 Provider Smoke Harness Token Cap Hardening Evidence

result: pass
executionDecision: provider_smoke_execution_still_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-harness-token-cap-hardening`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-token-cap-hardening`
- Batch range: AP-01 only.
- Commit: `43545ffe` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: smoke runner hardening plus focused unit test and governance evidence.

## RED / GREEN

- RED: `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts` failed before implementation with 2
  expected failures proving config and provider call config did not include `maxOutputTokens: 8`.
- GREEN: the smoke runner now fixes `maxOutputTokens: 8`, passes it into `generateText`, exposes it in redacted dry-run
  evidence, and keeps real provider/model execution blocked.

## Gates

- localFullLoopGate: not applicable; this is a local script/unit hardening task, not a full app experience flow.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after local commit and wait for fresh AP-01 provider smoke execution approval.
- nextModuleRunCandidate: `ap-01-provider-smoke-execution`.
- blocked remainder: real provider/model calls, provider configuration, `.env*` read/write/output, secret/env value
  disclosure, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source outside the smoke runner, e2e changes, PR, push, force push, destructive DB,
  and raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                         | Result                                                                                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| RED `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`                | fail as expected; 1 file, 2 failed and 4 passed, missing `maxOutputTokens: 8`                  |
| GREEN `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`              | pass; 1 file, 6 tests                                                                          |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible ... --dry-run` | pass; `maxOutputTokens: 8`, `requestCount: 0`, `providerCallExecuted: false`, redaction passed |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba ... --dry-run`           | pass; `maxOutputTokens: 8`, `requestCount: 0`, `providerCallExecuted: false`, redaction passed |
| scoped Prettier write/check                                                                     | pass                                                                                           |
| `git diff --check`                                                                              | pass                                                                                           |
| `npm.cmd run lint`                                                                              | pass                                                                                           |
| `npm.cmd run typecheck`                                                                         | pass                                                                                           |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                        | pass                                                                                           |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                   | pass after evidence command-anchor correction                                                  |

## Redaction

This evidence records only AP ids, task ids, file paths, command names, pass/fail status, test counts, and provider smoke
dry-run status. It does not include `.env*` content, provider key values, raw prompts, raw model/provider responses,
provider payloads, secrets, env values, tokens, Authorization headers, database URLs, raw question bank content, student
answers, standard answers, cleartext `redeem_code`, private row data, screenshots, traces, HTML reports, or private file
URLs.
