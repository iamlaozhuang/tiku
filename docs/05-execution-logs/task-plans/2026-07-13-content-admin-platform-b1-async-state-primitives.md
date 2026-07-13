# Content Admin Platform B1 Async-State Primitives Plan

Date: 2026-07-13

Task: `content-admin-platform-b1-async-state-primitives-2026-07-13`

Branch: `codex/content-admin-platform-b1-async-state-primitives`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 765efda984ab22984b873294f9ec245c342729f7`

## Goal

Create one narrow, accessible admin async-state presentation primitive for initial loading, background refreshing, empty,
filtered empty, error, forbidden, unauthorized, edition unavailable, missing context, and conflict. Reuse it through the
current backend state wrappers so at least the question/material and paper workspaces consume the same semantics without
changing authorization decisions or list-request behavior reserved for B2/D.

## Required Reading

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- Question/paper and admin/ops requirement modules and epics.
- Full-role UI/UX source implementation entry and the approved PIC contract.
- B–F serial plan, standing authorization, B0 PIC map, Lean Module Run v3, active state, queue, and history index.
- `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`.
- `src/features/admin/content-admin-runtime.tsx`.
- Current question/material, paper, dashboard layout, workspace-guard consumers and their focused state tests.
- Analogous list status, focus, and role announcement implementations identified by B0.

## Design

1. Add an `AdminAsyncState` component with a closed variant union and a single semantic table for live-region role,
   politeness, and busy state; callers continue to own icons and copy.
2. Keep layout ownership with callers: the primitive renders the state message, while full-page and workspace wrappers
   choose their own container. This avoids a universal page framework.
3. Refactor `AdminStateTemplate` and the existing content-admin state wrappers to delegate state semantics to the new
   primitive while preserving existing public copy, `data-admin-ux-state`, and authorization behavior.
4. TDD the semantic matrix first, then verify two real workspace consumers through question/material and paper focused
   tests. B1 does not add debounce, cancellation, URL behavior, mutation Toast, form or dirty-state contracts.

## Risk Defenses

- `status` + polite announcement only for initial-loading, refreshing, empty and filtered-empty; error, forbidden,
  unauthorized, edition-unavailable, missing-context and conflict use assertive alerts.
- Only initial-loading and refreshing expose `aria-busy=true`.
- No raw diagnostics, tokens, Prompt, Provider data, phone, `redeem_code`, internal IDs, or authorization internals enter
  state copy.
- UI state does not grant access. Existing session/workspace service decisions and redirect/return behavior remain intact.
- No new dependency, schema/migration/seed, database, Provider, browser, screenshot, PR, force push or deployment action.

## Allowed Changes

- `src/components/admin/AdminAsyncState/**`
- `src/components/admin/AdminStateTemplate/**`
- `src/features/admin/content-admin-runtime.tsx`
- `tests/unit/admin-common-ux-state-audit.test.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-paper-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- this plan, its evidence and independent audit
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Validation

- Focused RED/GREEN: new async-state component tests plus common state, question/material and paper tests.
- `npm run lint`, `npm run typecheck`, changed-file Prettier, `git diff --check`.
- Recovery and serial Program Guards; Module Run pre-commit, closeout and pre-push readiness.
- Build/full regression only if impact analysis finds shared runtime/build/config/test-infrastructure or cross-domain risk.
  This branch changes a shared UI presentation path but not shared request runtime, core API contract, authorization, AI,
  dependency, build config or test infrastructure, so the planned policy is focused regression without build/full suite.

## Adversarial Review

- Round 1: state semantics, accessible announcements, copy/data integrity, consumer compatibility and contract accuracy.
- Round 2: authorization expansion, regressions, hidden exceptional states, duplicate abstractions, over-generalization and
  scope leakage.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; B2 starts automatically.
