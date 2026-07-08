# 2026-07-08 Organization Training List Pagination

## Scope

Stage 3 of the approved organization training UX repair plan.

Fix only the organization advanced admin enterprise-training list pagination surface:

- add client-side pagination near the list and filters;
- keep pagination state scoped to the current filtered list;
- reset pagination when status filter changes;
- keep existing list actions, create wizard, and API calls unchanged.

Out of scope:

- no API pagination contract, service, repository, DB, schema, migration, seed, fixture, or Provider changes;
- no package or lockfile changes;
- no formal content writes;
- no organization AI page rewrite;
- no employee answer flow rewrite;
- no staging/prod/deploy/env/secret/Cost Calibration work.

## SSOT Read List

- `AGENTS.md`
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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`

## Source Mapping

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

## Implementation Plan

1. Add failing unit test for 12 lifecycle rows with page size 10.
2. Implement client-side pagination inside `TrainingListPanel`.
3. Keep pagination controls near filters and list body.
4. Reset page to 1 when filter changes; derive a clamped display page when filtered item count changes.
5. Run targeted tests, adjacent route tests, lint, typecheck, touched-file prettier check, full unit, and `git diff --check`.

## Risk Controls

- Pagination is local UI state only; no API or persistence contract is introduced.
- List actions still receive the original lifecycle item DTO.
- Empty/error/loading states remain unchanged.
- Evidence remains metadata-only and redacted.
