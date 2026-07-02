# AI Generation Provider Instruction Unification Plan

## Task Boundary

- Task id: `ai-generation-provider-instruction-unification-2026-07-02`
- Branch: `codex/ai-generation-provider-instruction-unification`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: local source/test instruction builder reuse for AI出题 and AI组卷 Provider requests.
- Allowed source files:
  - `src/server/services/route-integrated-provider-instruction-service.ts`
  - `src/server/services/route-integrated-provider-instruction-service.test.ts`
  - `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
  - `src/server/services/admin-ai-generation-runtime-bridge-service.test.ts`
  - `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
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
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-structured-preview-parser-hardening.md`

## First-Principles Diagnosis

Provider output quality is constrained by the instruction contract before the parser ever runs. If admin and personal paths describe different JSON roots or different requested counts, later parser hardening cannot guarantee the same behavior across roles. The shared task spec already defines labels and output fields; the instruction builder should consume that shared contract and accept route-specific scene wording only as data.

## Implementation Steps

1. Add RED tests for shared AI出题 instruction with requested count 5 and 10.
2. Add RED tests for shared AI组卷 instruction requiring `paperSections`, `questionTypeDistribution`, `knowledgeCoverage`, and total question count.
3. Add RED tests that scene wording can differ while output contract wording remains shared.
4. Create `route-integrated-provider-instruction-service.ts`.
5. Replace admin and personal private instruction construction with the shared builder.
6. Run targeted service tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- Admin and personal routes call the same instruction builder.
- Output field requirements are shared and cannot drift by role.
- Tests assert requested count, expected root fields, grounding-only rule, and forbidden evidence words are absent from static instruction metadata.
- No real Provider call is made.

## Risk Controls

- No Provider call or provider credential access.
- No DB connection, DB mutation, schema, migration, seed, package, lockfile, browser, or e2e work.
- Evidence records only task ids, file paths, status categories, counts, and command results.
- No prompt text, Provider payload, raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, or raw DB row is recorded in evidence.
