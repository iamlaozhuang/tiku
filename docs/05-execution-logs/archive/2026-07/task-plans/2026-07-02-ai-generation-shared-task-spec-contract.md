# AI Generation Shared Task Spec Contract Plan

## Task Boundary

- Task id: `ai-generation-shared-task-spec-contract-2026-07-02`
- Branch: `codex/ai-generation-shared-task-spec-contract`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: local source/test contract repair for AI出题 and AI组卷 task semantics.
- Allowed source files:
  - `src/server/contracts/ai-generation-task-spec-contract.ts`
  - `src/server/contracts/route-integrated-provider-execution-contract.ts`
  - `src/server/services/admin-ai-generation-local-contract-route.ts`
  - `src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
  - `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
  - `src/server/services/route-integrated-provider-execution-service.ts`
  - `src/server/services/route-integrated-provider-execution-service.test.ts`
- Blocked: Provider calls, browser/runtime walkthrough, DB connection or mutation, `.env*`, package/lockfile changes, schema/migration/seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/01-requirements/traceability/2026-06-28-ai-generation-detail-controls-source-repair.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md`

## First-Principles Diagnosis

AI出题 and AI组卷 must be accepted or rejected by the same deterministic task contract before any real Provider retry. The current shared service can parse structured previews, but the task-to-preview option function still hard-codes AI出题 to 10 and does not carry AI组卷 requested total count. That makes the contract depend on caller convention instead of the request semantics.

The fix is to define a small server contract that owns task labels, expected preview kind, count semantics, allowed high-level output fields, and redaction category. The shared execution service should derive preview options from this contract and from `generationParameters.questionCount`, with no hidden fallback from 5 or 20 to 10.

## Implementation Steps

1. Add RED tests for `questionCount=5` and `questionCount=20` proving task preview options preserve requested counts and do not fall back to 10.
2. Add RED tests proving AI组卷 preview options carry requested total count for later parser validation.
3. Create `src/server/contracts/ai-generation-task-spec-contract.ts` with exported task spec and helper functions.
4. Update `createRouteIntegratedStructuredPreviewOptionsForTask` to accept optional generation parameters and use the shared contract.
5. Update admin and personal route-integrated Provider bridge callers, plus the admin local contract route kind check, to pass their existing `generationParameters`.
6. Preserve existing `createRouteIntegratedStructuredPreviewOptionsForGenerationKind` callers with compatible defaults while preventing silent caller-provided count loss.
7. Run focused service tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- `ai_question_generation` and `ai_paper_generation` are defined once with labels, expected structured preview kind, count semantics, allowed high-level output fields, and redaction category.
- AI出题 requested count is derived from `generationParameters.questionCount`.
- AI组卷 requested count is derived from `generationParameters.questionCount` and carried into preview validation options.
- Existing structured preview tests still pass.
- New unit tests prove requested counts 5 and 20 cannot silently fall back to 10.

## Risk Controls

- No Provider call or prompt/payload inspection.
- No DB connection, DB mutation, schema, migration, seed, package, lockfile, browser, or e2e work.
- Evidence records only task ids, file paths, status categories, counts, and command results.
- No raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, or raw DB row is recorded.
