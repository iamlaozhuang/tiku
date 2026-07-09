# 2026-07-09 content AI formal draft detail entry task plan

## Task

- Task id: `content-ai-formal-draft-detail-entry-2026-07-09`
- Branch: `codex/content-ai-formal-draft-detail-entry`
- Goal: after content-admin AI adoption has created a formal draft, show a public-id detail entry from AI generation history for the corresponding pending question or paper draft.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-adoption-read-model.md`

## Code Read List

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `src/app/(admin)/content/questions/page.tsx`
- `src/app/(admin)/content/papers/page.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/app/api/v1/questions/[publicId]/route.ts`
- `src/app/api/v1/papers/[publicId]/route.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-paper-ui.test.ts`

## Implementation Plan

1. Locate the existing content AI history/adoption UI and current content question/paper management routes.
2. Add failing tests first for:
   - `draft_created` question result shows a public-id link to the pending question draft detail entry.
   - `draft_created` paper result shows a public-id link to the pending paper draft detail entry.
   - approved/rejected/blocked or missing-target states show safe disabled/empty copy and no link.
3. Implement only UI link/empty-state handling in content AI history.
4. Do not change formal adoption write service, formal publish logic, DB schema, Provider execution, personal AI, organization AI, or organization training logic.

## Risk Defense

- Use only `formalQuestionPublicId` / `formalPaperPublicId`; never expose internal numeric ids.
- Links must be content-admin formal draft/detail entry links, not publish shortcuts.
- Evidence records command status and field-level state only; no raw AI output, full question, full paper, material, chunk, credentials, session, cookie, token, env value, DB URL, DB row, Provider payload, prompt, or screenshot.
- Regression tests include personal advanced learner, organization advanced employee/admin adjacent surfaces where available.

## Validation Plan

- Red/green focused UI tests:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx --reporter=dot`
- Role-boundary adjacent regression:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-formal-draft-detail-entry-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-formal-draft-detail-entry-2026-07-09 -SkipRemoteAheadCheck`

## Out Of Scope

- Formal publish or review workflow changes.
- Provider-enabled execution.
- Browser screenshot evidence.
- DB connection or DB mutation.
- Schema, migration, seed, dependency, package, lockfile, env, staging, production, deployment, PR, force-push, or Cost Calibration work.
