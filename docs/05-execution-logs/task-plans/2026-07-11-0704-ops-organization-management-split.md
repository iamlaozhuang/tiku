# 0704 Ops Organization Management Split

## Task

Split the operations enterprise management page into clear task views for organization structure, enterprise authorization, and employee operations while preserving existing service contracts and business behavior.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- latest 0704 UI/UX, org authorization, employee import, and org tree evidence
- local private screenshots for `/ops/organizations` reviewed in memory only; not copied into repository evidence

## Scope

Include:

- Rename the page-level concept from enterprise authorization operations to enterprise management.
- Split `/ops/organizations` into three deep-linkable task views: organization structure, enterprise authorization, employee operations.
- Present organization hierarchy as the user-confirmed four levels: province, city, district, station, using user-facing labels `省`、`地市`、`县区`、`站点`.
- Keep organization tree operations easier to understand for non-technical operations users.
- Preserve existing org auth creation/cancel, organization create/update/enable/disable, employee import/transfer/unbind API calls and request bodies.
- Update targeted tests for the new information architecture and behavior freeze.
- Write redacted evidence and adversarial audit.

Exclude:

- Business logic changes for enterprise authorization, employee import, quota, edition, or organization mutation.
- Database schema, migration, seed, direct DB, Provider, staging/prod/deploy/env/secret work.
- Package or lockfile changes.
- Full screenshot or raw DOM evidence in repository.

## Implementation Approach

1. Add tests that require `/ops/organizations` to expose three task views and keep the four-level org tree labels.
2. Refactor `AdminOrgAuthPage` render organization only: add a small local view selector and group existing panels into organization structure, enterprise authorization, and employee operations.
3. Keep existing child components, form state, mutation handlers, request payload builders, test IDs, and confirmation dialogs.
4. Use URL query state for task view deep links without introducing a new dependency.
5. Update copy to remove internal implementation terms and clarify that organization moves are controlled and not drag/drop.

## Validation

- Targeted vitest for org auth, organization tree, employee import, overview/navigation touchpoints.
- `pnpm lint`
- `pnpm typecheck`
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness

## Risk Controls

- Do not change service functions, DTO fields, endpoint paths, request body builders, or authorization checks.
- Do not expose public IDs in new visible UI copy; keep test attributes as existing test surface only.
- Do not use drag/drop organization movement.
- Keep high-risk writes behind existing confirmation dialogs.
- Evidence records only role label, route label, status/problem category, fix summary, and test counts.
