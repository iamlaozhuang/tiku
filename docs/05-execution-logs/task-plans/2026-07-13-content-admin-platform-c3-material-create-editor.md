# Content Admin Platform C3 Material Create Editor Plan

Date: 2026-07-13

Task: `content-admin-platform-c3-material-create-editor-2026-07-13`

Branch: `codex/content-admin-platform-c3-material-create-editor`

Profile: R1 / `evidence_two_rounds`

Baseline: `master == origin/master == 0e2b4a43cd9cc2b193807792d816981e71a85a8d`

## Goal And Sources

Implement the canonical `/content/materials/new` editor and route the product material-list create action to it. Reuse the
existing material semantic-integrity and POST API contracts so empty rich text, the 30000-character limit, empty table
templates, broken media references, required classification, duplicate submit, and recoverable failure behavior do not
drift from Batch A.

The task follows AGENTS.md, the taste commandments, all ADRs, the question/paper and admin/ops requirements and stories,
the 2026-07-13 P0/PIC contract, the C0 editor wireflow decision, the serial plan, standing authorization, PIC ledger, and
the current material form/API/service tests. C3 changes no API, service authorization, lifecycle, lock/copy, database,
dependency, Provider, credential, or deployment behavior.

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
- Current material list/client form, content-integrity/form contract, session runtime, API create handler, DTOs, service
  guards, and focused material/question tests.

## Implementation

1. Add the dedicated route page and a resource-specific `AdminMaterialEditorPage` that validates the admin session,
   renders safe loading/unauthorized/error states, performs one explicit POST, preserves input on failure, and replaces
   the form with a non-resubmittable completion state. C4 will switch that staged success to the returned edit route when
   the dynamic route exists; C3 must not navigate users to a missing route.
2. Expose the existing material form, default values, and input mapper through `AdminMaterialEditorForm` rather than
   duplicating semantic validation or introducing a universal editor framework.
3. Route product material create actions from both content entry pages to `/content/materials/new`; retain the direct
   component default only as an existing focused-test seam. C4 continues to own material edit/copy/lock.
4. Add RED-first dedicated route tests covering semantic-empty focus, valid POST/replace, 30000 limit, media/table rules,
   failure input retention, duplicate-submit protection, safe session failure, and product list navigation.
5. Record two adversarial review rounds and concise evidence, update PIC/state projections, then run focused tests, lint,
   typecheck, changed-file format, build, diff and governance gates.

## Risk Defenses

- C3 renders no returned identifier and creates no edit URL before C4 owns that route; database ids and
  caller-controlled redirects are excluded.
- GET/render/refresh never mutates. A failed or conflicting POST leaves the authored form mounted and distinguishable.
- Client checks call the existing `getMaterialIntegrityIssues`; the server remains authoritative through the unchanged
  `/api/v1/materials` contract.
- Material edit, copy, disable, published-reference locks, read-only Drawer, and list query/return behavior remain owned by
  C4/C5 and are regression-tested without broadening this R1 task.
- No deployment is executed; deployment remains blocked pending fresh approval.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-material-editor-route.test.ts tests/unit/admin-question-material-ui.test.ts src/server/services/material-route.test.ts src/server/services/material-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- changed-files Prettier check
- `npm.cmd run build`
- `git diff --check`
- recovery Guard, Program Guard, pre-commit hardening, module-closeout readiness, and pre-push readiness

Closeout is one principal commit, ff-only merge to `master`, push to `origin/master`, exact remote verification, and safe
short branch/worktree cleanup. Start C4 automatically; no deployment.
