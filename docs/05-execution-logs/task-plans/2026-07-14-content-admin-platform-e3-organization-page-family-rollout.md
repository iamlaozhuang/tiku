# Content Admin Platform E3 Organization Page-Family Rollout Plan

Date: 2026-07-14

Task: `content-admin-platform-e3-organization-page-family-rollout-2026-07-13`

Branch: `codex/content-admin-platform-e3-organization-page-family-rollout`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == c10ac22975bbb9ba94835b3a6a4bbccdd96556cf`

## Goal

Roll the approved list, detail and mutation-feedback interaction contracts into the organization-admin route family. The
implementation is deliberately narrow: make enterprise-training list state restorable, move its read-only version detail
out of the list hierarchy, and make enterprise-training plus organization-AI handoff mutations use the shared accessible
feedback contract. Preserve service-derived organization scope, standard/advanced denial, the four-step training flow,
analytics privacy, AI evidence gates and the organization-private non-formal data domain.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `AGENTS.md`, active project state and task queue, code-taste commandments, and every ADR including ADR-007.
- Standard and advanced requirement indexes; edition-aware authorization; organization training, analytics, AI and role-
  separation modules/stories; the current AI SSOT, phase-4 alignment, acceptance normalization, goal-completion audit,
  closed-loop alignment and recontract materialization.
- Full-role source entry, summary, Batch 0, Batch 2 organization-admin baseline, Batch 3 employee regression boundary,
  design-board materialization/review, UI gap analysis, requirements/code audit and the redacted local design board.
- Organization-admin standard/advanced source contract; current CT-REQ reconciliation and decision package; B-F serial
  plan, standing authorization, PIC ledger, E0 inventory, E1/E2 closeouts, Module Run v3 and closeout/archive SOPs.
- Complete portal, training, analytics and organization-mode AI implementations, their route wrappers and focused tests;
  shared `AdminList`, `AdminDetailDrawer`, `AdminToast` and analogous E1/E2 consumers.

No source-hierarchy or time-sequence conflict remains. No current-baseline failure permits reopening A01-A30 or the
superseded AI issue classes.

## Baseline Application

- Exact Batch 2 P1 items: readable organization context, shared standard-unavailable state, separated training list and
  four-step creation flow, explicit read/write authority, and one review-to-training-draft AI handoff.
- Exact Batch 2 P2 items: lifecycle/next-action list rows, read-only published summaries, approved training sources,
  aggregate-only analytics, five-zone organization AI, mutation feedback and list-local pagination/filter state.
- Affected roles/routes: `org_standard_admin`, `org_advanced_admin` and explicit `super_admin` access on
  `/organization/portal`, `/organization/organization-training`, `/organization/organization-analytics`,
  `/organization/ai-question-generation` and `/organization/ai-paper-generation`.
- Source mapping: portal and analytics already satisfy their scoped information/state/privacy contracts and therefore
  receive regression proof only. Training owns the list URL, Drawer, pagination and mutation-feedback changes. The shared
  AI entry owns only organization-mode copy-to-training feedback; content mode and Provider execution remain unchanged.
- Deferred: cross-workspace aliases remain E5; employee mobile surfaces remain E4; cumulative route closure remains E6;
  role acceptance remains F. No browser screenshot, credential, database, Provider or deployment claim is made.

## Design

1. Add a pure, allow-listed enterprise-training list URL codec for lifecycle status, source kind, content kind and page.
   Initialize from the URL, write canonical state with `replaceState`, restore on `popstate`, reset page on filter change,
   and keep the API page size fixed by its existing contract.
2. Use shared `AdminPagination` for the training list. Keep filters and pagination adjacent to the list, and close any open
   read-only detail when list intent changes.
3. Render published/taken-down read-only detail in `AdminDetailDrawer`; preserve safe-detail redaction and answer/analysis
   progressive disclosure. Escape, focus containment and initiating-control restoration come from the shared primitive.
   `继续配置` remains the four-step editor handoff and does not open a competing read-only Drawer.
4. Replace page-level training mutation messages with one shared `AdminToast` feedback object. Copy/create/publish/takedown
   success and safe failures are announced once; object-level list updates and duplicate-submit protection stay intact.
5. Make organization-mode AI copy-to-training completion/failure use the same Toast while retaining per-result pending and
   copied button state. Dismissal hides feedback only; it must not re-enable an already completed copy or change ownership.

## Boundary Guards

- URL values are allow-listed and contain no organization public id, authorization id, AI result id, Prompt, raw answer,
  phone, `redeem_code` or diagnostic content. UI restoration never changes service authorization.
- Standard roles still receive the shared unavailable state before any advanced list, analytics, AI history or quota data.
- Training requests keep the current capability context and organization-derived authorization; the approved source list,
  `mock_exam` exclusion, four steps, weak-evidence confirmation and `evidence_status = none` block are unchanged.
- AI handoff remains organization-private training draft only. No platform formal `question`/`paper`, learner practice,
  `mock_exam`, `exam_report` or `mistake_book` write path is introduced.
- Analytics remains aggregate-only, small-sample-aware and no-export; portal remains read-only for organization tree,
  employees and authorization packages.
- No API/service/schema/database/dependency/build-config/test-infrastructure/Provider/deployment mutation.

## Allowed Changes

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- a narrow co-located enterprise-training list URL helper and test if extraction improves proof clarity
- organization-mode feedback in `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- focused organization training/AI tests and route-family regression tests only as required
- E3 plan/evidence/audit, active state/queue/history and PIC ledger declared by the queue

## Validation

- TDD RED/GREEN for allow-listed URL initialization/canonicalization/popstate restore, page reset, shared pagination,
  Drawer semantics/Escape/trigger restoration, training Toast success/error/dismiss, and organization-AI Toast without
  duplicate copy or data-domain drift.
- Focused organization portal/training/analytics, standard/advanced direct-route, admin AI feature/surface and protected
  authorization/AI/training security suites.
- Serial lint, typecheck, changed-file Prettier, diff check, required build, recovery/serial/security Guards, and Module Run
  pre-commit/closeout/pre-push gates. Full regression is impact-triggered; consumer-only UI changes do not trigger it
  unless review or focused gates expose cross-domain/shared-runtime risk.

## Adversarial Review

- Round 1: URL/query correctness, page/filter restoration, focus lifecycle, single-fact feedback, object updates,
  duplicate submission, requirement/contract coverage, organization scope and data integrity.
- Round 2: malformed URL, stale detail, modal competition, hidden keyboard escape, duplicate AI copy, standard-role/direct-
  URL privilege escalation, cross-workspace leakage, formal-content writes, raw/private data exposure, portal/analytics/
  content-AI regression, magic styling and over-generalization.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality verification
and short branch/worktree cleanup. E4 starts automatically; no deployment.
