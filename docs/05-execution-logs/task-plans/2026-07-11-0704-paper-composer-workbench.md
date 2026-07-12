# 0704 Paper Composer Workbench Implementation Plan

## Task Metadata

- taskId: `0704-paper-composer-workbench-2026-07-11`
- branch: `codex/0704-paper-composer-workbench`
- base: `e3015ddb899fe17883bdbb74e5aaa7620c8e6cfe`
- goal: replace the identifier-driven inline compose form with a dedicated, readable paper composition workbench while preserving content lifecycle, snapshot, scoring, permission, and publish semantics.

## Required Reading

- `AGENTS.md`, current project state/task queue, code taste commandments, UI code standard, and every ADR
- requirement indexes, question/paper module and stories, paper count/type policy, formal-content workflow traceability, full-role UI/UX source entry, content-admin closure baseline, and approved five-task design
- task 1 and task 2 evidence/audit, approved existing paper screenshot, current paper list/detail clients, paper/question/material contracts, validators, services, repositories, runtime routes, and focused tests
- Product Design routing plus Superpowers brainstorming and writing-plans guidance; the user-approved task design is the implementation design gate for this branch

## Frozen Business Semantics

- A paper remains one profession, level, and subject; draft/published/archived transitions and server authorization remain authoritative.
- Adding a question still snapshots the current source question and associated material. The workbench never edits source stem, options, objective answer, analysis, or source bindings.
- Score, order, paper-section assignment, and paper-scoped subjective scoring points are draft-only. Scoring-point changes never write back to the source question.
- A material question group is atomic when moved between paper sections: the group and all its member paper questions move together, preserving stored question/material snapshots.
- Published papers are read-only; archive and copy remain explicit confirmed lifecycle actions. Existing endpoint paths and error-envelope conventions remain unchanged.
- Provider stays disabled. No Provider, direct database, staging, production, deployment, env/secret, Cost Calibration, dependency, package/lockfile, schema, migration, seed, or new screenshot/raw DOM action is allowed.

## Architecture And Scope

1. Add RED component/service/validator tests for the dedicated compose route, draft creation handoff, picker filtering, snapshot-preserving add/edit/remove, group-atomic section movement, validation states, and published read-only mode.
2. Add `/content/papers/[publicId]/compose` and a focused `AdminPaperComposerPage` that loads the existing paper detail contract and keeps list management separate.
3. Split the workbench into a compact status header, paper-section navigator, paper content canvas, question/material picker drawer, paper-question editor drawer, validation panel, and confirmation dialogs.
4. Use the existing question list contract with paper scope defaults. Add only the missing optional `materialPublicId` read filter so the material-first path can select questions actually linked to the chosen material.
5. Extend the existing draft paper-question PATCH input with `paperSection`. Standalone questions move directly; grouped questions move as one atomic group. Stored snapshots are not rebuilt and source content is not read again.
6. New paper sections are materialized only when the first question or material group is added/moved into them. Do not invent an empty-section persistence API.
7. Support paper-scoped score, order, and subjective scoring-point edits through the existing PATCH route; remove through the existing DELETE route; refresh the authoritative paper detail after every mutation.
8. Show local publish blockers and non-blocking scope/material warnings for navigation only. The existing publish service remains the final authority and receives the same POST request.
9. On successful draft creation, navigate directly to the compose route. List rows link to the same route; no business/public identifier input is shown to the content administrator.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-paper-composer-workbench.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-paper-composer-workbench-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-paper-composer-workbench-audit.md`
- `src/app/(admin)/content/papers/[publicId]/compose/page.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.test.tsx`
- `src/features/admin/paper-composer/AdminPaperComposerPage.tsx`
- `src/features/admin/paper-composer/PaperComposerQuestionPickerDrawer.tsx`
- `src/features/admin/paper-composer/PaperComposerQuestionEditorDrawer.tsx`
- `src/features/admin/paper-composer/paper-composer-model.ts`
- `src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx`
- `src/server/validators/question.ts`
- `src/server/validators/question.test.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/repositories/question-repository.test.ts`
- `src/server/services/content-question-material-runtime.ts`
- `src/server/validators/paper-draft.ts`
- `src/server/validators/paper-draft.test.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/repositories/paper-draft-repository.test.ts`
- `src/server/services/paper-draft-service.test.ts`
- `src/server/services/paper-draft-route.test.ts`
- `tests/unit/phase-9-content-question-material-runtime.test.ts`
- `tests/unit/admin-paper-ui.test.ts`

## Explicit Exclusions

- no source-question/material mutation, automatic source synchronization, empty-section persistence, drag-and-drop, bulk reorder, arbitrary material reassignment, or published-paper editing
- no publish-validation rule, question-count limit, score precision, snapshot creation, lock, copy, archive, delete, role, permission, or audit-log semantic change
- no AI generation/adoption, resource, knowledge-node maintenance, Provider, model configuration, prompt, raw AI output, organization data, authorization/edition, or learner surface change
- no credentials, session/cookie/token capture, raw database rows, internal numeric IDs, full content, or Provider payload in evidence

## TDD And Verification

1. RED tests first for missing route/workbench, material-filter query, section move contract, group-atomic persistence behavior, URL navigation, accessible drawers, validation, and read-only lifecycle behavior.
2. GREEN with the smallest route, model helpers, workbench components, and narrowly extended read/move contracts.
3. Adversarial review role, draft lifecycle, snapshot immutability, group atomicity, source/content isolation, sensitive display, error/loading/empty/forbidden states, and keyboard/focus behavior.
4. Run focused tests, lint, typecheck, full format check, `git diff --check`, and Module Run v2 pre-commit/pre-push gates.
5. Write redacted evidence/audit, commit once, fast-forward merge, rerun gates on master, push, delete the short branch, and confirm clean/aligned before task 4.

## Acceptance

- creating a draft leads to a dedicated workbench; every draft row has an obvious compose entry and no identifier-entry form remains
- the first screen names the paper, lifecycle state, question count, total score, publish blockers, save state, and next available action
- content administrators can choose an existing/new paper section, filter and preview available questions, use a material-first path, and add without seeing or typing public identifiers
- paper content is grouped by paper section and material group; source content is read-only and stored snapshots remain unchanged
- draft questions support score/order/scoring-point edits, section movement, and confirmed removal; grouped questions move only with their whole material group
- publish blockers and warnings are distinguishable and locatable; server publish validation remains authoritative
- published and archived papers render read-only; publish/archive/copy confirmations and existing endpoint semantics remain intact
- loading, empty, filtered-empty, unauthorized, forbidden/not-found, mutation error, disabled, and confirmation states are explicit and accessible
