# 0704 Admin List Pattern V2

## Task Metadata

- taskId: `0704-admin-list-pattern-v2-2026-07-11`
- branch: `codex/0704-admin-list-pattern-v2`
- base: latest `origin/master`
- goal: provide small reusable admin-list structure and reset behavior before migrating individual operations pages.

## Required Reading

- `AGENTS.md`
- current `project-state.yaml` and `task-queue.yaml`
- code taste commandments and every ADR
- requirements indexes, admin operations requirements, full-role UI/UX traceability
- latest operations UI foundation and user-filter evidence/audits
- approved user-management screenshot and shared-list design recommendation
- existing list hook, interaction contract, layout primitives, representative user/card/audit list code, and tests

## Scope

1. TDD a business-agnostic `AdminListToolbar` with title, description, result label, primary action, and caller-owned filters.
2. TDD an accessible `AdminTableFrame` with explicit label, stable minimum width, and horizontal overflow.
3. TDD an `AdminPagination` that always renders range, total, current/total page, previous/next controls, and correct disabled states including empty data.
4. Add `handleReset()` to `useAdminListInteraction`; reset restores page one, default page size, initial sort field/order, and clears filter revision metadata.
5. Keep existing pages unchanged in this foundation task; page migrations occur in tasks 3-8.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit
- `src/components/admin/AdminList/**`
- `src/components/admin/admin-layout-primitives.ts`
- `src/hooks/useAdminListInteraction.ts`
- `src/components/admin/AdminList/AdminList.test.tsx`
- `tests/unit/admin-layout-primitives-ui.test.ts`
- `tests/unit/admin-shell-common-interaction.test.ts`

## Explicit Exclusions

- no business enum, API request, route, service, repository, permission, or data-scope logic in shared components
- no migration of user, organization, authorization, employee, card, or audit pages yet
- no database, schema, migration, seed, dependency, package, lockfile, Provider, Cost Calibration, env/secret, staging, production, deploy, screenshot, raw DOM, PR, or force-push work

## TDD And Verification

1. RED tests for missing components and reset behavior.
2. GREEN with the smallest typed components and immutable reset state.
3. Run shared-interaction and representative user/card/audit regression tests.
4. Adversarially review business isolation, accessibility, empty state, disabled state, page bounds, sensitive data, and version/role boundaries.
5. Run lint, typecheck, formatting, diff check, Module Run v2, then commit, fast-forward merge, master rerun, push, and cleanup.

## Acceptance

- shared components contain no business imports, API calls, session handling, or permission branches
- toolbar preserves caller-defined filter order and exposes accessible title/action/result content
- table frame is labelled and scrollable without layout overlap
- pagination renders for zero results and correctly disables boundary controls
- reset returns the list query to its original sort and default pagination state
- existing user, card, and audit list tests remain green
