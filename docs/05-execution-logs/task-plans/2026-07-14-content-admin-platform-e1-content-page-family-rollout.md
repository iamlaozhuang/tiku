# Content Admin Platform E1 Content Page-Family Rollout Plan

Date: 2026-07-14

Task: `content-admin-platform-e1-content-page-family-rollout-2026-07-13`

Branch: `codex/content-admin-platform-e1-content-page-family-rollout`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 04ef78f926b68298d8b5bb3ea961645e4095eeff`

## Goal

Roll the shared B1-B4 interaction contracts into the still-local content page-family consumers without reopening the
closed question/material behavior or creating a universal page framework. The narrow product change replaces duplicated
paper/knowledge/resource feedback with `AdminToast` and the resource detail modal with `AdminDetailDrawer`; the complete
paper, knowledge, resource, overview, question/material compatibility, and content AI suites prove that content
lifecycle, draft/review separation, evidence gating, and Provider-closed behavior do not regress.

## SSOT Read List

- `AGENTS.md`, `docs/04-agent-system/state/project-state.yaml`,
  `docs/04-agent-system/state/task-queue.yaml` and the active history index; canonical B-F plan, standing authorization,
  E0 inventory, PIC ledger, Lean Module Run v3 and closeout/archival SOPs.
- `docs/03-standards/code-taste-ten-commandments.md` and every ADR under `docs/02-architecture/adr/`, including ADR-007.
- `docs/01-requirements/00-index.md` and the question/paper, admin/operations, AI/RAG and full-role modules/stories
  relevant to paper, knowledge, resource and content AI.
- `docs/01-requirements/advanced-edition/00-index.md`,
  `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and
  `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`,
  `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`,
  `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md` and
  `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`.
- All `CONTENT-E1` source/test roots named by E0: content overview, paper list/detail/composer, knowledge nodes, resources,
  content AI, and their focused suites; closed B/D/C question/material suites as compatibility proof.
- Analogous shared implementations: `AdminToast`, `AdminDetailDrawer`, `AdminStateTemplate`, `AdminList`, list-query
  interaction hooks/contracts, and existing question/material consumers.

The complete reading found no unresolved requirement/ADR/traceability conflict. Latest AI baseline supersedes old closed
residuals; no fresh failure permits reopening A01-A30 or the closed AI issue classes.

## Exact Scope And Baseline Application

- Paper list: preserve canonical URL/list behavior and lifecycle actions; use the shared typed Toast only for mutation
  outcomes. Initial deep-link target status remains inline because it is navigation state, not mutation feedback.
- Knowledge nodes: preserve tree, recommendation, lifecycle and AI result behavior; replace only the local Toast renderer.
- Resources: preserve content ownership, private-resource/RAG wording, upload/vector lifecycle and URL state; replace the
  local Toast and detail modal with the shared focus-managed Drawer.
- Paper detail/composer and content overview: no speculative refactor; retain as focused regression consumers because the
  composer already consumes the shared Drawer and the overview provides the content-workspace entry.
- Content AI: no implementation change. Its draft/review-only, formal-content separation, evidence gate and Provider-
  closed contracts are protected by the current AI suites.
- Question/material list/editors: compatibility regression only. B/D/C are closed and remain untouched absent fresh
  current-baseline failure evidence.
- E0-G03 destination behavior is regression-protected here; E5 still owns the cross-workspace alias itself. E0-G01,
  E0-G02 and E0-G04 remain assigned to E5.

## TDD Design

1. RED-first add resource behavior proof that opening details focuses the shared close action, Escape closes the Drawer,
   and focus returns to the initiating `查看资料` control.
2. RED-first require paper, knowledge and resource consumers to render shared `AdminToast` semantics with explicit
   dismiss controls while retaining safe existing feedback copy.
3. Replace only duplicated consumer presentation with the established shared primitives. Do not change API calls,
   server contracts, lifecycle transitions, request concurrency, authorization or AI behavior.
4. Keep caller-owned feedback lifetime and no timer/provider. Keep resource details read-only and server-returned data
   authoritative.

## Risk Defenses

- The shared Drawer owns focus containment, Escape and trigger restoration; no second focus/modal implementation remains
  in the resource detail path.
- Success remains polite; failures remain assertive; raw response messages, diagnostics, numeric database ids,
  credentials, Prompt/Provider payloads and private resource contents are never copied into feedback.
- Existing confirmation, disabled-reason, stale-response, duplicate-submit, publish snapshot, formal-adoption and
  content-role authorization paths are unchanged.
- `AdminToast`/`AdminDetailDrawer` themselves are not modified, avoiding a new shared-runtime blast radius. No API,
  service, schema, database, dependency, environment, Provider, browser, PR, force-push or deployment action.
- E1 makes route-family-scoped claims only. It does not globally promote PIC status, close E0 alias candidates, or treat
  file/test existence as acceptance.

## Allowed Changes

- `src/features/admin/paper-management/AdminPaperManagementClient.tsx` and its focused test.
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`.
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`.
- Focused `CONTENT-E1` unit tests needed for RED/GREEN and protected regression.
- Active state/history, this plan, E1 evidence/audit and the PIC coverage/exception ledger declared by the queue.

## Validation

- Focused RED/GREEN: paper list feedback, knowledge/resource lifecycle feedback, resource Drawer focus/Escape/restore,
  paper detail/composer, content overview, content AI draft/review and closed question/material compatibility.
- Security-boundary regression: current content AI suites prove Provider calls remain closed and draft/review cannot
  become formal content; source diff proves API/service/authorization/schema/dependency boundaries are untouched.
- Serial lint, typecheck, changed-file Prettier, `git diff --check`, production build, recovery/Program Guards and Module
  Run closeout gates.
- Full unit regression is impact-triggered because E1 explicitly enters the protected AI page family and crosses the
  paper/knowledge/resource content family. Run it serially before build; E1 is not a fixed full node.

## Adversarial Review

- Round 1: lifecycle/data integrity, safe feedback, Drawer focus lifecycle, content ownership, draft/review/formal
  separation, Provider closure, requirements and contracts.
- Round 2: regressions, direct exceptional paths, stale/duplicate actions, privilege expansion, diagnostic leakage,
  cross-page inconsistency, closed-task reopening, false PIC promotion and over-design.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; E2 starts automatically. Deployment remains blocked.
