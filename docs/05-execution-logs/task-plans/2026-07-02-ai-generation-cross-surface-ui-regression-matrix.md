# AI Generation Cross-Surface UI Regression Matrix Plan

## Task Boundary

- Task id: `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`
- Branch: `codex/ai-generation-cross-surface-ui-regression-matrix`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: local source/test UI regression coverage for content admin, organization admin, and student AI出题/AI组卷 surfaces.
- Allowed source/test files:
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`
  - `tests/unit/student-personal-ai-generation-ui.test.ts`
- Blocked: real Provider calls, browser/runtime walkthrough, DB connection or mutation, `.env*`, package/lockfile changes, schema/migration/seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-route-contract-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-route-contract-alignment.md`

## First-Principles Diagnosis

The UI must be the last role-specific adapter, not a second copy of generation rules. AI出题 and AI组卷 repeatedly regressed because success parsing, failure categories, and role surfaces were validated in separate slices. This task locks the ordinary UI behavior as a matrix: role surface plus task kind plus visible state. Reuse is acceptable only when it removes drift without merging admin desktop and student mobile-first layout responsibilities.

## Implementation Steps

1. Run the existing focused UI test set to establish the current baseline.
2. Inventory current UI coverage for content admin, organization admin, and student pages across AI出题 and AI组卷.
3. Add focused regression assertions for success, failure, insufficient-evidence, blocked, history, and detail states where applicable.
4. Keep content admin and organization admin on the shared admin surface while preserving separate workspace copy and access behavior.
5. Keep student AI training on its mobile-first learner surface and assert it does not leak raw or internal fields.
6. Change UI code only if the matrix exposes a real visible-state or redaction gap.
7. Run focused UI tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- Content admin, organization admin, and student surfaces cover both AI出题 and AI组卷.
- Success, failure, insufficient-evidence, blocked, history, and detail states are tested where applicable.
- UI tests assert no raw payload, prompt, Provider response, token/session, Authorization header, localStorage value, or internal id is visible.
- Admin desktop layout and student mobile-first layout remain separate unless sharing removes confirmed drift.
- No real Provider, browser runtime, database, dependency, schema, migration, seed, staging/prod, or deployment action is executed.

## Risk Controls

- Evidence records only task ids, file paths, status categories, coverage matrix rows, counts, and validation command results.
- No prompt text, Provider payload, raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, raw DB row, or internal id is recorded in evidence.
- UI assertions use synthetic redaction probes only.
- Any source change must stay inside the queued allowed files.
