# 2026-07-08 Organization Training Filter Empty State

## Task

- Task id: `organization-training-filter-empty-state-2026-07-08`
- Branch: `codex/org-training-filter-empty-state`
- Goal: keep organization training list filters and the filtered-empty state visible when server-side filters return zero rows.
- User report: filtering the organization training list to an empty result makes both the list controls and filters disappear.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`

## Requirement Mapping Result

- `CT-REQ-016`: organization training list and wizard must remain usable and clearly separated.
- `CT-REQ-055`: this remains scoped to eligible `org_advanced_admin` enterprise training UI.
- Batch 2 org-admin workspace baseline: pagination and filter state should remain near the list they affect.
- Code taste commandment 2: empty states must be explicit and recoverable.

## Root Cause

The list component hides filters when `visibleItems.length === 0`. With server-side filters, the current API response can be empty even though the underlying list has rows under other filters. The UI then treats a filtered-empty result like a global empty list, hiding the controls needed to clear the filter.

## Scope

Allowed:

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- task plan, evidence, audit, state, queue

Out of scope:

- No API/DTO/service/repository changes.
- No DB/schema/migration/seed/fixture changes.
- No Provider/AI changes.
- No package or lockfile changes.
- No credentials, session, cookie, token, env, DB URL, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI outputs, or full question/paper/material/resource content in evidence.

## TDD Plan

1. Add a failing unit assertion that server-side filtered empty results keep filter groups visible and show `当前筛选下暂无企业训练`.
2. Confirm the test fails before implementation.
3. Apply the smallest state-derivation change in `TrainingListPanel`.
4. Re-run the focused unit test.

## Validation Plan

- `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-organization-training-filter-empty-state.md docs/05-execution-logs/evidence/2026-07-08-organization-training-filter-empty-state-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-organization-training-filter-empty-state-audit.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts`
- `git diff --check`
- Optional localhost Browser visibility check if available without reading storage or sensitive data.
- Module Run v2 pre-commit hardening.

## Adversarial Review

- Verify filters remain visible when the current filtered response is empty.
- Verify the global no-training empty state still works when no filter is active.
- Verify no list action, publish, takedown, copy, API path, or role boundary is changed.
- Verify evidence stays redacted.
