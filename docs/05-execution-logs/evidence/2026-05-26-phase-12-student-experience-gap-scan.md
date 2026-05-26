# Phase 12 Student Experience Gap Scan Evidence

**Task id:** `phase-12-student-experience-gap-scan`

**Branch:** `codex/phase-12-student-experience-gap-scan`

**Date:** 2026-05-26

## Scope

This task executed the student role slice from the Phase 12 multi-role experience scripts with code inspection plus real localhost browser operation. It records gaps only and does not change runtime/UI/test code.

## Files Checked

Standards, requirements, contracts, state, queue, and prior plans:

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

Student implementation and tests:

- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/app/(student)/home/page.tsx`
- `src/app/(student)/practice/page.tsx`
- `src/app/(student)/mock-exam/page.tsx`
- `src/app/(student)/exam-report/page.tsx`
- `src/app/(student)/mistake-book/page.tsx`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/services/student-flow-runtime.ts`
- `src/server/services/student-mistake-book-runtime.ts`
- `tests/unit/student-home-ui.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `tests/unit/student-mistake-book-ui.test.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `tests/unit/phase-8-student-mistake-book-runtime.test.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`

## Browser Operations

Local dev server:

- Started `npm.cmd run dev -- --hostname 127.0.0.1` through a hidden local process.
- Local URL observed: `http://127.0.0.1:3000`.
- Dev server output named `.env.local` as a loaded environment file but no environment values were read or recorded.

Real browser paths:

| Role                 | Scenario                         | Route(s)                             | Expected                                                                                                                         | Actual                                                                                                                                                                                                             |
| -------------------- | -------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| student              | login/session                    | `/login` -> `/home`                  | Login form accepts local seeded student credentials and redirects to student home.                                               | Passed. Browser reached `/home`; title was `题库系统 - 烟草行业职业技能考试平台`; home showed student paper scopes and learning entry points.                                                                      |
| student              | authorized home                  | `/home`                              | Authorized scopes and paper cards are visible; practice and mock_exam entries use public paper identifiers in query parameters.  | Passed. Visible page showed authorized scope, paper cards, `练习`, `模拟考试`, profile, redeem_code, mistake_book, and exam_report entries.                                                                        |
| student              | practice                         | `/practice?paperPublicId=...`        | Student can select an objective option, submit, and receive feedback/answer/analysis state.                                      | Functionally passed. Browser selected an option and submitted; feedback and final-question state appeared. UI gap found: rich-text HTML content displayed literally instead of rendered or sanitized display text. |
| student              | mock_exam                        | `/mock-exam?paperPublicId=...`       | Before submission, answer/analysis are not exposed; timer/progress/submit confirmation are visible.                              | Passed. Browser pre-submit check did not find answer/analysis labels, found timer/progress/submit affordance, and opened submit confirmation with unanswered count.                                                |
| student              | exam_report                      | `/exam-report`                       | Report list/search/status surface renders.                                                                                       | Passed. Browser saw search input, status filter, completed/scoring style labels, and report entry point.                                                                                                           |
| student              | mistake_book                     | `/mistake-book`                      | Filters, item state, actions, and AI explanation entry render.                                                                   | Passed. Browser saw filters, item summary, favorite/mastery/removal/AI explanation action set.                                                                                                                     |
| student              | ai_explanation from mistake_book | `/mistake-book` action               | Student-facing explanation should show safe summary/citations/evidence labels and no raw prompt/model/provider/secret internals. | Passed within visible UI check. Browser observed explanation/citation/evidence labels and did not observe raw prompt/model/provider/Authorization/Bearer/API key/password/token labels.                            |
| unauthenticated user | student protected route          | logout from `/profile`, then `/home` | Protected student route redirects to login.                                                                                      | Passed. Browser used visible logout control, then `/home` redirected to `/login` and showed login form.                                                                                                            |

No screenshots, browser logs, or notes in this evidence include credentials, tokens, raw answers, raw prompts, raw model responses, provider payloads, or full paper text.

## Code Cross-Check Findings

- Student home runtime uses `/api/v1/student-papers/scopes` and `/api/v1/student-papers?...`, and links to `/practice?paperPublicId=...` / `/mock-exam?paperPublicId=...`.
- Student practice runtime creates/loads practice through `/api/v1/practices`, submits answers through `/api/v1/practices/{publicId}/answers`, and handles `authorization_expired`, `not_found`, `loading`, and `error` states.
- Student mock_exam runtime creates/loads mock exams through `/api/v1/mock-exams`, saves answers through `/api/v1/mock-exams/{publicId}/answers`, submits through `/submit`, and shows submit confirmation with unanswered count.
- Student exam_report runtime lists and opens reports through `/api/v1/exam-reports`.
- Student mistake_book runtime lists and mutates items through `/api/v1/mistake-books/**`, and AI explanation uses `/ai-explanation`.
- Existing unit coverage checks student UI API calls, token non-display, filters, actions, and several edge states.
- Existing e2e coverage includes entry-level student practice/mock navigation, local business flow API assertions, role-based acceptance, and local protected route guard.

## Gap List

| Gap id      | Type                                      | Severity | Role    | Surface                                      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Repro Steps                                                                                                                                     | Suggested Follow-up                                                                                                                                                                                        |
| ----------- | ----------------------------------------- | -------- | ------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| STU-GAP-001 | UI 缺失 / API-contract rendering mismatch | high     | student | practice, mistake_book, likely report detail | Runtime DTO names use `stemRichText`, `content`, `standardAnswerRichText`, and `analysisRichText`, but student UI renders them as plain React text. Browser saw literal HTML tags in practice question/options/feedback. Code references: `src/features/student/practice/StudentPracticePage.tsx:563`, `src/features/student/practice/StudentPracticePage.tsx:599`, `src/features/student/practice/StudentPracticePage.tsx:604`, `src/features/student/practice/StudentPracticePage.tsx:1254`, `src/features/student/mistake-book/StudentMistakeBookPage.tsx:484`, `src/features/student/mistake-book/StudentMistakeBookPage.tsx:525`, `src/features/student/mistake-book/StudentMistakeBookPage.tsx:529`. | Login as student, open `/home`, enter first practice, submit the first objective question. Observe literal markup around stem/options/feedback. | Add a dedicated safe rich-text rendering task for student practice/mock/report/mistake_book, including sanitizer or trusted-content boundary, tests for rich text display, and redaction review.           |
| STU-GAP-002 | UI 缺失 / UX noise                        | low      | student | practice progress card                       | Practice page displays `practice.publicId` directly in the progress metadata card. It is not an auto-increment id, but it is implementation-detail text with little learner value. Code reference: `src/features/student/practice/StudentPracticePage.tsx:1231`.                                                                                                                                                                                                                                                                                                                                                                                                                                           | Login as student, open `/practice?paperPublicId=...`; inspect progress card.                                                                    | Consider replacing the visible public id with learner-useful metadata such as mode/session label, started time, or attempt count.                                                                          |
| STU-GAP-003 | 测试缺失                                  | medium   | student | browser e2e                                  | `e2e/student-practice-mock-entry.spec.ts` checks login, route entry, and button visibility, but does not submit a practice answer, verify no pre-submit answer exposure in mock_exam, open exam_report/mistake_book, or assert rich-text markup is not displayed literally. Broader e2e/API tests cover parts of the runtime, but this specific browser UX regression was not caught.                                                                                                                                                                                                                                                                                                                      | Review `e2e/student-practice-mock-entry.spec.ts`; compare with this browser run.                                                                | Add a focused student browser UX e2e that submits one practice answer, checks rendered rich text, verifies mock pre-submit secrecy, and opens report/mistake_book/AI explanation with redacted assertions. |

## Non-Gap Passed Checks

- Login/session: local browser login and redirect passed.
- Route guard: logout then `/home` redirected to `/login`.
- Mock exam pre-submit answer/analysis secrecy: passed in visible UI.
- Exam report list/search/status surface: passed.
- Mistake_book filters/actions: passed.
- Student-facing AI explanation visible redaction check: passed for raw prompt/model/provider/secret labels.
- No numeric auto-increment database id was observed in external URL paths. Query paths used public identifiers.

## Command Results

Feature branch commit:

- `4cf65d9 docs(agent): add student experience gap scan`

Merge commit before post-merge evidence amend:

- `b1098eb merge: add phase 12 student experience gap scan`

- `npm.cmd run test:unit`
  - Result: pass.
  - Summary: 130 test files passed, 519 tests passed.
- `npm.cmd run test:e2e`
  - Result: pass.
  - Summary: 15 Playwright tests passed, including local business flow, role-based acceptance student positive/negative flows, and student practice/mock entry.
- `npm.cmd run build`
  - Result: pass.
  - Summary: Next.js production build compiled successfully, TypeScript completed, and 50 static pages were generated. Build output named `.env.local` as an environment file but no environment value was read or recorded.
- `npm.cmd run lint`
  - First sandbox result: failed with `EPERM` while opening the local `node_modules` eslint executable.
  - Escalated rerun result: pass.
- `npm.cmd run typecheck`
  - First sandbox result: failed with `EPERM` while opening the local `node_modules` TypeScript executable.
  - Escalated rerun result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
  - Summary: banned business terms absent, risky generic terms absent, API route folders kebab-case/public-id safe, DTO fields camelCase.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory.
  - Summary: script reported the current docs/state/evidence files as unstaged/untracked before commit.
- `git diff --check`
  - Result: pass.
- `npm.cmd run format:check`
  - First sandbox result: failed with `EPERM` while opening the local Prettier executable.
  - Targeted Prettier write was run only on this task's docs/state files.
  - Escalated rerun result: pass; all matched files use Prettier code style.

Post-merge master verification:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass on `master`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass on `master`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`
  - Result: pass inventory on `master`.
  - Summary: `master` was ahead of `origin/master` by 2 commits before push; changed files were limited to project state, task queue, this task plan, and this evidence.
- `git diff --check`
  - Result: pass on `master`.
- `npm.cmd run format:check`
  - Result: pass on `master`.

## Runtime/UI/Test/Docs Touch Summary

- Runtime source touched: no.
- UI source touched: no.
- Tests touched: no.
- Docs/state/queue touched: yes.
- Dependency manifests or lockfiles touched: no.
- Database schema/migration touched: no.
- `.env.local` / `.env.example` read or touched: no.
- Staging/prod/cloud/provider/deploy touched: no.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, or copied.
- No staging, production, cloud, or real provider was contacted.
- No deployment or PR was created.
- No destructive data operation was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full教材, OCR full text, or private customer-like data is recorded in this evidence.

## 品味合规自检 Checklist

- [x] Scope stayed documentation/evidence-only; no business code was changed without a queue item.
- [x] Naming followed glossary terms: `student`, `practice`, `mock_exam`, `mistake_book`, `ai_explanation`, `paperPublicId`.
- [x] API references use `/api/v1/` and public identifiers only.
- [x] No API JSON `snake_case` payload was introduced.
- [x] No empty string was introduced as a replacement for `null`.
- [x] No auto-increment database `id` was exposed in evidence or URLs.
- [x] No hardcoded UI color/spacing/runtime code was added.
- [x] No secret, token, raw prompt, raw answer, raw model output, provider payload, full paper, full教材, or environment value was recorded.
- [x] Gaps were recorded for follow-up instead of being fixed outside the claimed task.
