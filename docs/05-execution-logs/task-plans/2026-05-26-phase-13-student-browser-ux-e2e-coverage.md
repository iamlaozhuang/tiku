# Phase 13 Student Browser UX E2E Coverage Task Plan

**Task id:** `phase-13-student-browser-ux-e2e-coverage`

**Branch:** `codex/phase-13-student-browser-ux-e2e-coverage`

**Date:** 2026-05-26

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-student-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Queue Scope

### allowedFiles

- `e2e/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

### blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Range

Close `STU-GAP-003` by adding focused browser UX coverage for the student journey that Phase 12 manually verified but the prior e2e did not assert deeply enough.

The task is test-only plus task-state documentation. It must not change runtime UI, APIs, database schema, dependencies, package files, env files, real provider config, or cloud/staging/prod connectivity.

## Implementation Plan

1. Extend `e2e/student-practice-mock-entry.spec.ts` to keep the existing login and route-entry checks.
2. Add browser assertions that submit one practice answer and verify feedback appears without literal rich-text tags or blocked script text.
3. Add mock_exam pre-submit secrecy assertions before any submit action.
4. Add browser navigation checks for `exam_report` and `mistake_book`.
5. Trigger one local synthetic AI explanation from mistake_book and assert the visible UI remains redacted from raw prompt/model/provider/token/secret markers.
6. Keep assertions bounded to visible UI text and stable route/test ids already present in the app.

## Browser Validation Plan

Run the Playwright task path on localhost:

- `/login`
- `/home`
- `/practice?paperPublicId=...`
- submit one answer
- `/mock-exam?paperPublicId=...`
- `/exam-report`
- `/mistake-book`
- mistake_book AI explanation action

Expected result: pages load, actions are visible, practice feedback appears, mock_exam hides answer/analysis pre-submit, report and mistake_book surfaces render, and no literal rich-text markup or raw AI/provider/session markers are visible.

## Code Cross-Check Paths

- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/features/student/mock-exam/StudentMockExamPage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`

## Risk Defense

- Use synthetic local seeded data only.
- Do not record local session tokens or credentials in evidence.
- Do not add waits based on arbitrary time when a visible route, heading, test id, or API-triggered UI state can be asserted.
- Do not add dependencies or modify Playwright config.
- Keep test changes scoped to the student UX gap; no runtime edits unless a verified regression is found.

## Validation Commands

- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to staging, prod, cloud, or a real provider.
- Do not record secrets, tokens, Authorization headers, database URLs, raw prompt, raw answer, raw model response, raw provider payload, full paper content, full teaching material, OCR full text, or private customer-like data.
