# 2026-07-10 0704 Non-AI Learning Smoke Plan

## Task

- Task id: `0704-non-ai-learning-smoke-2026-07-10`
- Branch: `codex/0704-non-ai-learning-smoke`
- Mode: validation-only localhost acceptance plus targeted contract/runtime smoke.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-8-standard-personal-learning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-practice-runtime-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-mock-exam-report-runtime-completion.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-mistake-book-runtime.md`
- Targeted student paper, practice, `mock_exam`, `exam_report`, and `mistake_book` route/service/mapper/validator/UI tests.
- Private lookup source read in-memory only:
  `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
  and its canonical catalog.

## Acceptance Focus

- Authorized personal and employee learners can enter ordinary `practice` and `mock_exam` surfaces.
- Answer, submit, result/report, objective `mistake_book`, and resume/continue categories work at status level.
- Standard and advanced editions keep baseline non-AI learning access when their authorization scope is valid.
- Authorization loss, paper takedown, terminated/inactive practice, and terminated/inactive `mock_exam` produce safe status categories.
- UI and API tests do not expose internal ids, raw answer content, full stems, full standard answers, full analyses, or report snapshots in evidence.

## Execution Steps

1. Confirm branch, origin alignment, and clean working tree.
2. Read required docs and targeted code/test entry points.
3. Run redacted readiness preflight for all 9 core roles.
4. Run targeted contract/runtime/UI tests for student papers, ordinary practice, `mock_exam`, `exam_report`, `mistake_book`, and resume/termination boundaries.
5. Run localhost API smoke for in-scope learner role labels, recording route labels and status categories only.
6. Record only role labels, route labels, status categories, command status, and aggregate test counts.
7. Perform adversarial review against permissions, authorization scope, sensitive evidence, standard/advanced editions, and employee/admin separation.
8. Update roadmap, coverage ledger, state, queue, evidence, and audit.
9. Run scoped formatting, `git diff --check`, lint, typecheck, and Module Run v2 gates.
10. Commit, fast-forward merge to `master`, rerun master gates, push `origin/master`, delete the short branch, and confirm clean/aligned.

## Blocked Actions

- No source or test edits.
- No package or lockfile changes.
- No schema, migration, seed, or direct DB operation.
- No destructive DB operation.
- No Provider execution.
- No screenshot, raw DOM, trace, cookie, token, session, localStorage, Authorization header, env, DB URL, raw row, internal id, raw prompt, raw AI output, full question, full paper, full material, full analysis, full standard answer, full report snapshot, employee raw answer, private fixture value, or plaintext `redeem_code` in evidence.
- No staging, production, deploy, payment, external service, PR, force push, or Cost Calibration.

## Targeted Validation Commands

```powershell
corepack pnpm@10.26.1 exec vitest run src/server/models/student-experience.test.ts src/server/services/student-paper-service.test.ts src/server/services/student-paper-route.test.ts src/server/mappers/student-paper-mapper.test.ts src/server/validators/student-paper.test.ts src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts src/server/mappers/practice-mapper.test.ts src/server/validators/practice.test.ts src/server/services/mock-exam-service.test.ts src/server/services/mock-exam-route.test.ts src/server/mappers/mock-exam-mapper.test.ts src/server/validators/mock-exam.test.ts src/server/services/exam-report-service.test.ts src/server/services/exam-report-route.test.ts src/server/mappers/exam-report-mapper.test.ts src/server/validators/exam-report.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts src/server/repositories/mistake-book-repository.test.ts src/server/mappers/mistake-book-mapper.test.ts src/server/validators/mistake-book.test.ts src/server/services/authorization-paper-mock-exam-access-context-service.test.ts src/server/services/paper-mock-exam-scope-service.test.ts src/server/validators/paper-mock-exam-scope.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/local-business-flow-mock-exam-isolation.test.ts
corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-07-10-0704-non-ai-learning-smoke.md docs/05-execution-logs/evidence/2026-07-10-0704-non-ai-learning-smoke-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-non-ai-learning-smoke-audit.md docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md
git diff --check
corepack pnpm@10.26.1 run lint
corepack pnpm@10.26.1 run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-non-ai-learning-smoke-2026-07-10
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-non-ai-learning-smoke-2026-07-10 -SkipRemoteAheadCheck
```
