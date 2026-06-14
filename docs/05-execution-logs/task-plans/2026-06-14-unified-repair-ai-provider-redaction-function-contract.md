# Unified Repair AI Provider Redaction Function Contract Plan

## Task

- Task id: `unified-repair-ai-provider-redaction-function-contract`
- Branch: `codex/unified-repair-ai-provider-redaction-function-contract`
- Date: 2026-06-14
- Task kind: scoped implementation candidate

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- Six completed unified standard MVP code audit evidence and audit-review files from 2026-06-14.

## Finding Scope

This task repairs only the rollup theme `AI provider redaction and function contract`.

Covered source findings:

- `AI-RAG-AUDIT-002`: mock provider constructs raw provider payload fields without a visible redaction boundary.
- `AI-RAG-AUDIT-003`: AI function naming differs between prompt registry and admin AI/log UI.
- `AI-RAG-AUDIT-005`: admin AI model configuration is visible only as a frontend runtime surface.
- `SE-AUDIT-004`: provider-gated scoring and learning-suggestion routes are visible only as delegated adapters.
- `ADMIN-OPS-LOGS-AUDIT-005`: provider/model configuration mutations remain co-located with the admin log surface.

Out of scope:

- RAG service layering and retrieval governance.
- Quota ledger implementation or cost calibration.
- Admin log retention implementation.
- Auth/session storage changes.
- Any provider/model request, quota use, env/secret/provider configuration, schema/migration, e2e, dependency change,
  deploy, payment, external-service, PR, or force-push.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/ai/**`
- `src/app/(admin)/ops/ai-audit-logs/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/server/contracts/ai/**`
- `src/server/mappers/ai/**`
- `src/server/validators/ai/**`
- `tests/unit/ai/**`

## Blocked Files And Gates

- Blocked files: `.env.local`, `.env.example`, `.env.*`, package and lock files, `src/db/schema/**`, `drizzle/**`,
  `e2e/**`, and `scripts/**`.
- Blocked gates retained: real provider/model request/quota use, env/secret/provider configuration, Cost Calibration
  Gate, schema/migration, e2e, dependency/package/lockfile, staging/prod/cloud/deploy, payment/external-service, PR,
  and force-push.
- Evidence redaction boundary: no raw prompt, raw answer, provider request, provider response, API key, Authorization
  header, model secret, token, database URL, or row data.

## Implementation Approach

1. Add a focused unit test at `tests/unit/ai/provider-redaction-function-contract.test.ts` and verify RED first.
2. Add or update AI contract/mapper/validator helpers inside allowed AI surfaces only.
3. Remove raw provider payload leakage from the mock-provider return contract by exposing redacted summaries and
   provider execution gate metadata instead of raw request/response payloads.
4. Normalize AI function values to glossary-compatible values such as `ai_scoring`, `ai_explanation`, `ai_hint`, and
   `kn_recommendation`, while keeping explicit mapping for any legacy short aliases needed by existing prompt registry
   code.
5. Keep the admin AI/log UI operating through normalized function values and never expose raw provider execution
   fields or secret-bearing values.

## Validation Plan

RED:

- `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`

GREEN and closeout:

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-ai-provider-redaction-function-contract`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-ai-provider-redaction-function-contract`

If a declared command is unavailable, evidence must record the exact failure and avoid claiming full test coverage.
