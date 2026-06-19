# AP-01 Provider Smoke Execution Approval Detailing Evidence

result: pass
executionDecision: blocked_waiting_fresh_provider_smoke_approval

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-approval-detailing`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-approval-detailing`
- Batch range: AP-01 only.
- Commit: `cc3af5665e94dee9ccc77229c516fce3366a6856` is the accepted pre-task baseline; the final task commit follows
  this evidence record.
- Scope: docs/state approval detailing only.

## RED / GREEN

- RED: AP-01 had a closed minimum approval package, but the future execution boundary still lacked current exact
  DeepSeek/Qwen provider/model choices, command entrypoint, request ceiling, cost ceiling, rollback, and evidence
  redaction boundary.
- GREEN: This packet records current provider/model candidates, the dry-run and future execute command shape, request and
  spend ceilings, rollback, redaction boundary, and a fresh approval text template while keeping real provider/model calls
  blocked.

## Facts Read

- DeepSeek official docs list `https://api.deepseek.com` for the OpenAI-compatible base URL and current models
  `deepseek-v4-flash` and `deepseek-v4-pro`.
- DeepSeek official docs state `deepseek-chat` and `deepseek-reasoner` are compatibility names scheduled for deprecation
  on `2026-07-24T15:59:00Z`.
- Alibaba Cloud Model Studio official docs list Qwen-Plus models including `qwen-plus` and prices per 1M input/output
  tokens.
- `scripts/ai/run-personal-ai-provider-smoke.mjs` supports `alibaba` and `openai_compatible`, defaults to `dry_run`,
  requires `TIKU_PROVIDER_SMOKE_APPROVED=1` for execution, and emits a redacted envelope.
- `scripts/local/Invoke-DeepSeekProviderSmoke.ps1` reads `.env.local` by default, so it remains read-only legacy context
  and is not selected for the first AP-01 smoke route.

## Detailing Result

Future provider smoke target, still blocked until fresh approval:

- DeepSeek:
  - provider adapter: `openai_compatible`
  - provider name: `deepseek`
  - base URL host: `api.deepseek.com`
  - env key alias: `DEEPSEEK_API_KEY`
  - model: `deepseek-v4-flash`
- Qwen:
  - provider adapter: `alibaba`
  - env key alias: `ALIBABA_API_KEY`
  - model: `qwen-plus`

Execution limits recorded:

- max request count: `1` per provider;
- max total request count: `2` only if both providers are explicitly approved;
- timeout: `30000` ms per provider;
- retry limit: `0`;
- spend ceiling: `USD 0.05` for one provider, or `USD 0.10` total for both providers;
- Cost Calibration Gate remains blocked.

## Gates

- localFullLoopGate: not applicable; AP-01 detailing is docs/state and dry-run command validation only.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after detailing and wait for fresh AP-01 provider smoke approval or a pre-execution
  runner hardening task.
- nextModuleRunCandidate: `ap-01-provider-smoke-harness-token-cap-hardening` if the user wants an explicit output token
  cap before real spend; otherwise `ap-01-provider-smoke-execution` after fresh approval.
- blocked remainder: real provider/model calls, provider configuration change, `.env*` read/write/output, secret/env
  value disclosure, Cost Calibration Gate, staging/prod/cloud/deploy, payment/external-service, dependencies,
  schema/drizzle/migration, product source, test source, e2e changes, PR, push, force push, destructive DB, and raw
  sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                        | Result                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible ... --dry-run`                                                | pass; `requestCount: 0`, `providerCallExecuted: false`, `resultStatus: dry_run`, redaction passed |
| `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba ... --dry-run`                                                          | pass; `requestCount: 0`, `providerCallExecuted: false`, `resultStatus: dry_run`, redaction passed |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability providerKey -Intent declare_adapter`                                                      | pass; adapter contract ready, no execution, env destination confirmation still required           |
| `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability providerCall -Intent declare_adapter`                                                     | pass; adapter contract ready, no execution, provider call task approval still required            |
| `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts` | pass; 2 files, 7 tests                                                                            |
| scoped Prettier write/check                                                                                                                    | pass; scoped write then check passed                                                              |
| `git diff --check`                                                                                                                             | pass                                                                                              |
| `npm.cmd run lint`                                                                                                                             | pass                                                                                              |
| `npm.cmd run typecheck`                                                                                                                        | pass                                                                                              |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                       | pass                                                                                              |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                  | pass                                                                                              |

## Redaction

This evidence records only AP ids, task ids, use case ids, public file paths, provider/model ids, provider host names,
env key aliases, command names, status decisions, ceilings, and approval boundaries. It does not include `.env*` content,
provider key values, raw prompts, raw model/provider responses, provider payloads, secrets, env values, tokens,
Authorization headers, database URLs, raw question bank content, student answers, standard answers, cleartext
`redeem_code`, private row data, screenshots, traces, HTML reports, or private file URLs.
