# AP-01 Provider Smoke Execution DeepSeek env.local Ready Plan

## Task

- AP id: `AP-01`
- Task id: `ap-01-provider-smoke-execution-deepseek-env-local-ready`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-deepseek-env-local-ready`
- Created at: `2026-06-19T00:00:00-07:00`
- Task kind: `provider_smoke_execution`
- Human approval: user confirmed `.env.local` has been updated and requested continuing after the governed handoff.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-deepseek-env-local-prep.md`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Exact Provider Target

- Provider adapter: `openai_compatible`
- Provider name: `deepseek`
- Base URL: `https://api.deepseek.com`
- Env key alias: `DEEPSEEK_API_KEY`
- Env source: local-only `.env.local`
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
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-provider-smoke-execution-deepseek-env-local-ready.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-deepseek-env-local-ready.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-execution-deepseek-env-local-ready.md`

## Blocked Files And Capabilities

- `.env*` write, print, copy, stage, or commit.
- Reading `.env.local` keys other than `DEEPSEEK_API_KEY`.
- Qwen or any second provider execution.
- Provider configuration change.
- Application route execution and DB writes.
- Cost Calibration Gate.
- Staging/prod/cloud/deploy.
- Payment/external-service.
- Schema/migration/dependency changes.
- Product source, tests, and e2e changes.
- PR, push, force push.
- Raw sensitive evidence.

## Exact Commands

Dry-run command:

```powershell
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run
```

Capability gates:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-deepseek-env-local-ready -Capability providerKey -Intent use_capability
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-deepseek-env-local-ready -Capability providerCall -Intent use_capability
```

Redacted `.env.local` presence preflight:

```powershell
$ErrorActionPreference = 'Stop'
$envPath = '.env.local'
if (-not (Test-Path -LiteralPath $envPath)) {
  Write-Output 'DEEPSEEK_API_KEY missing_env_file'
  exit 1
}
$deepseekKey = $null
foreach ($line in Get-Content -LiteralPath $envPath -Encoding UTF8) {
  if ($line -match '^\s*DEEPSEEK_API_KEY\s*=\s*(.*)\s*$') {
    $deepseekKey = $Matches[1].Trim()
    break
  }
}
if ([string]::IsNullOrWhiteSpace($deepseekKey)) {
  Write-Output 'DEEPSEEK_API_KEY missing'
  exit 1
}
Write-Output 'DEEPSEEK_API_KEY present_redacted'
```

Approved execute command:

```powershell
$ErrorActionPreference = 'Stop'
$envPath = '.env.local'
if (-not (Test-Path -LiteralPath $envPath)) {
  Write-Output 'preflight: missing_env_file'
  exit 1
}
$deepseekKey = $null
foreach ($line in Get-Content -LiteralPath $envPath -Encoding UTF8) {
  if ($line -match '^\s*DEEPSEEK_API_KEY\s*=\s*(.*)\s*$') {
    $deepseekKey = $Matches[1].Trim()
    break
  }
}
if ([string]::IsNullOrWhiteSpace($deepseekKey)) {
  Write-Output 'preflight: missing_deepseek_api_key'
  exit 1
}
$exitCode = 1
try {
  $env:DEEPSEEK_API_KEY = $deepseekKey
  $env:TIKU_PROVIDER_SMOKE_APPROVED = '1'
  node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --execute
  $exitCode = $LASTEXITCODE
} finally {
  Remove-Item Env:\DEEPSEEK_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:\TIKU_PROVIDER_SMOKE_APPROVED -ErrorAction SilentlyContinue
}
exit $exitCode
```

## Stop And Rollback

Stop immediately if:

- `.env.local` value would be printed or copied into evidence.
- Any `.env*` file would be modified, staged, or committed.
- The provider key value, token, Authorization header, database URL, raw prompt, raw output, provider payload, or
  provider response would be written to evidence.
- Request count would exceed `1`.
- The command would target anything other than local process and `api.deepseek.com`.
- The command would mutate DB, app provider configuration, model config, source, tests, schema, migrations, dependencies,
  staging/prod/cloud/deploy, payment, or external services beyond the named provider endpoint.

Rollback:

- unset `DEEPSEEK_API_KEY` and `TIKU_PROVIDER_SMOKE_APPROVED` from the command process;
- no DB/source/application rollback is required because the selected runner does not write DB rows, model config, or
  files;
- if docs/state execution evidence needs reverting, revert only this docs/state commit.

## Evidence Redaction Boundary

Evidence may record:

- provider adapter, provider name, model id, base URL host, env key alias, `.env.local` presence as `present_redacted`,
  request count, max output tokens, timeout, retry limit, result status, failure category, duration, usage summary if
  returned, and redaction status.

Evidence must not record:

- `.env*` content, provider key value, token, Authorization header, database URL, raw prompt, raw model output, raw
  provider request, raw provider response, provider payload, generated content, raw question bank content, student answer,
  standard answer, cleartext `redeem_code`, row data, screenshots, traces, HTML reports, or private file URLs.

## Validation Plan

- Run dry-run command.
- Run provider key and provider call capability gates with `use_capability`.
- Run redacted `.env.local` presence preflight.
- Run approved DeepSeek execute command once.
- If DeepSeek passes, do not run Qwen in this task; recommend a separate fresh approval for Qwen.
- Run scoped Prettier write/check, `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, pre-commit
  hardening, and module closeout readiness.

Cost Calibration Gate remains blocked.
