# Content Admin Platform B3 Detail And Feedback Primitives Plan

Date: 2026-07-13

Task: `content-admin-platform-b3-detail-feedback-primitives-2026-07-13`

Branch: `codex/content-admin-platform-b3-detail-feedback-primitives`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == f0dbbeab51f137c61e7d52ddac99144faecdda37`

## Goal

Close the narrow shared contract for Detail Drawer focus containment/restoration, accessible mutation Toast feedback, and
object-level list updates. Apply feedback and object updates to question/material mutations while preserving author input,
duplicate-submit protection, content lifecycle, authorization, and existing AI recommendation behavior.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- Standard requirement index; question/paper and admin/operations modules and stories.
- Advanced-edition index plus the full-role source implementation entry and its already-read global/content/design-board
  baseline chain.
- Content Admin P0/PIC contract, especially P0-11/P0-12/P0-13 and PIC-05/PIC-07/PIC-08/PIC-10.
- Full-role Batch 0 P2 items 3 and 5; Batch 5 question/material page recommendations.
- B–F serial plan, standing authorization, B0 PIC map, B1/B2 evidence and audits, current state/history, Lean Module Run
  v3, and closeout SOP.
- Existing `AdminDetailDrawer`, question/material detail and mutation consumers, focused tests, paper-composer Drawer
  consumers, and analogous local Toast implementations.
- Repository-external design-board question/material page-matrix rows, used only as visual direction.

## Baseline Application

- Exact items: Batch 0 P2 item 3 (button/destructive/disabled hierarchy) and item 5 (safe errors), Batch 5 page rows for
  content questions and content materials, plus US-06-01 AC-4 through AC-7.
- Affected surfaces: shared backend Detail Drawer focus lifecycle and content-admin/super-admin question/material core
  mutations. Server-side authorization and content lifecycle remain unchanged.
- Deferred: broad Toast rollout, other page-family object updates, browser return/scroll restoration, dedicated editor
  routes, field-error/dirty-state contracts, and cumulative acceptance remain B4/D/C/E/F work.
- AI recommendation requests and feedback remain untouched; this task does not enter AI, Provider, Prompt, edition,
  authorization, organization, phone, or `redeem_code` behavior.

## Design

1. Harden `AdminDetailDrawer` so the focus lifecycle is mount-scoped even when callers recreate `onClose`; trap forward
   and reverse Tab, close on Escape, and restore the original trigger after unmount.
2. Add a small `AdminToast` primitive with success/error/conflict tones, correct live-region priority, caller-owned safe
   copy, and an explicit accessible dismiss action. No timer or global provider is introduced.
3. Add a pure `upsertAdminObjectByPublicId` helper so successful save/copy/status mutations update only the returned
   object while preserving unrelated rows.
4. Apply the Toast and object helper only to question/material save, copy, and disable paths. Existing knowledge-node AI
   recommendation feedback stays on its current path to avoid an AI-domain scope expansion.

## Risk Defenses

- Drawer focus is initialized once per mount; callback identity changes cannot steal or restore focus mid-session.
- Focus never escapes through forward/reverse Tab, and trigger restoration occurs only at actual unmount.
- Conflict uses an assertive, visibly distinct Toast; success is polite. Raw API messages and diagnostics are never shown.
- Duplicate saves remain blocked by the existing in-flight guard; failures/conflicts preserve form values.
- List rows use only server-returned DTOs and public ids already held in memory; no optimistic lifecycle transition or
  authorization inference is added.
- No API, service, database, schema, dependency, build configuration, browser, screenshot, PR, force push, Provider, or
  deployment action.

## Allowed Changes

- `src/components/admin/AdminDetailDrawer/**`
- `src/components/admin/AdminToast/**`
- `src/lib/admin-object-state.ts` and its test
- question/material client and focused unit test
- active state, B3 plan/evidence/audit, and PIC ledger declared by the queue

## Validation

- TDD RED/GREEN for Drawer focus loop/Escape/trigger restoration, Toast live-region/dismiss semantics, immutable object
  replacement/insertion, success object-level updates, duplicate submit, preserved-input failure, and conflict feedback.
- Focused regression includes the shared Drawer, content detail, paper composer, and question/material consumers; then
  serial lint, typecheck, changed-file Prettier, diff check, recovery/Program Guards, and Module Run closeout gates.
- Build/full regression are impact-triggered. This is a shared presentation/focus change, not shared request runtime,
  core API contract, authorization, AI, dependency, build, or test-infrastructure change; B3 is not a fixed full node.

## Adversarial Review

- Round 1: focus lifecycle, accessible semantics, safe feedback, immutable object identity, duplicate submission, input
  preservation, conflict distinction, and contract/source alignment.
- Round 2: callback churn, stale focus, hidden keyboard escape, raw diagnostic leakage, lifecycle/privilege expansion,
  cross-consumer regression, duplicate abstraction, global-provider over-design, and false PIC closure.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; B4 starts automatically.
