# User-led B9 Operations Mobile Containment Repair Plan

## Baseline and evidence

- Task id: `user-led-b9-ops-mobile-containment-repair-2026-07-12`
- Branch: `codex/b9-ops-mobile-containment`
- Start SHA: `03e3d7cf394d1ce5b621639c48011f5a6f20f572`
- Fresh B9 browser evidence: under the operations administrator role at `/ops/organizations?view=employees`, a 390px viewport produced a page-level width of about 1042px. The table did not own horizontal scrolling.
- User approval: execute the complete remediation plan, close each batch through commit, ff-only merge, ordinary push and cleanup.

## Required reads completed

- `AGENTS.md`, project state/queue, code taste commandments and ADR-001 through ADR-007.
- Standard/advanced requirement indexes, edition-aware authorization and current UI/UX traceability records.
- B8 plan/evidence/audit, B9 cumulative plan and current repository/browser evidence.
- Product Design and in-app Browser control contracts.

## First-principles diagnosis

- A wide table should create overflow only inside `AdminTableFrame`.
- The frame already has `max-w-full min-w-0 overflow-x-auto` and the table has an intentional minimum width.
- The shared `AdminDashboardLayout` main flex child keeps the default `min-width: auto`, so its min-content width is inherited from the table and the whole document expands before the inner frame can scroll.
- The minimum repair is to allow the shared main flex child and its content region to shrink with `min-w-0`. Table minimum widths, spacing, desktop sidebar behavior and data semantics remain unchanged.

## TDD and implementation

1. Add a focused layout test that requires the shared main-area wrapper and content element to expose the shrink boundary.
2. Run the focused test red and record the expected failure.
3. Add only tokenized utility classes to the two shared layout nodes.
4. Run focused and full gates, then use the approved in-app browser to verify the same operations page at desktop and 390px.

## Allowed files

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`
- this plan, matching evidence/audit, project state and task queue.

## Risk defenses

- Do not change `AdminTableFrame`, table minimum widths or B8 local cell spacing.
- Confirm desktop sidebar/content widths remain stable.
- Confirm 390px document containment and inner table horizontal scrolling for both organization authorization and employee views.
- Recheck role fail-closed behavior, Provider-closed state, A14 and A15 by scope/diff and existing focused/full tests.
- No database, migration, fixture, Provider, dependency, `.env*`, staging, production, deploy or Cost Calibration action.

## Closeout

- Perform two adversarial reviews, Module Run v2 pre-commit/module-closeout/pre-push gates, one reviewable task commit, ff-only merge, master recheck, ordinary push, 0/0 comparison and worktree/branch cleanup.
- Resume B9 only after this repair is closed and its baseline is incorporated.
