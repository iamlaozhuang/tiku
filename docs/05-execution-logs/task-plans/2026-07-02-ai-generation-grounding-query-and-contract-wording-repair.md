# 2026-07-02 AI Generation Grounding Query And Contract Wording Repair Task Plan

## Scope

- Task id: `ai-generation-grounding-query-and-contract-wording-repair-2026-07-02`
- Branch: `codex/ai-generation-grounding-query-wording-repair`
- Goal: repair the shared AI 出题 / AI组卷 grounding query so runtime-imported RAG chunks can become sufficient, and remove `合同已就绪` / local validation wording from ordinary AI generation UI across shared content admin, organization admin, and student AI generation surfaces.
- Trigger: post-runtime-resource Provider rerun still showed evidence count `0` and ordinary UI technical wording after runtime resources were imported.

## Root Cause Hypothesis

- Runtime resources exist and are retrievable by profession/level, but the Provider grounding query includes tokens such as `AI出题`, `3级`, and `single_choice` while runtime-imported chunk headers emphasize `AI 出题`, `level 3`, `marketing`, and `theory`. The local deterministic retrieval score can remain below sufficient threshold when the query contains too many non-matching tokens.
- Shared admin UI still renders `合同已就绪` and a local validation evidence phrase in ordinary operator-facing copy.

## TDD Plan

1. RED: add focused grounding test showing a runtime-import-style marketing level 3 chunk set must be sufficient for the owner-preview grounding query.
2. RED: add focused admin UI tests/source scans that reject visible `合同已就绪` and `本地验证证据` in ordinary AI generation surfaces.
3. RED: add a cross-surface static scan over personal student, content admin, and organization admin AI 出题 / AI组卷 entry files so the same issue cannot be missed on another role surface.
4. GREEN: adjust shared grounding query construction to align with runtime RAG matching tokens without adding a parallel retrieval path.
5. GREEN: replace technical ordinary UI wording with business-language copy.
6. Validate focused tests plus lint/typecheck/governance gates.

## Cross-Surface Scan Gate

- Covered role surfaces:
  - `personal_advanced_student_ai_question_generation`
  - `personal_advanced_student_ai_paper_generation`
  - `organization_advanced_employee_ai_question_generation`
  - `organization_advanced_employee_ai_paper_generation`
  - `organization_advanced_admin_ai_question_generation`
  - `organization_advanced_admin_ai_paper_generation`
  - `content_admin_ai_question_generation`
  - `content_admin_ai_paper_generation`
- Static scan targets:
  - `src/app/(student)/ai-generation/page.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - `src/app/(admin)/content/ai-question-generation/page.tsx`
  - `src/app/(admin)/content/ai-paper-generation/page.tsx`
  - `src/app/(admin)/organization/ai-question-generation/page.tsx`
  - `src/app/(admin)/organization/ai-paper-generation/page.tsx`
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- Required checks:
  - The routes continue to reuse shared student/admin AI generation components.
  - Ordinary user-facing UI must not render `合同已就绪` or `本地验证证据`.
  - Internal fields may remain in DTO sanitization code, but cannot appear as ordinary visible labels or status copy.

## Boundaries

- Allowed source/test files:
  - `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
  - `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`
- No DB connection/mutation, Provider call, browser runtime, `.env*`, dependency/package/lockfile, schema/migration/seed, staging/prod/deploy, e2e, Cost Calibration, release readiness, final Pass.
- Evidence remains summary-only and must not include prompt, payload, AI output, generated content, or full resource/chunk text.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-grounding-query-and-contract-wording-repair.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-grounding-query-and-contract-wording-repair.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-grounding-query-and-contract-wording-repair.md src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounding-query-and-contract-wording-repair-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounding-query-and-contract-wording-repair-2026-07-02 -SkipRemoteAheadCheck
```

## Exit Criteria

- Runtime-import-style chunks can produce `sufficient` grounding through the shared query path.
- Ordinary admin AI generation UI no longer renders `合同已就绪` or `本地验证证据`.
- Existing student/admin Provider grounding gates remain intact.
- Follow-up browser Provider rerun is explicitly required after source repair.
