# 0704 Localhost UI Polish Evidence

## Scope

- Task ID: `0704-localhost-ui-polish-2026-07-10`
- Branch: `codex/0704-localhost-ui-polish`
- Runtime target: 0704DB-backed localhost only.
- Preview preparation: paused.
- Provider-enabled behavior: not executed.
- Staging/prod/deploy/env/secret/Cost Calibration: not executed.
- Screenshots/raw DOM/traces/videos: not captured.

## Redaction Boundary

This evidence records role labels, route labels, status categories, problem categories, fix summaries, command names, and test counts only. It does not record credentials, session values, cookies, tokens, localStorage, Authorization headers, DB URLs, env values, raw DB rows, internal numeric IDs, plaintext `redeem_code`, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, traces, or videos.

## Localhost Context

| Check                  | Result                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| Git base               | `origin/master@889c586667509529ef0169ba3382fd2b74d7590a`            |
| Local service          | reused existing localhost dev server                                |
| Health route           | `/login` returned HTTP 200                                          |
| Private credential use | private role catalog used only in memory for localhost login probes |
| Secret output          | none recorded                                                       |
| Provider execution     | blocked / not executed                                              |

## Read-Only UI Assessment Summary

| Role label                | Route group                                                    | Status category           | Problem category                                                                            |
| ------------------------- | -------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| personal_standard_student | learner workbench, AI training, practice, mistake book         | rendered                  | learner desktop first screen was too narrow                                                 |
| personal_advanced_student | learner workbench, AI training, practice, mistake book, report | rendered                  | learner desktop first screen was too narrow                                                 |
| personal_standard_student | direct practice entry without selected paper                   | error/unavailable         | missing actionable empty state                                                              |
| personal_advanced_student | direct mock exam entry without selected paper/mock             | long loading/unavailable  | missing actionable empty state                                                              |
| personal_advanced_student | mock exam report weakness list                                 | rendered                  | technical identifier-like label exposed in learner-facing copy                              |
| ops_admin                 | organizations, redeem code, AI audit logs                      | mixed rendered/auth/error | cookie-backed admin session path needed parity with existing content-admin runtime behavior |
| org_admin / employee      | organization training-related pages                            | error state               | retained as data/API route issue outside this focused UI polish                             |

Initial automated route pass: 22 route checks; 16 rendered, 2 unavailable/empty, 3 error, 1 loading.

Post-fix focused route/component checks: learner desktop narrow findings were removed from the main learner home, AI training, mistake book, practice, and mock report surfaces; direct practice/mock entry now shows actionable empty states; ops cookie-backed session behavior is covered by focused unit tests.

## Requirement Mapping Result

| Requirement source                          | Mapping result                                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Full-role UI/UX implementation entry        | learner and backend first-screen UI polish stays within source UI implementation scope                                  |
| Learner core and advanced UI baselines      | practice/mock direct entry, report wording, AI training, mistake book, and mobile-first learner surfaces remain covered |
| Admin shell and ops UI baselines            | ops organization, redeem code, and AI audit log pages retain workspace boundary and session semantics                   |
| Advanced edition authorization requirements | standard/advanced boundaries are unchanged; no advanced capability is granted by the UI fixes                           |
| Provider gate hardening predecessor         | Provider execution remains blocked and no Provider-enabled behavior is introduced                                       |

## Fix Summary

| Area                      | Files                                                                                                 | Fix summary                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Learner desktop layout    | `StudentHomePage`, `StudentPersonalAiGenerationPage`, `StudentPracticePage`, `StudentMistakeBookPage` | widened main learner content on desktop while preserving mobile-first layout                                                                           |
| Practice entry state      | `StudentPracticePage`                                                                                 | stopped default runtime paper fallback; direct entry without a selected paper now shows an actionable empty state and avoids runtime POST              |
| Mock exam entry state     | `StudentMockExamReportPage`                                                                           | stopped default runtime mock fallback; direct entry without a selected paper/mock now shows an actionable empty state and avoids default runtime fetch |
| Learner report wording    | `StudentMockExamReportPage`                                                                           | replaced technical weakness labels and hid mistake-book public identifiers from learner-facing report copy                                             |
| Ops cookie-backed session | `AdminOrgAuthRedeemPage`, `AdminAiAuditLogOpsBaseline`                                                | aligned ops runtime fetches with existing cookie-backed session marker and explicit same-origin requests                                               |
| Unit coverage             | learner and ops UI tests                                                                              | added regression checks for no-selected-paper states, raw identifier suppression, and ops cookie-backed sessions                                       |

## Validation Commands

| Command                                                                                                                                                                                                                                                                                                                                                                                         | Result                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                                                                                                                                                                                                                                                   | RED pass as expected before implementation: 4 targeted assertions failed |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                                                                                                                                                                                                                                                   | pass: 2 files, 52 tests                                                  |
| `corepack pnpm@10.26.1 exec vitest run src/components/StudentAppLayout/StudentAppLayout.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-home-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                               | pass: 6 files, 88 tests                                                  |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts src/components/StudentAppLayout/StudentAppLayout.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-home-ui.test.ts tests/unit/student-mistake-book-ui.test.ts` | pass: 7 files, 95 tests                                                  |
| `corepack pnpm@10.26.1 run lint`                                                                                                                                                                                                                                                                                                                                                                | pass                                                                     |
| `corepack pnpm@10.26.1 run typecheck`                                                                                                                                                                                                                                                                                                                                                           | pass                                                                     |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                              | pass                                                                     |
| Module Run v2 pre-commit hardening                                                                                                                                                                                                                                                                                                                                                              | pass                                                                     |
| Module Run v2 pre-push readiness                                                                                                                                                                                                                                                                                                                                                                | pass                                                                     |

## Non-Claims

- This task only claims localhost UI optimization for the focused surfaces above.
- It does not claim staging readiness, production readiness, final release readiness, Provider readiness, or Cost Calibration readiness.
