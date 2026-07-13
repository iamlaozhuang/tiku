# Content Admin Platform D0 List Request Contract Tests Plan

Date: 2026-07-13

Task: `content-admin-platform-d0-list-request-contract-tests-2026-07-13`

Branch: `codex/content-admin-platform-d0-list-request-contract-tests`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 816affe98109fea32c3787fef31d92483ecf74bb`

## Goal

Materialize executable question/material list-request contracts before D1-D3 behavior changes. Preserve the already-green
canonical URL and latest-intent guarantees, and record active RED contracts for context-preserving refreshing, browser
URL restoration, and list focus/scroll return. D0 changes tests and governance evidence only.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md` plus question/paper and admin/operations requirements and stories.
- Advanced-edition index, full-role source implementation entry, and current content/PIC baseline chain.
- Content Admin P0/PIC contract, especially PIC-02/PIC-03/PIC-04/PIC-08/PIC-10/PIC-11.
- B–F serial plan, standing authorization, B0 map, B2 evidence/audit, B5 cumulative evidence/audit, PIC ledger, Lean
  Module Run v3, and closeout SOP.
- Current `admin-list-query`, list-interaction hook, question/material list client, URL/history effects, Drawer/editor
  return paths, and focused tests; analogous AbortController/request-serial implementations.

## Contract Strategy

1. Keep existing GREEN anchors executable: canonical initial URL restore, invalid-value rejection, keyword debounce, and
   out-of-order latest-intent response rejection.
2. Add executable Vitest `it.fails` RED contracts for question refreshing, material refreshing, popstate URL restore,
   and edit-return focus/scroll restore. These tests are run, not skipped or marked todo.
3. Each RED contract must fail for one current missing behavior and carry its canonical owner D1, D2, or D3 in the test
   name. When that owner implements the behavior, Vitest will reject an unexpectedly passing `it.fails`; the owner must
   remove `.fails` and retain the test as a normal passing regression.
4. Do not modify runtime source, invent an alternate request state machine, or pre-implement D1-D3 behavior.

## Required Behaviors

- Question and material filter/page requests retain current rows and announce `refreshing` until the latest response.
- Canonical URL remains source-restorable on browser popstate, not only first mount.
- Returning from edit restores the initiating list control and captured scroll position with a deterministic fallback.
- Latest intent remains authoritative across success and failure; current B2 race coverage stays green.

## Risk Defenses

- Expected-failure tests are explicit and executable; no `skip`, `todo`, deleted assertion, or weakened gate is used.
- RED assertions use public roles/labels, URL state, request observations, focus, and scroll calls rather than private
  implementation details.
- D0 does not change API pagination, content lifecycle, locks, copy semantics, authorization, AI, database, Provider,
  dependency, build configuration, or deployment.
- Browser runtime is not used; jsdom covers the component contract and F owns real-browser acceptance.

## Allowed Changes

- `tests/unit/admin-question-material-ui.test.ts` and, only if needed, the focused list-query test.
- Active state/history, D0 plan/evidence/audit, and PIC ledger declared by the queue.

## Validation

- First run the new assertions as normal `it` tests and record the expected RED failures.
- Convert only those known future-owned assertions to executable `it.fails`; rerun list-query and question/material
  focused suites, then serial lint, typecheck, changed-file Prettier, diff check, recovery/Program Guards, and Module Run
  closeout gates.
- Build/full regression are not triggered: D0 changes tests and documentation only, B5 just passed the fixed full node.

## Adversarial Review

- Round 1: each contract fails for its intended missing behavior, existing GREEN coverage remains active, owner mapping
  is exact, and public assertions match PIC/source requirements.
- Round 2: skipped-test disguise, false RED, flaky timing, implementation coupling, pagination drift, privilege/lifecycle
  expansion, premature D1-D3 implementation, and test-framework over-design.

Closeout is one test/evidence commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check
and short branch/worktree cleanup; D1 starts automatically.
