# AP-01 Qwen Provider Smoke Runner Base URL Config Evidence

result: pass
executionDecision: qwen_runner_base_url_config_ready_retry_blocked

## Task

- AP id: `AP-01`
- Task id: `ap-01-qwen-provider-smoke-runner-base-url-config`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-qwen-provider-smoke-runner-base-url-config`
- Batch range: AP-01 Qwen smoke runner base URL configuration only.
- Commit: `9973e33f` is the accepted pre-task baseline; the final task commit follows this evidence record.
- Scope: add explicit Alibaba base URL support to the provider smoke runner and existing focused unit test only.
- Provider execution in this task: not run.
- `.env.local` read/write in this task: not performed.

## RED / GREEN

- RED: `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts` failed after adding tests. Failures:
  dry-run evidence did not include `baseUrlHost`, and `createProviderModel` was not a testable function.
- GREEN: The runner now accepts explicit Alibaba `--base-url`, records only `baseUrlHost` in dry-run evidence, and passes
  explicit `baseURL` to `createAlibaba()` when provided.
- BLOCKED: Real Qwen retry remains blocked for a separate fresh one-request execution task.

## Implementation Summary

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
  - Added optional `--base-url` parsing that rejects missing values.
  - Keeps `openai_compatible` behavior requiring `--base-url`.
  - Allows `alibaba` to receive explicit `baseURL` through `createAlibaba()`.
  - Adds dry-run `baseUrlHost` evidence while avoiding full URL or secret output.
  - Exports `createProviderModel` for focused unit validation with injected provider factories.
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
  - Covers explicit Alibaba base URL config parsing.
  - Covers redacted dry-run host evidence without secret read or provider call.
  - Covers `createAlibaba()` receiving explicit `baseURL`.

## Dry-Run Result

- Command:
  `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --max-requests 1 --timeout-ms 30000 --dry-run`
- Result: pass.
- `requestCount`: `0`.
- `providerCallExecuted`: `false`.
- `resultStatus`: `dry_run`.
- `baseUrlHost`: `dashscope.aliyuncs.com`.
- No `.env.local` read and no provider/model call occurred.

## Gates

- highest local validation level: L2 focused unit behavior plus dry-run command shape.
- localFullLoopGate: L2 focused runner unit and dry-run only; no app route, role flow, or provider runtime was executed.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after runner config; do not retry Qwen or read `.env.local` in this task.
- nextModuleRunCandidate: `ap-01-qwen-provider-smoke-execution-base-url-ready`.
- provider call: blocked.
- provider retry: blocked.
- `.env.local` read/write: blocked in this task.
- Cost Calibration Gate: blocked.
- staging/prod/cloud/deploy: blocked.
- payment/external-service: blocked.
- dependency/schema/migration/e2e changes: blocked.
- blocked remainder: `.env.local` read/write, Qwen one-request retry, additional provider execution, Cost Calibration
  Gate, staging/prod/cloud/deploy, payment/external-service, dependency, schema/migration, product source outside smoke
  runner, e2e changes, PR, push, force-push, raw provider payload, raw prompt, raw response, raw error, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Result                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts` after RED tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | fail as expected; 2 failed, 7 passed                      |
| `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts` after implementation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass; 1 file, 9 tests                                     |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --max-requests 1 --timeout-ms 30000 --dry-run`                                                                                                                                                                                                                                                                                                                                                                             | pass; requestCount 0, providerCallExecuted false, dry_run |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | pass                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | pass                                                      |
| `npx.cmd prettier --write --ignore-unknown scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md` | pass; 8 files checked                                     |
| `npx.cmd prettier --check --ignore-unknown scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md` | pass; all matched files use Prettier style                |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | pass                                                      |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-runner-base-url-config`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass; filesToScan 8                                       |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-runner-base-url-config`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | pass                                                      |

## Redaction

This evidence records only public base URL host, task ids, branch name, local file paths, command names, provider/model
ids, pass/fail status, dry-run request count, and blocked-gate decisions.

This evidence does not include `.env*` contents, provider key values, raw prompts, raw model/provider responses, provider
payloads, raw provider errors, secrets, env values, tokens, Authorization headers, database URLs, raw DB rows, full
question bank content, student answers, standard answers, cleartext `redeem_code`, screenshots, traces, HTML reports, or
private file URLs.
