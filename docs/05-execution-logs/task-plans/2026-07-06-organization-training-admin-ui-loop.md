# 2026-07-06 Organization Training Admin UI Loop

## Task

- ID: `organization-training-admin-ui-loop-2026-07-06`
- Branch: `codex/organization-training-admin-ui-loop-2026-07-06`
- Goal: connect the organization training admin surface to persisted AI-created training drafts and the existing publish API so organization AI results can proceed through review and publish inside the `organization_training` domain.

## Read Gates

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
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`

## Current Gap

The backend can create organization training drafts from organization AI generated results, attach `organization_ai_result` source context, publish immutable versions with evidence gating, and let employees answer published versions. The admin training page still only renders the in-memory `lastDraft` from the current page session and lacks a publish action. A draft created from the AI generation page is therefore not discoverable in the training page UI, and the existing publish endpoint is not reachable from that review surface.

## Implementation Plan

1. Add a failing UI test proving the organization training page must load persisted draft/version lifecycle items and expose a publish action for draft items.
2. Reuse existing `OrganizationTrainingAdminLifecycleFlowDto`, `OrganizationTrainingPublishedVersionDto`, and publish route contracts instead of introducing a parallel draft model.
3. Extend the admin page to load lifecycle items after session/capability resolution, show loading/empty/error states, merge created drafts into the list, and display business error codes from failed responses.
4. Add a compact publish form that reuses the existing `OrganizationTrainingPublishInput` shape with no platform formal `paper` or `question` writes.
5. Keep the first pass UI source-scoped: no database connection, no schema or migration, no Provider, no dev server, no browser runtime.

## Risk Controls

- Do not change authorization semantics; service-computed organization advanced capability remains the boundary.
- Do not introduce a new organization question bank or platform formal adoption path.
- Do not record raw question, paper, material, Prompt, Provider, credential, session, or database row content in evidence.
- Do not change dependencies, package files, schema, migrations, or seeds.
- Stop if the existing route layer lacks a safe lifecycle-list API; create a narrow route/service addition only if covered by tests and allowed files.

## Validation Plan

- Red-first: `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts`
- Focused green:
  - `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts`
  - `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- Gates:
  - `npm.cmd run typecheck`
  - `npm.cmd run lint`
  - `npm.cmd exec -- prettier --check --ignore-unknown ...`
  - `git diff --check`
  - `npm.cmd run test:unit`
  - Module Run v2 precommit and prepush scripts.
