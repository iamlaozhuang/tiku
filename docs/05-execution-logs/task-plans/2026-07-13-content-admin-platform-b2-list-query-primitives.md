# Content Admin Platform B2 List-Query Primitives Plan

Date: 2026-07-13

Task: `content-admin-platform-b2-list-query-primitives-2026-07-13`

Branch: `codex/content-admin-platform-b2-list-query-primitives`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 66e7391889e3055e5423fe7d764e86603e1fc0fd`

## Goal

Create narrow shared primitives for canonical admin list URL query parsing/serialization, keyword debounce, latest-intent
response gating, and active filter chips. Apply them to the current question and material route families without changing
API pagination semantics, content lifecycle, authorization, or editor behavior.

## Required Reading

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/02-question-paper.md` and `docs/01-requirements/stories/epic-02-question-paper.md`.
- `docs/01-requirements/modules/06-admin-ops.md` and `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`.
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- B–F serial plan, standing authorization, B0 PIC map, B1 evidence/audit, current state/history, Lean Module Run v3, and closeout SOP.
- `src/server/contracts/admin-interaction-contract.ts`, `src/hooks/useAdminListInteraction.ts`, shared `AdminList`, and current question/material source and focused tests.
- Analogous paper and resource/knowledge URL-list implementations and their focused tests.
- Repository-external design board `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`: global skeleton plus `content-questions` and `content-materials` matrix rows.

## Baseline Application

- Exact items: Batch 0 P2 item 1 (backend filters/list density/pagination consistency) and Batch 5 P1 item 4
  (question/material list-detail separation), limited here to list-query foundations.
- Affected surfaces: `content_admin` and `super_admin` question/material route families; both retain identical content
  lifecycle and service authorization boundaries.
- Visual direction: filters remain attached to their list, active filters become scannable chips, and result/pagination
  context remains visible. The design board is direction only, not a pixel specification.
- Deferred: paper and other page-family rollout, browser popstate/return scroll/focus restoration, editor routes, Toast,
  Drawer, mutation feedback, form contracts, and cumulative acceptance remain with B3/B4/D/E/F.

## Design

1. Add a pure URL codec that validates `page`, `pageSize`, `sortBy`, and `sortOrder`, and serializes them in canonical API
   order while leaving domain filters caller-owned.
2. Add a monotonic latest-intent gate. Consumers may ignore stale completions without coupling UI primitives to fetch,
   AbortController, session, or API envelope details.
3. Add a small debounced-value hook for keyword requests. Local input stays responsive; request/URL state updates after a
   fixed deterministic delay.
4. Add an accessible `AdminFilterChips` presentation primitive with caller-owned labels and remove behavior; keep the
   existing single reset action.
5. Refactor the question/material client to use all four primitives. Question and material views remain distinct real
   consumers; no universal list framework is introduced.

## Risk Defenses

- Invalid URL pagination/sort values fall back deterministically; no unbounded page size or arbitrary sort field reaches
  the API.
- Filter and page-size changes still reset page to 1. URL names remain camelCase API query names.
- Out-of-order requests cannot replace newer list data, error state, or pagination.
- Debounce affects keyword requests only; select filters and pagination remain immediate.
- Filter chips contain user-visible labels only, never raw diagnostics, tokens, internal numeric ids, content bodies, AI
  payloads, phone values, `redeem_code`, or authorization internals.
- No authorization, edition, AI, schema, database, Provider, dependency, build configuration, browser, screenshot, PR,
  force push, or deployment action.

## Allowed Changes

- `src/lib/admin-list-query.ts`
- `src/lib/admin-list-query.test.ts`
- `src/hooks/useAdminListDebouncedValue.ts`
- `src/components/admin/AdminFilterChips/**`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `tests/unit/admin-question-material-ui.test.ts`
- active state, B2 plan/evidence/audit, and the PIC ledger declared by the queue

## Validation

- TDD RED/GREEN for URL normalization/serialization, latest-intent races, filter-chip accessibility, debounce, URL
  restoration, and question/material consumers.
- Focused unit regression, then serial `npm run lint`, `npm run typecheck`, changed-file Prettier, and `git diff --check`.
- Recovery/serial Program Guards and Module Run pre-commit, closeout, and pre-push readiness.
- Build/full regression are impact-triggered. The planned change adds new isolated UI/query helpers consumed only by the
  question/material client and does not alter shared fetch runtime, core API contracts, authorization, AI, dependencies,
  build config, or test infrastructure; no fixed full node is reached.

## Adversarial Review

- Round 1: URL/query correctness, pagination preservation, debounce determinism, race safety, two-consumer proof, and
  contract/source alignment.
- Round 2: stale overwrite, authorization/content-lifecycle regression, exceptional URL values, chip data leakage,
  cross-page inconsistency, duplicate abstraction, and over-generalization.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; B3 starts automatically.
