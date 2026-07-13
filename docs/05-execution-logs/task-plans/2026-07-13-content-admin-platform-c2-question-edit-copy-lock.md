# Content Admin Platform C2 Question Edit Copy Lock Plan

Date: 2026-07-13

Task: `content-admin-platform-c2-question-edit-copy-lock-2026-07-13`

Branch: `codex/content-admin-platform-c2-question-edit-copy-lock`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 785b93de8cb4e60f82229cd28686ef084b531c5f`

## Goal

Complete the canonical `/content/questions/[publicId]/edit` path without changing the question API, server authorization,
published-reference lock or copy semantics. Unlocked questions load into the shared editor and PATCH through the existing
contract. Locked questions never mount an editable form and offer one explicit `POST .../copy` transition to the copied
question's edit route. The product list's edit and copy actions use the same dedicated-route flow; the Detail Drawer stays
read-only.

C5 still owns validated `returnTo`, session snapshots, dirty-leave, refresh and browser-history recovery. C2 therefore
uses the deterministic question-list fallback and does not invent a second navigation codec.

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-formal-draft-detail-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-09-content-ai-question-formal-publish-loop.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-c0-editor-route-wireflow.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-c1-question-create-editor.md`
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-platform-c1-question-create-editor.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- Current question editor/list/form, content-admin runtime, question detail/copy API handlers and contracts, service lock
  guards, and focused editor/list/route/service tests.

## TDD And Implementation

1. RED: extend `admin-question-editor-route.test.ts` for unlocked detail load/edit PATCH, locked deep-link blocker, explicit
   copy-to-edit, PATCH lock-conflict input preservation, safe return, and product list edit/copy route transitions.
2. Export the existing question-to-form mapper through the narrow editor module; do not duplicate validation or create a
   universal form/router abstraction.
3. Extend `AdminQuestionEditorPage` with create/edit modes, session/detail loading, missing/error states, shared binding
   options, PATCH conflict handling, and POST-copy navigation. GET/render/refresh must never copy.
4. Add the dynamic edit page. Route only product question create/edit/copy entries; keep materials and the read-only Detail
   Drawer unchanged. Enable the question route behavior from both product list entry pages so switching tabs cannot expose
   an alternate inline question editor.
5. Preserve the later content-AI formal-draft contract: the existing public `questionPublicId` link redirects to the
   canonical dynamic editor with explicit draft-publish intent; a disabled adopted draft retains `发布为正式题目` and PATCH
   `status: available`. Do not touch generation, Provider, ownership, edition or adoption services, and do not reopen
   superseded AI issue classes without fresh current-baseline failure evidence.
6. GREEN/refactor: run editor/list, the existing content-AI entry contract, and question route/service lock-copy suites;
   lint, typecheck, changed-file
   format, production build, diff/Guard and Module Run closeout gates.

## Risk Defense

- Never PATCH a locked question or use UI visibility as authorization. A 409202 lock race blocks further PATCH and keeps
  the authored form visible until the user explicitly copies or returns.
- Copy is POST-only, duplicate guarded, failure stays on the current page, and successful navigation uses only the
  server-returned public id. No identifier is rendered as user-facing content.
- Preserve standard API envelope, semantic validation, status transition and recoverable input from the existing editor.
- Block API/service/repository/schema/dependency/AI/edition/deployment changes. No credentials are needed.
- Round 1 attacks data/contract/lock correctness; Round 2 attacks regression, privilege, exceptional paths,
  cross-resource consistency and over-design. Findings are fixed within C2 and revalidated.

## Closeout

One principal commit; ff-only merge to `master`; push `origin/master`; verify exact remote equality; clean the short
branch/worktree; start C3 automatically. No deployment.
