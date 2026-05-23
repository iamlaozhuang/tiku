# Evidence: phase-10-local-deepseek-provider-smoke-runtime

## Metadata

- Task id: `phase-10-local-deepseek-provider-smoke-runtime`
- Branch: `codex/phase-10-local-deepseek-provider-smoke-runtime`
- Base: `master`
- Evidence created at: `2026-05-23T20:55:00+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- Human approval: 用户已明确批准在 local dev 中把真实 DeepSeek API 纳入 Tiku 本地 smoke test。
- Scope note: this task was added because `phase-10-local-real-ai-provider-smoke-test` is correctly blocked by its original `allowedFiles`, which do not permit real provider runtime changes.

## Scope

Allowed files used:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`
- `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

No dependency, lockfile, environment example, local secret file, schema, migration, route handler, production runtime, staging resource, production resource, deployment, public storage URL, raw prompt, raw answer, raw model response, provider payload, response body, Authorization header, API key, secret, token, password, database URL, or real-content excerpt was changed, printed, committed, or recorded.

## Implementation Summary

- Added `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`.
- The script reads `.env.local` from disk and validates:
  - `APP_ENV=dev`
  - `AI_PROVIDER_ENABLED=true`
  - `DEEPSEEK_API_KEY` is present and reported only as `present_redacted`
  - `DEEPSEEK_BASE_URL` uses HTTPS and a `deepseek.com` host
  - `DEEPSEEK_MODEL` is present
- The script sends a bounded sample:
  - request count: `1`
  - retry count: `0`
  - `max_tokens`: `4`
  - finite timeout: `10` seconds
  - no retry storm
- The script output is a sanitized JSON summary only.
- Added `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts` to guard the script against unbounded request settings and obvious secret-output patterns.

## Local Provider Smoke Result

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-DeepSeekProviderSmoke.ps1
```

Sandbox result:

- Exit code: `1`
- Result: `blocked`
- Failure class: `network_or_runtime_error`
- Secret hygiene: pass; output contained `present_redacted`, `no API key`, `no secret`, `redacted`, and `bounded sample`.
- Provider payload hygiene: pass; no response body, raw provider payload, raw prompt, raw answer, raw model response, Authorization header, API key, or secret was printed.

Escalated local dev result after sandbox network block:

- Exit code: `0`
- Provider: `deepseek`
- Environment: `dev`
- Feature flag: enabled
- API key: `present_redacted`
- Base URL host: `api.deepseek.com`
- Model: present
- Request count: `1`
- Retry count: `0`
- `max_tokens`: `4`
- HTTP status: `200`
- Latency bucket: `1s_to_3s`
- `choicesPresent`: `true`
- `usagePresent`: `true`
- Result: `pass`
- Redaction markers present: `no API key`, `no secret`, `redacted`, `bounded sample`

The executed smoke output did not include raw prompt, raw answer, raw model response, provider payload, response body, Authorization header, API key, secret, token, password, database URL, or real-content excerpt.

## Security Review

- Reviewer: Codex
- Review date: `2026-05-23`
- Files reviewed:
  - `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`
  - `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/04-agent-system/state/project-state.yaml`
- Risk types reviewed: `model_provider`, `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, `ai_call_log`, `secret_or_env_change`, `external_service_config`, `evidence_integrity`
- Abuse cases considered:
  - accidental `.env.local` dump
  - API key or Authorization header logging
  - raw prompt/raw answer/raw model response evidence leakage
  - provider response body logging on HTTP failure
  - retry storm or unbounded token usage
  - staging/prod execution
  - non-DeepSeek endpoint or non-HTTPS endpoint
- Data exposure review: script output is fixed to redacted summary fields and does not serialize request body, response body, headers, or environment values.
- Authorization boundary review: no user, admin, organization, employee, session, personal_auth, org_auth, or redeem_code runtime boundary is touched.
- API contract review: no REST route, DTO, public URL, or response contract is changed.
- Test coverage: unit test checks bounded settings and obvious secret-output regressions; live smoke proves the local provider path once.
- Accepted gaps: this script does not persist `ai_call_log` rows and does not test semantic quality of `ai_scoring`, `ai_explanation`, `ai_hint`, or `kn_recommendation`; it only proves local DeepSeek connectivity and response-shape safety for a bounded sample.
- Verdict: `APPROVE`

## Validation Commands

Initial focused validation:

- `npm.cmd run test:unit -- tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`: pass, `1` file and `1` test passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-DeepSeekProviderSmoke.ps1`: pass outside the sandbox after the sandbox network block; one bounded DeepSeek request returned HTTP `200` with `choices` and `usage` present.

Required validation results after this evidence was written:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-deepseek-provider-smoke-runtime`: pass; dependency `phase-10-local-real-ai-provider-safety-plan` is closed, task status was `implemented`, and validation commands were listed. The script display reported `Allowed Files: none` due to the existing lightweight parser behavior, while the queue YAML contains the expected `allowedFiles` list and Git inventory below verifies the actual changed files.
- `Select-String -Path 'docs\05-execution-logs\evidence\2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md' -Pattern 'no API key|no secret|redacted|bounded sample'`: pass; matches found.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `104` files and `380` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js production build completed successfully with `.env.local` loaded and no secret values printed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files are limited to the new task plan, evidence, local smoke script, safety unit test, and agent state/queue files.

## Residual Risk

- The script proves one local DeepSeek connectivity and response-shape smoke only; it is not a production provider adapter.
- The script does not write `ai_call_log`; a later task can wire this into service-level provider runners if its `allowedFiles` and risk gates permit.
- The script depends on local `.env.local` values remaining present and valid; evidence must never include their raw values.

## Taste Compliance Self-Check

- Frontend visual taste: no UI, Tailwind, color, font, layout, or interaction change.
- Loading/empty/error states: no frontend data state changed.
- Interaction feedback: no clickable UI changed.
- Tailwind class order: no Tailwind classes changed.
- Backend/API contract: no REST route or API response contract changed.
- N+1/SQL/schema: no database query, schema, migration, or Drizzle code changed.
- Naming discipline: used glossary terms including `model_provider`, `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `ai_call_log`; no new unregistered business abbreviations introduced.
- Immutability/clean logic: script uses bounded local variables and structured summary output; no broad runtime mutation.
- Secret hygiene: no API key, no secret, redacted output only, bounded sample only.
- Environment isolation: local `dev` only; no staging, prod, deployment, production resource, production database, public object storage, or cloud resource touched.
