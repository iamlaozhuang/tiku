# AP-01 Provider Smoke Execution Approval Detailing Plan

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-approval-detailing`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-approval-detailing`
- Created at: `2026-06-19T00:00:00-07:00`
- Task kind: `high_risk_approval_detailing`
- Execution result for this packet: approval detailing only; real provider/model execution remains blocked.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`
- DeepSeek official API docs:
  - `https://api-docs.deepseek.com/`
  - `https://api-docs.deepseek.com/quick_start/pricing`
- Alibaba Cloud Model Studio official docs:
  - `https://www.alibabacloud.com/help/en/model-studio/models`
  - `https://www.alibabacloud.com/help/en/model-studio/model-pricing`

## Current Facts

- The previous AP-01 approval package is closed as a minimum package only.
- The matrix row for `UC-STD-AI-SCORING-EXPLANATION` remains `release_blocked`.
- The previous AP-01 command examples included the older DeepSeek compatibility alias; the official DeepSeek docs now
  list `deepseek-v4-flash` and `deepseek-v4-pro`, while `deepseek-chat` and `deepseek-reasoner` are compatibility names
  scheduled for deprecation on `2026-07-24T15:59:00Z`.
- The repo already includes `ai`, `@ai-sdk/alibaba`, and `@ai-sdk/openai-compatible` dependencies, so this detailing task
  does not request dependency changes.
- `scripts/ai/run-personal-ai-provider-smoke.mjs` is the preferred execution entrypoint for a future smoke because it:
  - supports `alibaba` and `openai_compatible`;
  - defaults to `dry_run` unless `--execute` is present;
  - requires `TIKU_PROVIDER_SMOKE_APPROVED=1` for execution;
  - reads provider secrets only from process environment variables;
  - emits a redacted envelope and rejects forbidden evidence keys.
- `scripts/local/Invoke-DeepSeekProviderSmoke.ps1` is read-only legacy context for this task. It reads `.env.local` by
  default, so it is not the recommended AP-01 first execution route unless a later approval explicitly allows `.env*`
  read.

## Scope

This packet may only clarify the future approval boundary and run local dry-run or static validation. It may not execute
any real provider call.

Allowed changed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`

Blocked files:

- `.env*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`

Blocked capabilities until fresh approval:

- provider/model call;
- provider configuration change;
- `.env*` read/write/output;
- secret/env value access or disclosure;
- Cost Calibration Gate;
- staging/prod/cloud/deploy;
- payment/external-service;
- dependency/package/lockfile change;
- schema/drizzle/migration;
- product source or test source change;
- PR, push, or force push;
- raw sensitive evidence.

## Provider And Model Decision

### DeepSeek Candidate

- Provider adapter: `openai_compatible`
- Provider name: `deepseek`
- Base URL: `https://api.deepseek.com`
- Env key alias: `DEEPSEEK_API_KEY`
- Model: `deepseek-v4-flash`
- Rationale: official DeepSeek docs list `deepseek-v4-flash` as a current OpenAI-format model. The older
  `deepseek-chat` alias should not be used for new approval text because it is scheduled for deprecation.

### Qwen Candidate

- Provider adapter: `alibaba`
- Env key alias: `ALIBABA_API_KEY`
- Model: `qwen-plus`
- Rationale: repo tests and the current smoke runner already use `qwen-plus`; official Alibaba Cloud Model Studio docs
  list `qwen-plus` in the Qwen-Plus pricing table. A later human approval may replace it with a region-specific pinned
  model only if the exact account region and model id are restated.

## Call Entrypoint

Use `scripts/ai/run-personal-ai-provider-smoke.mjs` directly from PowerShell.

Do not use the app runtime, student routes, admin routes, model-config mutation, `.env.local`, or database-backed
provider configuration for the first AP-01 smoke. This keeps the first provider test limited to one redacted SDK call and
zero application state writes.

Dry-run command shape for this task:

```powershell
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
```

Future execute command shape, still blocked until fresh approval:

```powershell
$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --execute
$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --execute
```

The future execute commands require provider key values to already be present in the current process environment. The
command text must never include secret values.

## Request, Retry, Timeout, And Cost Ceilings

Recommended first approval shape:

- Run either one provider first, or explicitly approve both providers in one packet.
- Max request count: `1` per provider command.
- Max total request count if both providers are approved: `2`.
- Timeout: `30000` ms per provider command.
- Retry limit: `0`, enforced by the runner with `maxRetries: 0`.
- Spend ceiling: `USD 0.10` total for a dual-provider AP-01 smoke; `USD 0.05` if only one provider is approved.
- Cost Calibration Gate: still blocked. The smoke may record provider-returned usage counts if present, but must not
  claim calibrated cost or unit economics.

Residual implementation note:

- The current generic runner has hard caps for request count, timeout, and retry count, but it does not currently set a
  hard output-token cap in the `generateText` call. The prompt asks for one short confirmation word and the spend ceiling
  is low, but a stricter pre-execution hardening task can add an explicit output token cap before the real provider call.

## Stop And Rollback

Stop immediately if:

- the command would read or write `.env*`;
- a secret value would be printed, copied, or written to evidence;
- a command would call more than the approved provider count or request count;
- a command would target staging, prod, cloud, deploy, payment, or another external service beyond the named provider
  endpoint;
- a command would mutate product source, tests, schema, migrations, dependencies, DB state, app provider configuration,
  or model config;
- output contains raw prompt, raw answer, provider payload, provider response, Authorization header, token, database URL,
  full question/material content, row data, trace, screenshot, or HTML report.

Rollback for the first AP-01 smoke:

- unset `TIKU_PROVIDER_SMOKE_APPROVED` and the provider key process environment variable;
- close the PowerShell session that held provider key values;
- make no application rollback because the selected runner does not write DB rows, model config, source, or files;
- if docs/state detailing needs reverting, revert only this docs/state commit.

## Evidence Redaction Boundary

Evidence may record:

- task id, AP id, use case id, branch, commit baseline, and command names;
- provider adapter, provider display name, model id, base URL host, and env key alias;
- request ceiling, timeout, retry limit, spend ceiling, pass/fail, failure category, duration, and provider usage counts
  if returned;
- redaction status and blocked remainder.

Evidence must not record:

- `.env*` content;
- provider key value, token, Authorization header, database URL, or secret material;
- raw prompt, raw model output, raw provider request, raw provider response, provider payload, or generated content;
- raw question bank content, student answer, standard answer, cleartext `redeem_code`, row data, screenshots, traces,
  HTML reports, or private file URLs.

## Fresh Approval Text Required

To execute AP-01 later, reply with a filled version of this text:

```text
I fresh approve AP-01 provider smoke execution for task ap-01-provider-smoke-execution-approval-detailing and useCase
UC-STD-AI-SCORING-EXPLANATION.

Exact provider targets:
- DeepSeek: approved or blocked
- DeepSeek provider adapter: openai_compatible
- DeepSeek provider name: deepseek
- DeepSeek base URL: https://api.deepseek.com
- DeepSeek env key alias, no secret value: DEEPSEEK_API_KEY
- DeepSeek model: deepseek-v4-flash
- Qwen: approved or blocked
- Qwen provider adapter: alibaba
- Qwen env key alias, no secret value: ALIBABA_API_KEY
- Qwen model: qwen-plus

Exact execution limits:
- environment: local dev process only
- maxRequestsPerProvider: 1
- maxTotalRequests: 1 if one provider is approved, or 2 if both providers are approved
- maxSpend: USD 0.05 for one provider, or USD 0.10 for both providers
- timeoutMsPerProvider: 30000
- retryLimit: 0

Exact allowed commands:
<paste only the approved --execute command or commands from this plan>

I explicitly keep .env* disclosure, secret value output, unbounded provider/model calls, provider configuration change,
application route execution, DB writes, staging/prod/cloud/deploy, payment/external-service, Cost Calibration Gate,
schema/drizzle/migration, package/lockfile/dependency, product source, tests/e2e changes, PR, push, force-push,
destructive DB, and raw sensitive evidence blocked.

Rollback/stop/redaction:
Use the rollback, stop conditions, and redaction evidence boundary from
docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md.
```

## Validation Plan

- Run both dry-run smoke command shapes with `--dry-run`.
- Run provider key and provider call local capability gates in declare-adapter mode only.
- Run focused smoke runner unit tests.
- Run docs formatting and mechanism closeout gates.
- Keep AP-01 release-blocked until a later fresh approval supplies exact execution commands.

Cost Calibration Gate remains blocked.
