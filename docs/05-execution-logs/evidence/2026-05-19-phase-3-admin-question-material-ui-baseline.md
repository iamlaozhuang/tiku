# Phase 3 Admin Question Material UI Baseline Evidence

## Task

- Task id: `phase-3-admin-question-material-ui-baseline`
- Branch: `codex/phase-3-admin-question-material-ui-baseline`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-3-admin-question-material-ui-baseline.md`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-admin-question-material-ui-baseline-security-review.md`

## Changes

- Added admin question/material management UI baseline:
  - `/content/questions`
  - `/content/materials`
- Added searchable/filterable question and material views with:
  - keyword search
  - profession, subject, and status filters
  - question/material segmented views
  - create, edit, disable, and copy controls
  - paper reference visibility for questions
  - question usage visibility for materials
  - publicId-only DOM data attributes
- Added focused unit coverage for the admin UI baseline.
- With human approval after design assessment, split existing App Router route factory adapters into collection/detail handlers for:
  - materials
  - questions
  - papers
  - paper assets

## TDD Evidence

- RED command:
  - `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
  - Result: failed because `@/features/admin/question-material-management/AdminQuestionMaterialManagement` did not exist.
- GREEN command:
  - `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
  - Result: pass, 1 file and 3 tests.
- Approved route adapter RED command:
  - `npm.cmd run test:unit -- src/server/services/material-route.test.ts src/server/services/question-route.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-route.test.ts`
  - Result: failed because old factories did not expose `collection` and `detail` handler groups.
- Approved route adapter GREEN command:
  - `npm.cmd run test:unit -- src/server/services/material-route.test.ts src/server/services/question-route.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-route.test.ts`
  - Result: pass, 4 files and 9 tests.

## Validation

Executed on `2026-05-19` in `F:\tiku\.worktrees\phase-3-admin-question-material-ui-baseline`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit`: pass, 38 files and 97 tests
- `npm.cmd run build`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `npm.cmd run format:check`: initial fail on 2 TS files
- `npx.cmd prettier --write src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx tests/unit/admin-question-material-ui.test.ts`: pass
- `npm.cmd run format:check`: pass after targeted formatting
- Browser verification on `http://localhost:3010`:
  - `/content/questions`: heading visible, question row visible, keyword filter returned `物流成本核算适用于哪类场景？`
  - `/content/materials`: material tab selected, material row visible

Post-merge validation executed on `2026-05-19` in `F:\tiku` after fast-forward merge to `master`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit`: pass, 38 files and 97 tests
- `npm.cmd run build`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `npm.cmd run format:check`: pass

## Guardrails

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No dependency introduction.
- No `src/db/schema/**` change.
- No `drizzle/**` migration generation.
- No `.env.example` change.
- UI and route paths use kebab-case plural nouns.
- Dynamic API params use `publicId`.
- UI data and contract-shaped fields use camelCase.
- Internal numeric ids are not exposed.

## Notes

- The UI baseline uses local fixture data shaped from existing contracts because runtime-backed admin APIs are not yet integrated.
- Action controls are intentionally non-destructive placeholders.
- The route adapter split was required to satisfy Next.js 16 build validation and preserves the existing service boundary.
