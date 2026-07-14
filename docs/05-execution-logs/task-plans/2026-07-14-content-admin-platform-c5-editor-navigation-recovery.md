# Content Admin Platform C5 Editor Navigation Recovery Plan

Date: 2026-07-14

Task: `content-admin-platform-c5-editor-navigation-recovery-2026-07-13`

Branch: `codex/content-admin-platform-c5-editor-navigation-recovery`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 1e3200c4e733ec8d3a19637b4c121a1bdbb5d4d9`

## Goal

Complete the C0 navigation contract for both question and material editors: validated same-family `returnTo`, bounded
one-shot non-sensitive list snapshots, deterministic return, dirty-leave confirmation, clean refresh behavior, and list
scroll/focus recovery without a universal form/router framework.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-c0-editor-route-wireflow.md`
- C1-C4 plans/evidence/audits, D3 list-return evidence, current editor/list routes, form dirty-state contract, and focused
  tests.

## Design And TDD

1. RED-first add pure codec/snapshot tests and cross-resource navigation tests for valid/invalid `returnTo`, bounded
   session records, direct URL fallback, one-shot restore, dirty cancel/confirm, `beforeunload`, Back/Forward, refresh,
   stale/missing focus target and toolbar fallback.
2. Add only `src/lib/admin-editor-navigation.ts` and `src/hooks/useAdminEditorNavigationGuard.ts`; apply them to both
   resource editor pages and route-enabled list entries/return consumers.
3. Store no token, content, role, authorization or private value. Accept only canonical same-family list keys and finite
   non-negative scroll; reject absolute/protocol-relative/cross-family/editor/fragment/unknown/malformed targets.
   Treat a return snapshot as stale after 24 hours so a normal long-form workday still restores while abandoned tab state
   remains bounded.
4. Preserve all C1-C4 semantic, lock/copy, API, authorization and Drawer behavior; C6 owns cumulative proof.
5. Run focused navigation/editor/list tests, lint, typecheck, changed format, build, diff and governance gates, then two
   adversarial rounds plus independent audit.

No dependency, API/service, database, authorization, AI, credential or deployment change is allowed. Close with one
commit, ff-only merge, push/equality verification and cleanup, then start C6 automatically.
