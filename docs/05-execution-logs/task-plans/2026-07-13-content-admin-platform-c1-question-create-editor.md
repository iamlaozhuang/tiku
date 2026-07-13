# Content Admin Platform C1 Question Create Editor Plan

Date: 2026-07-13

Task: `content-admin-platform-c1-question-create-editor-2026-07-13`

Branch: `codex/content-admin-platform-c1-question-create-editor`

Profile: R1 / `evidence_two_rounds`

Baseline: `master == origin/master == c11015938fcd19482852f92389c166b4c2492960`

## Goal

Move question creation from the list-side panel to the dedicated `/content/questions/new` route while preserving the
existing P0 semantic validation, accessible error summary/first-invalid focus, keyboard submit, binding selectors,
duplicate-submit guard, recoverable failure input, standard API envelope, and content-admin authorization boundary.

C1 creates the first usable route and a stable question-editor module seam. C2 still owns the dynamic edit route,
locked deep-link and copy-to-edit flow; C5 owns canonical `returnTo`, dirty-leave and cross-route focus/scroll recovery.
Until C2 exists, successful creation must not navigate to a missing edit route: it renders a non-resubmittable completion
state with an explicit list return. C2 replaces that staged completion with the C0 create-to-edit transition.

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
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-c0-editor-route-wireflow.md`
- Current question list/client form, content-integrity/form contract, session runtime, API create handler, DTOs, and focused
  question/material tests.

## Design And TDD

1. RED: add route/source tests proving `/content/questions/new` owns a dedicated editor surface, list create navigates to
   it, empty/semantic-invalid submit stays client-side with accessible errors, valid submit posts once, failure preserves
   input, and success cannot submit a duplicate.
2. Export the existing question form and narrow helpers through `AdminQuestionEditorForm.tsx` so the route and existing
   edit consumer use one implementation. Do not duplicate validation or introduce a universal form framework.
3. Add `AdminQuestionEditorPage.tsx` with session/admin-context loading, shared async/error/Toast semantics, binding
   options, POST-only creation, explicit list return, and a completion state containing no internal identifier.
4. Add `src/app/(admin)/content/questions/new/page.tsx`. Change only the question create entry to router navigation;
   material create and existing question/material edit paths remain unchanged in C1.
5. GREEN/refactor: run the new editor tests plus the existing question/material regression file, then lint, typecheck,
   changed-file Prettier, build, diff/Guard and Module Run closeout gates.

## Scope And Boundaries

Allowed product files: the question list and `new` routes, `AdminQuestionEditorPage.tsx`,
`AdminQuestionEditorForm.tsx`, the current question/material client, and focused question editor/list tests. Governance
files are the three active-state files, this plan/evidence, and the PIC ledger.

Blocked: material editor implementation, question edit/copy/lock implementation, API/service/repository/schema/database,
dependencies/lockfiles, authorization or lifecycle rule changes, AI/Provider, browser acceptance, credentials, PR, force
push, Cost Calibration, staging/prod and deployment.

Two adversarial rounds attack semantic validation/data integrity/route contract first, then regression, privilege,
network/error/duplicate paths, cross-resource consistency and over-design. Close with one principal commit, ff-only merge,
push/equality verification and cleanup, then start C2 automatically.
