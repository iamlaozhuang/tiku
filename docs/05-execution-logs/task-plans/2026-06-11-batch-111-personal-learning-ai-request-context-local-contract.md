# Task Plan: batch-111-personal-learning-ai-request-context-local-contract

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
- Latest phase85 evidence and audit review

## Goal

Implement the low-risk local request-context contract for personal learning AI generation. The task should prove that
personal AI request creation preserves the `personal_auth` authorization boundary and can carry redacted `paper` or
`mock_exam` context selection without provider calls, schema changes, env/secret work, or formal content writes.

## Scope

Allowed files:

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

Blocked:

- `.env.local`, `.env.example`
- package and lock files
- `src/db/schema/**`, `drizzle/**`
- `e2e/**`, Playwright artifacts, browser verification
- provider calls, provider configuration, raw prompts, raw generated AI content, or provider payload evidence
- staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost Calibration Gate

## Implementation Plan

1. Inspect existing `personal-ai-generation-request-*`, AI task request, authorization context, `paper`, and `mock_exam`
   local contracts.
2. Add focused unit coverage for redacted request context selection:
   - no context;
   - `paper` context by public id;
   - `mock_exam` context by public id;
   - invalid mixed or malformed context rejected.
3. Implement the smallest model/contract/validator/service changes needed to pass the focused tests.
4. Preserve DTO `camelCase`, internal config/domain strings as `snake_case`, and public ids instead of numeric ids.
5. Keep request creation delegated to the local AI task request contract; do not introduce provider, schema, repository,
   API route, or UI work.

## Validation Plan

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`

If local `node_modules` is missing in this automation worktree, use `D:\tiku\node_modules\.bin` on `PATH` for validation
when available. Do not install dependencies.

## Risk Controls

- Evidence must stay redacted: no raw prompt, generated AI content, provider payload, database URL, Authorization header,
  plaintext `redeem_code`, raw DB rows, or full `paper` content.
- Formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, `exam_report`, and `mistake_book` write
  paths remain untouched.
- Cost Calibration Gate remains blocked.
