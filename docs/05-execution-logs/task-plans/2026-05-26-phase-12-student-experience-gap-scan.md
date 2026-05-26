# Phase 12 Student Experience Gap Scan

**Task id:** `phase-12-student-experience-gap-scan`

**Branch:** `codex/phase-12-student-experience-gap-scan`

**Goal:** Execute the student role slice from the Phase 12 role-scenario scripts with real localhost browser interaction and code cross-checks. Record gaps only; do not change runtime, UI, tests, dependencies, schema, migrations, package manifests, lockfiles, or environment files.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-auth-and-session-boundary.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-local-dev-runtime-and-data-safety.md`
- `docs/02-architecture/adr/adr-005-ai-provider-model-config-and-secret-boundary.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-03-exam-practice.md`
- `docs/01-requirements/stories/epic-04-ai.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Role And Scenario Scope

Primary role: `student`.

Supporting boundary: unauthenticated user attempting to access protected student routes.

Covered scripts from the prior plan:

- S1 Student Authorized Learning Flow
- S3 Unauthenticated And Session Boundary Flow, limited to student protected route redirect
- S6 Admin AI/RAG, limited to the student-facing `ai_explanation` surface from mistake_book

Deferred to later queue items:

- no-authorization student and expired/insufficient authorization: `phase-12-auth-organization-boundary-gap-scan`
- admin and organization management: `phase-12-admin-experience-gap-scan` and `phase-12-auth-organization-boundary-gap-scan`
- AI redaction admin/runtime deep scan: `phase-12-ai-redaction-runtime-gap-scan`

## Experience Script Design

### Student Authorized Learning Flow

Preconditions:

- Use local seeded or test-created student credentials without recording credential values.
- Local dev server runs on `http://127.0.0.1:3000`.
- Browser session is local only.

Steps:

1. Open `/login`.
2. Submit student credentials through the visible login form.
3. Confirm redirect to `/home`.
4. Confirm authorized scopes and paper cards are visible.
5. Open the first `practice` entry from `/home`.
6. Select an answer and submit.
7. Confirm feedback, standard answer, analysis, mistake_book indicator where relevant, and final-question state.
8. Return to `/home`, open first `mock_exam` entry.
9. Confirm answer/analysis are not exposed before submit.
10. Select an answer, observe save/submit affordances, and open submit confirmation.
11. Visit `/exam-report` and verify report list/search/status surface.
12. Visit `/mistake-book`, verify filters/actions and `ai_explanation` action.
13. Trigger student-facing AI explanation from mistake_book and confirm no raw prompt, raw model response, raw provider payload, token, password, or secret text is visible.

Expected results:

- Student can complete the authorized entry and learning surfaces through visible UI.
- Practice can show feedback after submission.
- Mock exam does not expose standard answer or analysis before submission.
- Exam report and mistake_book surfaces render.
- Student-facing AI explanation shows safe summary/citation/evidence labels, not sensitive internals.

### Unauthenticated Student Boundary

Preconditions:

- Existing local session can be ended through UI logout.

Steps:

1. Open `/profile`.
2. Use the visible logout control.
3. Visit `/home`.

Expected results:

- Browser redirects to `/login`.
- Login form is visible.

## Browser Verification Plan

- Use the Codex Browser plugin against localhost.
- Capture page URL/title/body-level signal, not raw paper text.
- Avoid recording passwords, session tokens, Authorization headers, generated redeem codes, raw prompts, raw answers, raw model responses, raw provider payloads, full paper text, full教材/OCR text, or customer-like private content.
- Record only redacted labels, booleans, routes, and gap evidence.

## Code Cross-Check Paths

- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/app/(student)/**`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `tests/unit/student-*.test.ts`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `tests/unit/phase-8-student-mistake-book-runtime.test.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`

## Risk Defense

- Documentation/evidence-only change.
- No dependency, package, lockfile, schema, migration, script, or business-code edit.
- No environment file read or edit.
- No staging, production, cloud, real provider, or deployment access.
- No destructive data operation.
- Browser output and evidence must redact credentials, tokens, raw prompts, raw answers, raw model responses, provider payloads, full paper content, and private data.
- Any business-code gap is recorded as a follow-up candidate instead of being fixed in this task.

## Verification Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

Do not record secrets, tokens, Authorization headers, database URLs, real customer data, raw provider payloads, raw prompts, raw answers, raw model responses, complete教材, complete paper/OCR text, plaintext redeem codes, generated passwords, or `.env.local` / `.env.example` contents.
