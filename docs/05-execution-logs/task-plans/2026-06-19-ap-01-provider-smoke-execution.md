# AP-01 Provider Smoke Execution Plan

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution`
- Created at: `2026-06-19T00:00:00-07:00`
- Task kind: `provider_smoke_execution`
- Human approval: user fresh approved AP-01 provider smoke execution for one provider first, prioritizing DeepSeek
  `deepseek-v4-flash`; second provider remains blocked until this result is reviewed.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-harness-token-cap-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-harness-token-cap-hardening.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

## Exact Provider Target

- Provider adapter: `openai_compatible`
- Provider name: `deepseek`
- Base URL: `https://api.deepseek.com`
- Env key alias: `DEEPSEEK_API_KEY`
- Model: `deepseek-v4-flash`
- Environment: local dev process only
- Max requests: `1`
- Max output tokens: `8`
- Timeout: `30000` ms
- Retry limit: `0`
- Spend ceiling: `USD 0.05`
- Cost Calibration Gate: blocked; this smoke may record provider-returned usage counts but must not claim calibrated
  cost.

## Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-execution.md`

## Blocked Files And Capabilities

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
- provider configuration change;
- Qwen or any second provider execution;
- application route execution and DB writes;
- Cost Calibration Gate;
- staging/prod/cloud/deploy;
- payment/external-service;
- schema/migration/dependency changes;
- PR, push, force push;
- raw sensitive evidence.

## Exact Commands

Dry-run command:

```powershell
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
```

Capability gates:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution -Capability providerKey -Intent use_capability
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution -Capability providerCall -Intent use_capability
```

Approved execute command:

```powershell
$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --execute; Remove-Item Env:\TIKU_PROVIDER_SMOKE_APPROVED -ErrorAction SilentlyContinue
```

## Stop And Rollback

Stop immediately if:

- `.env*` would be read, written, copied, or output;
- the provider key value, token, Authorization header, database URL, raw prompt, raw output, provider payload, or provider
  response would be written to evidence;
- request count would exceed `1`;
- the command would target anything other than local process and `api.deepseek.com`;
- the command would mutate DB, app provider configuration, model config, source, tests, schema, migrations, dependencies,
  staging/prod/cloud/deploy, payment, or external services beyond the named provider endpoint.

Rollback:

- unset `TIKU_PROVIDER_SMOKE_APPROVED`;
- close the PowerShell session if provider key values were process-scoped;
- no DB/source/application rollback is required because the selected runner does not write DB rows, model config, or
  files;
- if docs/state execution evidence needs reverting, revert only this docs/state commit.

## Evidence Redaction Boundary

Evidence may record:

- provider adapter, provider name, model id, base URL host, env key alias, request count, max output tokens, timeout,
  retry limit, result status, failure category, duration, usage summary if returned, and redaction status.

Evidence must not record:

- `.env*` content, provider key value, token, Authorization header, database URL, raw prompt, raw model output, raw
  provider request, raw provider response, provider payload, generated content, raw question bank content, student answer,
  standard answer, cleartext `redeem_code`, row data, screenshots, traces, HTML reports, or private file URLs.

## Validation Plan

- Run dry-run command.
- Run provider key and provider call capability gates with `use_capability`.
- Run approved DeepSeek execute command once.
- If DeepSeek passes, do not run Qwen in this task; recommend a separate fresh approval for Qwen.
- Run scoped Prettier write/check, `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, pre-commit
  hardening, and module closeout readiness.

Cost Calibration Gate remains blocked.
