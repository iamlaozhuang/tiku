# AI Generation Route Contract Alignment Plan

## Task Boundary

- Task id: `ai-generation-route-contract-alignment-2026-07-02`
- Branch: `codex/ai-generation-route-contract-alignment`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: local source/test route contract alignment for content admin, organization admin, and student AI出题/AI组卷 flows.
- Allowed source files:
  - `src/server/services/admin-ai-generation-local-contract-route.ts`
  - `src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - `src/server/services/personal-ai-generation-request-route.ts`
  - `src/server/services/personal-ai-generation-request-route.test.ts`
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
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-provider-instruction-unification.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-provider-instruction-unification.md`

## First-Principles Diagnosis

The route layer is the contract boundary users and future clients depend on. If admin and personal routes map the same Provider outcomes into different result shapes, status categories, or transport envelopes, UI fixes and Provider prompt fixes cannot stay fixed. Route handlers and request-route services must normalize success, malformed JSON, and insufficient-evidence outcomes before any role-specific presentation logic.

## Implementation Steps

1. Add RED tests for mocked Provider success producing acceptable `question_set` and `paper_draft` outcomes.
2. Add RED tests for malformed JSON returning a safe failure and no persisted draft shape.
3. Add RED tests for insufficient RAG returning insufficient-evidence before Provider execution.
4. Add/adjust route contract mapping in admin local contract and personal request route services only.
5. Keep Provider execution mocked; do not call real Provider or browser runtime.
6. Run targeted route tests, lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- Mocked Provider success creates acceptable `question_set` and `paper_draft` results.
- Mocked malformed JSON returns safe failure and does not persist a draft.
- Mocked insufficient RAG returns safe insufficient-evidence without Provider execution.
- Admin and personal routes return standard `{ code, message, data }`.
- No real Provider call is made.

## Risk Controls

- No Provider call or provider credential access.
- No DB connection, DB mutation, schema, migration, seed, package, lockfile, browser, or e2e work.
- Evidence records only task ids, file paths, status categories, counts, and command results.
- No prompt text, Provider payload, raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, or raw DB row is recorded in evidence.
