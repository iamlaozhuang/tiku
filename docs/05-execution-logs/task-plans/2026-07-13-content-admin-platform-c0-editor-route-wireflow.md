# Content Admin Platform C0 Editor Route Wireflow Plan

Date: 2026-07-13

Task: `content-admin-platform-c0-editor-route-wireflow-2026-07-13`

Branch: `codex/content-admin-platform-c0-editor-route-wireflow`

Profile: R0 / docs-only decision / `evidence_two_rounds`

Baseline: `master == origin/master == 8086c264b0483bbfc74ebd615364efbab27c3560`

## Goal And Sources

Define the canonical question/material editor routes, return context, dirty-leave behavior, lock/copy path, and C1-C5
source/test ownership before implementation. C0 changes no product runtime, product tests, API, service authorization, data,
dependency, or deployment behavior.

The decision applies the question/paper and admin/ops module/story requirements, the 2026-07-07 full-role source entry and
content-admin P1 list/editor split, the 2026-07-13 P0/PIC contract, the serial plan, ADRs including ADR-007, the PIC ledger,
and the current routes, question/material client, form contract, API detail/copy handlers, service lock guards, and focused
tests. Exact business anchors are US-02-01/02/03/06, US-06-01/08/13/14, PIC-05/06/07/09/10/13, and Batch 5 P1 items 1
and 4. The design board remains visual direction only.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- Current question/material routes, client/forms, list navigation, API detail/copy handlers, service lock guards, and
  focused tests named in the decision and ownership map below.

## Canonical Route Decision

| Resource | List                 | Create editor            | Edit editor                          | Read-only detail                                             |
| -------- | -------------------- | ------------------------ | ------------------------------------ | ------------------------------------------------------------ |
| question | `/content/questions` | `/content/questions/new` | `/content/questions/[publicId]/edit` | Existing list-owned Detail Drawer and `questionDetail` query |
| material | `/content/materials` | `/content/materials/new` | `/content/materials/[publicId]/edit` | Existing list-owned Detail Drawer and `materialDetail` query |

`[publicId]` is the existing external public identifier, never the database primary key. The create/edit pages are
dedicated long-form tasks; list filters and read-only details stay outside them. No alternate modal, Task Drawer, inline
form, or query-only editor route is permitted.

## Navigation And State Contract

1. List entry appends one `returnTo` query value containing only a same-family relative list URL. The decoder accepts
   exactly `/content/questions` for question editors or `/content/materials` for material editors, reparses only the
   canonical list keys, and rejects absolute URLs, protocol-relative URLs, another workspace/resource family, editor
   paths, fragments, unknown keys, and malformed values. Missing/invalid input falls back to the family list root.
2. A versioned `sessionStorage` return snapshot may retain only the validated list URL, finite non-negative `scrollY`,
   and initiating control identity (`create` or `edit:[publicId]`). It contains no session token, payload, content, role,
   authorization, or private value; it is consumed once and stale/invalid records are discarded.
3. `返回列表` and clean cancel use the validated target, never unconditional `history.back()`. Direct editor URLs therefore
   have a deterministic list fallback. On return, the list restores its URL-owned filters/page, then scroll and the
   initiating control; a disconnected/missing target falls back to the list toolbar.
4. The primary `保存` action stays in the editor, shows shared Toast feedback, updates the server-returned object, and
   resets the dirty baseline. A successful create replaces the URL with that object's edit route while preserving
   `returnTo`; it does not create a second object on refresh. Returning to the list is explicit.
5. Dirty internal navigation, browser Back/Forward, cancel, and route changes require a discard confirmation. Refresh or
   tab close uses `beforeunload`; confirmed leave may discard, cancelled leave preserves the form. There is no autosave or
   local-content persistence claim.
6. Refresh of a clean edit route reloads the current server object. Refresh of a clean post-create edit route does not
   replay POST. Network/server failure and conflict preserve input; missing, forbidden, and invalid context expose a safe
   return. A changed server lock state blocks PATCH and offers copy/return rather than silent overwrite.

## Lock, Copy, And Authorization Contract

- An unlocked resource may enter its edit route. A locked resource may be deep-linked, but the page renders a locked
  read-only blocker with reason and safe `复制为新题并编辑` / `复制为新材料并编辑` action; it never mounts an editable form.
- Copy remains the existing explicit `POST .../[publicId]/copy` mutation. GET/render/refresh never copies. After a
  successful copy, navigate to the returned public object's edit route and retain the original validated `returnTo`.
- List/detail copy can use the same mutation-to-editor transition. Failure keeps the current page and reports recoverable
  feedback. The service remains authoritative for locks and permissions; UI visibility or route presence adds no access.
- Existing question/material create, detail, update, disable, and copy API paths, content-integrity rules, published
  reference locks, formal-content boundaries, and `content_admin`/`super_admin` service authorization remain unchanged.

## C1-C5 Source And Test Ownership

| Task                       | Exact target ownership                                                                                                                                                                                                                                                               | Test ownership                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 question create         | `src/app/(admin)/content/questions/new/page.tsx`; extract the existing question form into `src/features/admin/question-material-management/AdminQuestionEditorForm.tsx`; add `AdminQuestionEditorPage.tsx`; change only question-list create entry/removal of inline question create | `tests/unit/admin-question-editor-route.test.ts`; question-list entry/regression cases remain in `tests/unit/admin-question-material-ui.test.ts`   |
| C2 question edit/copy/lock | `src/app/(admin)/content/questions/[publicId]/edit/page.tsx`; extend `AdminQuestionEditorPage.tsx` with detail load, lock blocker, explicit copy-to-edit, update/conflict handling                                                                                                   | Continue `tests/unit/admin-question-editor-route.test.ts`; retain service/API lock/copy suites and list locked-action cases                        |
| C3 material create         | `src/app/(admin)/content/materials/new/page.tsx`; extract the existing material form into `AdminMaterialEditorForm.tsx`; add `AdminMaterialEditorPage.tsx`; change only material-list create entry/removal of inline material create                                                 | `tests/unit/admin-material-editor-route.test.ts`; material-list entry/regression cases remain in `tests/unit/admin-question-material-ui.test.ts`   |
| C4 material edit/copy/lock | `src/app/(admin)/content/materials/[publicId]/edit/page.tsx`; extend `AdminMaterialEditorPage.tsx` with detail load, lock blocker, explicit copy-to-edit, update/conflict handling                                                                                                   | Continue `tests/unit/admin-material-editor-route.test.ts`; retain service/API lock/copy suites and list locked-action cases                        |
| C5 navigation recovery     | Narrow pure codec/snapshot module `src/lib/admin-editor-navigation.ts` and hook `src/hooks/useAdminEditorNavigationGuard.ts`; apply to both editor pages and list return consumers without a universal form/router framework                                                         | `src/lib/admin-editor-navigation.test.ts`; `tests/unit/admin-editor-navigation-recovery.test.ts`; retain D3 list popstate/focus/scroll regressions |

C1/C3 own the first usable route and same-resource validation contract. C2/C4 own edit, lock and copy behavior. C5 owns
cross-resource dirty-leave, direct URL, refresh, Back/Forward, stale snapshot, focus and scroll parity. C6 owns cumulative
proof. Later tasks may adjust filenames only if existing code forces a narrower equivalent and evidence records the
mapping; route shapes and behavioral contracts require a separately approved decision change.

## Validation And Closeout

Validate all cited current paths, planned route uniqueness, same-family `returnTo` rules, C1-C5 canonical order, active
state links, scoped formatting, diff, recovery Guard, Program Guard, and Module Run closeout scripts. R0 runs no product
tests or build. Complete two adversarial rounds in the evidence, make one docs/state commit, ff-only merge, push, verify
remote equality, clean the short branch/worktree, and start C1 automatically. No deployment.
