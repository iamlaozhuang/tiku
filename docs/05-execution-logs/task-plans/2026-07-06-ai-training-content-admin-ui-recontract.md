# 2026-07-06 AI training content admin UI recontract

## Task

- id: `ai-training-content-admin-ui-recontract-2026-07-06`
- branch: `codex/ai-training-content-admin-ui-recontract-2026-07-06`
- parent goal: `ai-generation-recontract-local-repair-goal-2026-07-06`

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`

## Scope

Recontract the content-admin AI auxiliary UI and content paper draft handoff to the 2026-07-06 product contract:

- page label: `内容 AI 辅助`;
- AI出题 submit: `生成待审题目草稿`;
- AI组卷 submit: `生成待审试卷草稿`;
- content AI组卷 source label: `平台正式题库`;
- content AI组卷 result/adoption uses a reviewable paper draft container;
- content AI组卷 formal draft payload references selected platform formal questions from `paperAssembly`, not AI-generated companion question drafts;
- user-visible wording remains Chinese product language and avoids technical terms.

## Out Of Scope

- No dependency, package, or lockfile change.
- No schema, migration, seed, env, secret, staging, production, deploy, or Cost Calibration work.
- No direct DB runtime, browser role matrix, Provider execution, or cost measurement.
- No release readiness, final Pass, or production usability claim.
- No broad quantity/validation package beyond content UI/payload changes needed by this task.

## Files

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-06-ai-training-content-admin-ui-recontract.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-training-content-admin-ui-recontract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-training-content-admin-ui-recontract.md`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/lib/admin-ai-generation-formal-draft-payload.ts`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

Blocked:

- `.env*`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `e2e/**`
- staging/prod/deploy/provider/cost-calibration files or operations

## TDD Plan

1. Add RED tests for content-admin UI copy, source boundary, review actions, and paper draft payload using selected formal questions.
2. Implement the smallest source changes to pass those tests.
3. Run focused unit tests, then typecheck, lint, diff check, scoped prettier, and Module Run v2 pre-commit hardening.

## Evidence Policy

Evidence may record file paths, command names, exit status, counts, role labels, and safe product labels only.

Evidence must not record credentials, tokens, sessions, cookies, env values, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.
