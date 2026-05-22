# Phase 8 Student Mistake Book UI Task Plan

## Metadata

- Task id: `phase-8-student-mistake-book-ui`
- Branch: `codex/phase-8-student-mistake-book-ui`
- Base: `master`
- Created at: `2026-05-22T21:41:19+08:00`

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-mistake-book-runtime.md`

## Scope

Implement the minimal student-facing `mistake_book` UI slice using the existing Phase 8 runtime API.

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-mistake-book-ui.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-mistake-book-ui.md`
- `src/app/(student)/mistake-book/**`
- `src/app/(student)/mistake-books/**`
- `src/app/(student)/home/**`
- `src/features/student/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Plan

1. Add a focused RED unit test for the student `mistake_book` page:
   - reads `tiku.localSessionToken`;
   - calls `/api/v1/mistake-books` with `Authorization: Bearer <token>`;
   - renders Loading, Empty, Error, and Unauthorized states;
   - renders public identifiers as data attributes only and never renders numeric `id`, session token, `code_hash`, raw prompt, raw answer, or secret material;
   - exposes AI explanation as unavailable, without claiming provider success.
2. Implement `src/features/student/mistake-book/StudentMistakeBookPage.tsx` as a client component using the existing API response envelope.
3. Add a route under `src/app/(student)/mistake-book/page.tsx` that renders the feature page. Keep `/mistake-book` as the primary route because it matches the singular glossary term and the queue allowedFiles.
4. Add an entry link from student home navigation to `/mistake-book` without changing unrelated home behavior.
5. Update queue/project state and evidence only within allowed files.

## Risk Controls

- No dependency, schema, migration, `.env.example`, admin, runtime service, or API contract changes.
- API JSON is consumed as camelCase and response envelopes stay `{ code, message, data, pagination? }`.
- The UI uses only the local session token for request headers and never displays the token.
- `publicId` is used only for route/action parameters and DOM data attributes; numeric `id` is neither required nor rendered.
- AI explanation remains visibly unavailable because the runtime route returns `422331` and no mock AI success is in scope.
- Browser/E2E files are not planned for modification. If E2E or browser flow files change, run `npm.cmd run test:e2e`.

## Validation Plan

- RED: `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts`
- GREEN focused: `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts`
- Full unit: `npm.cmd run test:unit`
- Quality gate: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- Build: `npm.cmd run build`
- Naming: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Git readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
