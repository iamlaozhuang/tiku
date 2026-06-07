# Phase 3 Admin Question Material UI Baseline Task Plan

## Task

- Queue id: `phase-3-admin-question-material-ui-baseline`
- Goal: add the admin question and material management UI baseline for `US-06-08`, including searchable/filterable question and material views, safe admin actions, and reference visibility.

## Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/system-design/frontend/01-style-tone.md`
- `docs/02-architecture/system-design/frontend/02-design-tokens.json`
- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/content/papers/page.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/server/contracts/question-contract.ts`
- `src/server/contracts/material-contract.ts`

## Constraints

- Work is isolated in `codex/phase-3-admin-question-material-ui-baseline`.
- Do not modify package or lock files.
- Do not modify `src/db/schema/**`, `drizzle/**`, or `.env.example`.
- Use existing REST/API naming discipline: routes are kebab-case plural nouns, external identifiers use `publicId`, JSON-shaped UI data remains camelCase.
- Admin UI must use design tokens and existing admin layout patterns; no hard-coded raw colors or decorative one-off styling.

## TDD Plan

1. Add a failing unit test for the admin question/material management experience under `tests/unit/`.
2. Run the focused unit test and capture the RED failure.
3. Implement a reusable admin feature component using existing contracts and local baseline fixtures.
4. Add `/content/questions` and `/content/materials` route pages that render the baseline in the relevant view.
5. Re-run the focused test, then the full queue validation commands.

## Implementation Approach

- Create a feature slice under `src/features/admin/question-material-management/`.
- Model list rows from `QuestionDto` and `MaterialDto` plus admin-only reference metadata.
- Provide:
  - keyword search
  - profession, subject, and status filters
  - question/material segmented views
  - visible action controls for create, edit, disable, and copy
  - reference visibility for papers using a question and questions using a material
  - empty state when filters return no rows
- Keep this as a UI baseline without backend mutation wiring; action buttons are intentionally non-destructive placeholders until API routes are claimed.

## Approved Scope Extension

- During `npm.cmd run build`, Next.js 16 route validation exposed an existing App Router adapter type mismatch in question, material, paper, and paper asset routes.
- Human approval was granted after design assessment.
- The approved fix is limited to route adapter shape:
  - split collection route handlers from detail route handlers
  - keep existing service/repository contracts and runtime behavior unchanged
  - update the corresponding route factory tests and Next.js route exports
- This does not change package files, schemas, migrations, environment files, API payload fields, or database contracts.

## Risk Defense

- `admin`: pages live only under the existing admin route group and do not create public student-facing links.
- `authorization`: no authorization bypass or new server action is introduced; future mutation endpoints must enforce admin permissions server-side.
- `api_contract`: UI consumes existing contract types and only exposes `publicId` in data attributes/routes.
- `data_contract`: no database schema or migration changes.
- `privacy`: sample fixture content avoids real user data.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
