# 2026-07-05 Organization AI Training Auth Lineage

## Task

Fix the organization AI generation to organization training draft handoff so it uses a real advanced `org_auth` public id instead of a synthetic placeholder, and show API business error code/message on the frontend when the handoff fails.

## Required Reading

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
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`

## Current Root Cause

The organization AI route creates organization task metadata with `authorizationPublicId = org_auth_local_contract_${organizationPublicId}`. The enterprise training route then checks trusted persistence lineage against a real `org_auth.public_id`; the synthetic id cannot resolve lineage, so the route returns a business failure such as `403079` while HTTP status remains 200.

## Scope

Allowed source/test files:

- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

Allowed docs:

- This task plan
- `docs/05-execution-logs/evidence/2026-07-05-organization-ai-training-auth-lineage.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-organization-ai-training-auth-lineage.md`

Blocked:

- `.env*`
- `package.json`
- lockfiles
- DB schema, migrations, seed, destructive DB actions
- Provider execution or provider configuration
- staging/prod/cloud/deploy
- raw credentials, raw DB rows, raw prompt, raw AI I/O, full generated question/paper/material content in evidence

## Implementation Plan

1. Add failing tests proving organization admin AI generation uses a real service-computed `org_auth` public id and does not emit the synthetic local-contract id.
2. Add failing UI tests proving an existing organization AI history item with a synthetic task id is copied to training draft using the current session's real `org_auth` public id, and API error code/message is displayed when draft creation fails.
3. Hydrate `organizationAuthorizationPublicId` into the service-computed organization admin workspace capability from the active `org_auth` row.
4. Use that real public id in organization AI task request policy and the training-draft copy request.
5. Extract reusable admin API business-error formatting for AI generation surfaces.
6. Keep learner personal and employee AI generation unchanged except for verification: those flows already use selected effective authorization contexts from `/api/v1/authorizations`.

## Validation

- Red-first focused tests.
- Focused green tests:
  - `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts src/server/auth/local-session-runtime.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `npm.cmd run test:unit` full-suite audit, with remaining unrelated failures recorded in evidence

## Risk Controls

- No new dependency.
- No schema or migration.
- No Provider call.
- No DB read/write by the agent for evidence.
- Public ids only; no internal numeric ids exposed.
- Frontend error copy shows business `code` and `message` but not stack traces or raw payloads.
