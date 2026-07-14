# Content Admin Platform C4 Material Edit Copy Lock Plan

Date: 2026-07-13

Task: `content-admin-platform-c4-material-edit-copy-lock-2026-07-13`

Branch: `codex/content-admin-platform-c4-material-edit-copy-lock`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 7ac6125dddd912f8f6337b5db037940c1354a9b6`

## Goal

Complete the canonical `/content/materials/[publicId]/edit` path using the existing detail, PATCH, copy, semantic-form,
published-reference lock, and authorization contracts. Unlocked materials edit in the dedicated page; locked materials
never mount an editable form and can only enter a copied material editor after an explicit successful POST.

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
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-platform-c3-material-create-editor.md`
- Current material editor/list form, content-integrity/form contracts, session runtime, detail/update/copy API handlers,
  service lock guards, DTOs, question edit analogue, and focused material tests.

## Design And TDD

1. RED-first extend the material editor suite for unlocked GET/PATCH, locked deep-link blocker, explicit copy-to-returned
   edit route, copy failure recovery, server lock-race input retention, missing/forbidden safe return, list edit/copy route
   entry, and create-success transition now that the dynamic route exists.
2. Add the dynamic route and extend `AdminMaterialEditorPage` into create/edit modes. Map only the server-returned DTO into
   the shared form; PATCH status remains `available`; a successful edit resets the dirty baseline.
3. Treat service code `409201` as an authoritative lock race: preserve form input, block further PATCH, and offer explicit
   copy/return. A locked initial GET renders no form. GET/render/refresh never copies.
4. Route product list edit and copy actions to the canonical editor, using only returned `publicId`; retain the read-only
   Detail Drawer and unchanged API/service authorization/lifecycle rules.
5. Run focused material editor/list/API/service tests, lint, typecheck, changed formatting, build, diff and governance
   gates; complete two adversarial rounds plus an independent audit.

## Boundaries And Closeout

No API/service/repository/schema/database, dependency, authorization, AI/Provider, credential, PR, force-push, Cost
Calibration or deployment change is allowed. C5 retains `returnTo`, dirty-leave and focus/scroll recovery ownership.

Closeout is one principal commit, ff-only merge to `master`, push to `origin/master`, exact remote verification, safe
branch/worktree cleanup, and automatic C5 start. Deployment remains blocked pending fresh approval.
