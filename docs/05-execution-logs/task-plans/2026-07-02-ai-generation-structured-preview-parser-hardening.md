# AI Generation Structured Preview Parser Hardening Plan

## Task Boundary

- Task id: `ai-generation-structured-preview-parser-hardening-2026-07-02`
- Branch: `codex/ai-generation-structured-preview-parser-hardening`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: local source/test parser repair for AI出题 and AI组卷 structured previews.
- Allowed source files:
  - `src/server/contracts/route-integrated-provider-execution-contract.ts`
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
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-shared-task-spec-contract.md`

## First-Principles Diagnosis

The Provider-facing acceptance gate should judge only deterministic structure, counts, and grounding status. It must not depend on raw text inspection, role-specific callers, or Provider retry luck. AI出题 already rejects invalid JSON, missing supported arrays, and mismatched counts. AI组卷 still needs deterministic total-question recognition before a real Provider rerun can be meaningful.

The repair target is therefore narrow: expand paper total-count extraction to supported JSON shapes, and require a requested-count match when the task provided one. Failures must stay redacted and categorical.

## Implementation Steps

1. Add RED parser tests covering supported AI出题 array variants and safe failures.
2. Add RED parser tests for AI组卷 top-level `questionCount` and `totalQuestionCount`.
3. Add RED parser tests for section `questionCount`, nested `questions`, nested `questionDrafts`, and `questionTypeDistribution` total fallback.
4. Add RED parser tests for AI组卷 count mismatch and missing count when a requested count is provided.
5. Extend the structured preview contract type only as needed for paper count safe failures.
6. Implement minimal parser helpers in `route-integrated-provider-execution-service.ts`.
7. Run parser unit tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- AI出题 accepts `questions`, `questionDrafts`, and `question_drafts` only when the count equals requested `questionCount`.
- AI出题 failure reports one of `invalid_json`, `missing_questions`, or `question_count_mismatch`.
- AI组卷 recognizes total question count from top-level `questionCount`, top-level `totalQuestionCount`, section `questionCount`, nested `questions`, nested `questionDrafts`, and `questionTypeDistribution` totals.
- AI组卷 rejects requested-count mismatch with a redacted safe failure category.
- Tests cover at least 8 structured JSON variants across AI出题 and AI组卷.

## Risk Controls

- No Provider call or prompt/payload inspection.
- No DB connection, DB mutation, schema, migration, seed, package, lockfile, browser, or e2e work.
- Evidence records only task ids, file paths, status categories, counts, and command results.
- No raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, or raw DB row is recorded.
