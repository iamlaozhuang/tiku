# Evidence: phase-9-student-experience-ui-completion

## Metadata

- Task id: `phase-9-student-experience-ui-completion`
- Branch: `codex/phase-9-student-experience-ui-completion`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`

## Scope

Allowed files followed:

- task plan and evidence
- `src/app/(student)/**`
- `src/features/student/**`
- `tests/unit/**`
- `e2e/**`
- agent state files

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Recovery And Readiness

- Started from `master` at `b973fac docs(agent): record student mock exam report push closeout`.
- Created branch: `codex/phase-9-student-experience-ui-completion`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-experience-ui-completion`: pass.
- Security review: not triggered by task metadata.
- Dependency approval: not triggered by task metadata; no dependency change.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`
  - Failed because student `home`, `practice`, `mock_exam`, and `exam_report` UI defaulted to fixtures instead of REST runtime.
  - Failed because `StudentExamReportListPage` was not exported.
- GREEN: implemented runtime API wiring and mock exam record-list UI.
- Focused GREEN: same focused command passed with `3` files and `20` tests.
- Regression: `npm.cmd run test:unit` passed with `99` files and `357` tests.

## Implementation Summary

- Added a student runtime API helper for local session token reads, bearer headers, standard response parsing, and unauthorized response checks.
- Changed student route defaults so `home`, `practice`, `mock_exam`, and `exam_report` use `/api/v1` runtime instead of fixture props.
- Preserved fixture props for deterministic component tests and non-runtime states.
- Wired student home to load authorization scopes and paper lists, including compatibility with the current runtime array response shape for `student-papers`.
- Wired practice start/resume and answer submission to `POST /api/v1/practices` and `POST /api/v1/practices/{publicId}/answers`.
- Wired mock exam start/detail, answer save, and submit to `/api/v1/mock-exams`.
- Wired exam report detail to `GET /api/v1/exam-reports/{publicId}`.
- Added `StudentExamReportListPage` for mock exam records at `/exam-report`, with search and status filtering for `scoring`, `scoring_partial_failed`, `completed`, and `terminated`.
- Kept mock exam answering from rendering correctness, standard answers, analysis, AI hints, or AI explanations before submit.
- Kept mistake book runtime boundary unchanged; it was already API-backed before this task.
- Updated E2E to wait for `/exam-report` list loading to settle before navigating away, avoiding false `net::ERR_ABORTED` failures.

## Debug Notes

- First E2E failure showed `学员首页加载失败`.
  - Root cause: the current `/api/v1/student-papers/scopes` and `/api/v1/student-papers` runtime returns array payloads, while the initial UI wiring expected `{ scopes }` and `{ papers }`.
  - Fix: normalize both current array payloads and wrapped DTO payloads in the UI without changing server routes outside the task boundary.
- Second E2E failure showed a captured `GET /api/v1/exam-reports?page=1&pageSize=20 net::ERR_ABORTED`.
  - Root cause: the E2E test navigated away immediately after asserting body was non-empty, before the new record-list request settled.
  - Fix: wait until the record-list loading text disappears before continuing the flow.

## Boundary Notes

- No server, auth, authorization, database schema, migration, package, lockfile, `.env.example`, external provider, production resource, or real AI provider change.
- AI scoring, AI explanation, AI hint, learning suggestion retry behavior, and RAG citation completeness remain deferred to later Phase 9 AI/RAG tasks.
- The student UI relies on the existing local dev session-token storage pattern already used by profile, redeem, and mistake book pages; it does not render the token.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-experience-ui-completion
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-experience-ui-completion`: pass.
- Focused RED command: failed as expected with fixture-backed UI/runtime-list export gaps.
- Focused GREEN command: pass, `3` files and `20` tests passed.
- `npm.cmd run typecheck`: initial sandbox run failed with `EPERM` reading the local TypeScript entrypoint; escalated re-run exposed nullability errors, then passed after explicit non-null guards.
- Prettier: sandbox run failed with `EPERM` reading the local Prettier entrypoint; escalated re-run formatted only task-scoped modified files and passed.
- `npm.cmd run test:unit`: pass, `99` files and `357` tests passed.
- First final `Invoke-QualityGate.ps1`: failed only on `format:check` for `e2e/local-business-flow.spec.ts`.
- Final `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `99` files and `357` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js compiled successfully and generated dynamic student routes for `/practice`, `/mock-exam`, and `/exam-report`.
- First `npm.cmd run test:e2e`: failed because student home expected wrapped paper payloads.
- Second `npm.cmd run test:e2e`: failed because `/exam-report` fetch was aborted by immediate navigation.
- Final `npm.cmd run test:e2e`: pass, `2` tests passed.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files are limited to task allowed files and branch has no upstream.

## Git Closeout

- implementationCommit: `7fb7a0e feat(student): complete student experience ui runtime`.
- merge: `e12e8c3 merge: phase 9 student experience ui completion`.
- postMergeValidation:
  - `Invoke-QualityGate.ps1`: pass on `master`.
    - lint: pass.
    - typecheck: pass.
    - test:unit: pass, `99` files and `357` tests passed.
    - format:check: pass.
  - `npm.cmd run build`: pass on `master`.
  - `npm.cmd run test:e2e`: pass on `master`, `2` tests passed.
  - `Test-NamingConventions.ps1`: pass on `master`.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory on `master`; branch ahead of `origin/master` by implementation and merge commits.
- push:
  - `git push origin master`: pass; `origin/master` advanced from `b973fac` to `99f972c`.
  - push closeout recorded in this evidence update.
