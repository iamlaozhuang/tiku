# Task Plan: batch-175-personal-learning-ai-cost-calibration-gate

## Scope

- Task: `batch-175-personal-learning-ai-cost-calibration-gate`
- Branch: `codex/batch-175-personal-learning-ai-cost-calibration-gate`
- Goal: record a docs-only cost calibration gate from the batch-174 redacted usage summary without any additional provider call.
- Fresh approval: user prompt on 2026-06-14 approved docs/state/queue/task-plan/evidence/audit only and required stopping for separate approval if a real provider call becomes necessary.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-174-personal-learning-ai-local-provider-sandbox-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-174-personal-learning-ai-local-provider-sandbox-smoke.md`

## Boundaries

Allowed:

- Use the batch-174 redacted usage summary only.
- Use public pricing documentation for a non-authenticated rate lookup.
- Write state, queue, task plan, evidence, and audit review for batch-175.
- Run local validation commands that do not read `.env.local` or real secrets.

Blocked:

- Real provider calls, model requests, quota use, provider payload generation, or provider response collection.
- Reading, creating, modifying, or printing `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Source, tests, e2e, schema, Drizzle, package, lockfile, staging/prod/cloud/deploy/payment/external-service work.
- PR creation, force-push, Cost Calibration provider measurement beyond existing batch-174 evidence, and formal generated-content writes.
- Recording raw prompt, provider payload, raw provider response, raw generated output, Authorization header, token, secret, database URL, or row data.

## Calibration Inputs

- Provider: `openai_compatible`
- Provider name: `deepseek`
- Base URL: `https://api.deepseek.com`
- Model: `deepseek-v4-flash`
- Source evidence: batch-174 redacted summary
- Request count: `1`
- Input tokens: `18`
- Cached input tokens: `0`
- Cache miss input tokens: `18`
- Output tokens: `86`
- Total tokens: `104`
- Reasoning tokens: `84`, treated as a detail of output usage and not double-counted because `inputTokens + outputTokens = totalTokens`

## Pricing Assumption

Public DeepSeek pricing checked on 2026-06-14:

- `deepseek-v4-flash` cache-hit input: `$0.0028` per 1M tokens
- `deepseek-v4-flash` cache-miss input: `$0.14` per 1M tokens
- `deepseek-v4-flash` output: `$0.28` per 1M tokens

Source: `https://api-docs.deepseek.com/quick_start/pricing`

## Cost Formula

```text
estimated_cost_usd =
  (cached_input_tokens / 1_000_000 * cache_hit_input_price)
  + (cache_miss_input_tokens / 1_000_000 * cache_miss_input_price)
  + (output_tokens / 1_000_000 * output_price)
```

For batch-174:

```text
(0 / 1_000_000 * 0.0028)
+ (18 / 1_000_000 * 0.14)
+ (86 / 1_000_000 * 0.28)
= 0.00002660 USD
```

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-175-personal-learning-ai-cost-calibration-gate.md docs/05-execution-logs/evidence/2026-06-13-batch-175-personal-learning-ai-cost-calibration-gate.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-175-personal-learning-ai-cost-calibration-gate.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-175-personal-learning-ai-cost-calibration-gate`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-175-personal-learning-ai-cost-calibration-gate`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-175-personal-learning-ai-cost-calibration-gate`

`npm.cmd run build` will not be run because local Next.js build has previously reported loading `.env.local`, outside this task's explicit no real env/secret access boundary.

## Risks

- Published pricing can change; this gate records the pricing source and check date.
- Batch-174 smoke is a tiny sample, so this calibrates the minimum smoke envelope, not production workload economics.
- Any future live cost measurement, larger sample, provider call, or quota use requires separate fresh approval.
