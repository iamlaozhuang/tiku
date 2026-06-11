# Task Plan: batch-112-personal-learning-ai-redacted-result-reference-local-contract

## Task

- id: `batch-112-personal-learning-ai-redacted-result-reference-local-contract`
- task kind: `implementation`
- local validation level: `L2 local contract`
- automation owner: `tiku-module-run-v2-autopilot`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/05-execution-logs/evidence/batch-111-personal-learning-ai-request-context-local-contract.md`
- `docs/05-execution-logs/audits-reviews/batch-111-personal-learning-ai-request-context-local-contract.md`
- Existing request and task evidence contracts under `src/server/models`, `src/server/contracts`, `src/server/validators`, and `src/server/services`

## Goal

Implement the low-risk local result-reference contract for personal learning AI generation. The contract must expose only
redacted task/result references and `ai_call_log` summary metadata for owner-facing personal AI learning flows, without
storing or exposing raw generated AI content, prompts, provider payloads, secrets, internal numeric ids, or formal content
write paths.

## Allowed Files

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Work

- `.env.local`, `.env.example`
- package and lock files
- `src/db/schema/**`, `drizzle/**`
- `e2e/**`, Playwright artifacts, browser verification
- provider calls, provider configuration, provider cost measurement, or Cost Calibration Gate
- schema/migration, dependency, staging/prod/cloud/deploy, payment, external-service, PR, or force push
- raw prompt, raw generated AI content, provider payload, Authorization header, database URL, raw DB row, plaintext
  `redeem_code`, full `paper`, or full `material` content in evidence

Cost Calibration Gate remains blocked.

## TDD Plan

### RED

Create `src/server/services/personal-ai-generation-result-reference-service.test.ts` first and run:

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-reference-service.test.ts
```

Expected failure: module `./personal-ai-generation-result-reference-service` does not exist.

Focused behaviors:

1. A succeeded personal AI generation task returns a redacted `summary_only` result reference with `taskPublicId`,
   `resultPublicId`, `aiCallLogPublicId`, `evidenceStatus`, and `citationCount`.
2. A pending task returns no result public id but preserves redacted `ai_call_log` reference and `null` optional fields.
3. Failed tasks require `failureCategory` and keep visibility summary-only.
4. Invalid or sensitive-shaped payloads are omitted from the DTO, including numeric ids, raw prompts, raw generated
   content, provider payloads, tokens, and plaintext `redeem_code` fixtures.

### GREEN

Add the smallest local contract surface needed:

- `src/server/models/personal-ai-generation-result-reference.ts`
- `src/server/contracts/personal-ai-generation-result-reference-contract.ts`
- `src/server/validators/personal-ai-generation-result-reference.ts`
- `src/server/services/personal-ai-generation-result-reference-service.ts`

The service must follow the existing standard response envelope and keep API-facing DTO fields in `camelCase`.

### REFACTOR

Keep this task local-contract only. Reuse existing AI task type/status/failure/evidence enums where possible. Do not add
repositories, routes, provider execution, schema changes, or formal content write shortcuts.

## Validation Commands

1. `npm.cmd run lint`
2. `npm.cmd run typecheck`
3. `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-reference-service.test.ts`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-112-personal-learning-ai-redacted-result-reference-local-contract`

If this automation worktree lacks `node_modules`, use the existing `D:\tiku\node_modules\.bin` tooling surface on `PATH`
when available. Do not install dependencies or change package/lock files.

## Risk Defense

- Result references are public-id based and summary-only.
- `ai_call_log` is referenced only by public id and redacted status; no raw provider, prompt, response, or generated
  content is recorded.
- Formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, `exam_report`, and `mistake_book` write
  paths remain untouched.
- Evidence must record local L2 contract behavior only and leave L5 UI/browser and local e2e tasks to later batches.
