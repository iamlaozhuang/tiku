# Task Plan: standard-core-student-local-full-flow-contract-repair

## Required Reading

- AGENTS.md
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-validation.md`
- Existing source, focused unit tests, and approved read-only e2e specs for the standard student core flow.

## Scope

- Task id: `standard-core-student-local-full-flow-contract-repair`
- Target chain: `standard-core-student`
- Use cases: `UC-STD-ACCOUNT-SESSION`, `UC-STD-PERSONAL-AUTH-REDEEM`, `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`, `UC-STD-REPORT-MISTAKE-BOOK`
- Repair the smallest product contract gap that blocked fresh local full-flow validation:
  - student runtime API/session bridge still assumes `tiku.localSessionToken`;
  - local practice runtime did not expose the `practice-resume-choice` branch with current local data.

## Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-standard-core-student-local-full-flow-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-contract-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-standard-core-student-local-full-flow-contract-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `src/features/student/studentRuntimeApi.ts`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/student-flow-runtime.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `tests/unit/student-mistake-book-ui.test.ts`

## Blocked Files And Gates

- No e2e spec edits.
- No `.env*`, dependency, package/lockfile, schema/drizzle/migration, provider/model, staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, or Cost Calibration Gate work.
- No `experience_closed` claim from this repair. Closure remains blocked until a separate fresh validation pass and closure readiness audit.

## Implementation Plan

1. Reproduce the two contract gaps with focused unit tests where possible.
2. Add a localhost-and-automation-only student session bridge so the existing local API full-flow spec can read the login
   token, while normal browser/jsdom login keeps the no bearer-token-in-browser-storage contract.
3. Add deterministic local dev seed resume data for the seeded student practice branch instead of making the UI display a
   resume choice for brand-new practices without progress.
4. Run focused unit tests, e2e list, lint, typecheck, diff check, and Module Run v2 readiness gates.
5. If the repair passes, close this task with evidence and seed/rerun the local full-flow validation task. If it fails, record blocked evidence and the smallest next repair.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/db/dev-seed.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-login-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
npm.cmd run test:e2e -- --list
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-contract-repair
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-contract-repair
```

## Risks

- The existing `local-business-flow` spec still reads `tiku.localSessionToken`; the repair must avoid broadening token exposure in normal login behavior.
- Some student pages still use token-backed helpers. Prefer shared runtime helper changes over repeated page-local hacks.
- Fresh full-flow runtime validation is intentionally deferred to the next validation task.
