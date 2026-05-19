# Phase 3 Admin Paper UI Baseline Task Plan

## Task

- Queue id: `phase-3-admin-paper-ui-baseline`
- Goal: add the content-admin paper management UI baseline for `US-06-09`, including paper list visibility, multidimensional filters, draft/composition/publish/archive/copy controls, paper asset visibility, and mock exam record counts.
- Branch/worktree: `codex/phase-3-admin-paper-ui-baseline` at `F:\tiku\.worktrees\phase-3-admin-paper-ui-baseline`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-admin-question-material-ui-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-admin-question-material-ui-baseline-security-review.md`
- `src/app/(admin)/content/papers/page.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagement.ts`
- `src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx`
- `src/server/contracts/paper-draft-contract.ts`
- `src/server/contracts/paper-asset-contract.ts`

## Constraints

- Do not modify `package.json`, `pnpm-lock.yaml`, or `package-lock.json`.
- Do not modify `src/db/schema/**`.
- Do not generate or modify `drizzle/**` migrations.
- Do not modify `.env.example`.
- Keep routes kebab-case plural nouns and dynamic parameters public identifier based (`publicId`), never numeric `id`.
- Keep JSON-shaped UI/contract fields camelCase.
- Use the existing admin shell and design tokens; avoid raw color literals, pure black, cheap gradients, or one-off visual systems.
- Keep this task scoped to a UI baseline. Runtime-backed mutations and admin authorization enforcement remain accepted gaps until their API integration tasks.

## TDD Plan

1. Add a focused failing unit test under `tests/unit/` for the paper management baseline.
2. Run the focused test and capture the RED failure caused by the missing paper management feature.
3. Implement a feature export under `src/features/admin/paper-management/`.
4. Implement the admin component under `src/components/admin/PaperManagement/` using contract-shaped fixture data.
5. Replace `/content/papers` placeholder page with the paper management baseline.
6. Re-run the focused test for GREEN, then run the full queue validation commands.

## Implementation Approach

- Model paper rows from `PaperDraftDto` and `PaperAssetDto` plus admin-only metadata for `updatedAt`, publish readiness, validation issues, and `mockExamRecordCount`.
- Provide:
  - keyword search by name, source, publicId, section titles, and asset names
  - profession, subject, paperStatus, and paperType filters
  - default updated-time descending ordering in fixture order
  - visible actions for new draft, compose, publish, archive, copy, and asset download/bind
  - disabled action state when a lifecycle operation is not valid
  - paper section, question count, total score, original file, and mock exam record visibility
  - loading, empty, and error states through explicit component states for the baseline
- Do not wire buttons to server mutations. The UI is intentionally non-destructive until backend/admin permission integration is claimed.

## Risk Defense

- `admin`: page remains under `(admin)/content/papers` and does not create student-facing links.
- `authorization`: no new server action or API route is introduced; mutation controls are placeholders and must later be guarded by admin role checks.
- `api_contract`: fixture data follows existing contract DTO names; only `publicId` appears in DOM data attributes.
- `data exposure`: no numeric database `id`, session data, password, token, admin phone, or storage `objectKey` is exposed.
- `data_contract`: no schema, migration, package, or environment files are changed.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`

## Initial Environment Notes

- A short-lived worktree was created from `master` at `e331597`.
- Frozen dependency install in the worktree timed out after 124 seconds but created `node_modules`; tracked files remained clean.
