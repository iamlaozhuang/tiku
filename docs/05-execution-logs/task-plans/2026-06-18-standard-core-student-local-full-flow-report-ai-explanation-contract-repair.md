# Task Plan: standard-core-student-local-full-flow-report-ai-explanation-contract-repair

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-validation-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-contract-repair.md`
- Existing source, focused unit tests, and approved read-only e2e specs for the standard student core flow.

## Scope

- Task id: `standard-core-student-local-full-flow-report-ai-explanation-contract-repair`
- Target chain: `standard-core-student`
- Use cases: `UC-STD-ACCOUNT-SESSION`, `UC-STD-PERSONAL-AUTH-REDEEM`, `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`, `UC-STD-REPORT-MISTAKE-BOOK`
- Repair only the fresh blockers from `standard-core-student-local-full-flow-validation-rerun`:
  - `POST /api/v1/exam-reports` must return a standard payload whose `data.examReport.publicId` is present after creation.
  - `POST /api/v1/mistake-books/{publicId}/ai-explanation` must return an OK standard payload in local runtime.

## Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-standard-core-student-local-full-flow-report-ai-explanation-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-report-ai-explanation-contract-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-standard-core-student-local-full-flow-report-ai-explanation-contract-repair.md`
- Explicit student-experience façade, exam report, and mistake-book AI explanation route/service/contract/mapper/repository files listed in `task-queue.yaml`.
- Focused unit tests listed in `task-queue.yaml`.

## Blocked Files And Gates

- No e2e spec edits.
- No `.env*`, dependency, package/lockfile, schema/drizzle/migration, provider/model, staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, or Cost Calibration Gate work.
- No `experience_closed` claim from this repair. Closure remains blocked until a separate fresh validation pass and closure readiness audit.
- No `master` checkout, merge, push, or short-branch cleanup.

## Implementation Plan

1. Inspect the existing exam report route/service/mapper and mistake-book AI explanation route/service/runtime flow against the two failing e2e assertions.
2. Add focused RED tests before production edits:
   - student-experience façade delegates exam report creation to the legacy deterministic runtime so response includes `data.examReport.publicId`;
   - student-experience façade delegates exam report learning-suggestion retry to the legacy deterministic runtime;
   - student-experience façade delegates mistake-book AI explanation to the legacy deterministic runtime so local route returns OK and standard `{ code, message, data }` payload.
3. Implement the smallest source changes at the route/service/runtime boundary that satisfy those tests without provider calls, schema changes, or e2e edits.
4. Run focused unit gates, `test:e2e -- --list`, lint, typecheck, diff check, and Module Run v2 readiness gates.
5. Rerun the scoped local full-flow validation command against the three approved existing e2e specs.
6. If the rerun passes, seed/enter `standard-core-student-experience-closure-readiness-audit`. If it fails, record blocked evidence with the smallest next repair candidate.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts src/server/services/exam-report-route.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
npm.cmd run test:e2e -- --list
npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-report-ai-explanation-contract-repair
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-report-ai-explanation-contract-repair
```

## Risks

- The exam report creation route may already create the report but return a shape mismatch; fix the response contract, not the e2e assertion.
- The AI explanation route may be failing because local fixture data lacks a persisted mistake-book row; prefer route/runtime contract repair over broad seed or schema changes unless evidence proves otherwise.
- Provider/model calls remain blocked, so local AI explanation must use existing deterministic local runtime behavior.
