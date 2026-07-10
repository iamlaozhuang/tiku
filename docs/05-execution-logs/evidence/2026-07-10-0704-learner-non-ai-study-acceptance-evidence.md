# 2026-07-10 0704 Learner Non-AI Study Acceptance Evidence

## Scope

- taskId: `0704-learner-non-ai-study-acceptance-2026-07-10`
- branch: `codex/0704-learner-non-ai-study-acceptance`
- mode: validation-only source/test acceptance
- target: ordinary learner `practice`, `mock_exam`, report, objective `mistake_book`, resume/continue, invalidation, and baseline standard/advanced access boundaries

## Readiness

- private index metadata preflight: pass
- core role labels discovered: 9
- credential values output: none
- browser runtime: not executed
- direct product route read/write: not executed
- direct database connection: not executed
- Provider call: not executed
- staging/prod/deploy/env/secret action: not executed
- dependency/package/lockfile change: none
- source/test/schema/migration/seed change: none

## Source Inspection

Validated source and tests only. No localhost login, screenshot, raw DOM, DB row, Provider payload, raw prompt/output, full question/paper/material/resource/chunk, employee raw answer, credential, token, cookie, session, env value, plaintext redeem code, or internal id was recorded.

Sanitized static marker counts:

- source files inspected: 30
- targeted test files inspected: 32
- learning core markers: 1578
- resume/boundary markers: 1128
- material/paper-section structure markers: 77
- answer-safety markers: 478
- invalidation markers: 253
- edition/auth markers: 317
- privacy/redaction markers: 486

Coverage conclusion:

- ordinary learner `practice`, `mock_exam`, `exam_report`, `mistake_book`, and student paper scope paths are represented across service, route, mapper, validator, runtime, and UI tests
- resume, active attempt, stale/terminated attempt, and duplicate entry categories are covered at contract/runtime level
- material, `paper_section`, and `question_group` structures are covered without recording full content in evidence
- answer/analysis visibility is covered by route, mapper, report, mistake-book, and mock-exam UI/runtime tests without exposing full answer data here
- archived, disabled, expired, and authorization-loss categories are represented in invalidation tests
- standard and advanced access markers are present without changing baseline non-AI learning availability
- prior localhost API smoke `2026-07-10-0704-non-ai-learning-smoke-evidence.md` remains the latest direct localhost route evidence for `student_paper_scopes`, `student_paper_scoped_list`, `mistake_book_list`, and `exam_report_list`; this task did not rerun direct product route reads because the current task boundary blocks product route read/write

## Targeted Tests

Command:

```powershell
corepack pnpm@10.26.1 vitest run src/server/models/student-experience.test.ts src/server/services/student-paper-service.test.ts src/server/services/student-paper-route.test.ts src/server/mappers/student-paper-mapper.test.ts src/server/validators/student-paper.test.ts src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts src/server/mappers/practice-mapper.test.ts src/server/validators/practice.test.ts src/server/services/mock-exam-service.test.ts src/server/services/mock-exam-route.test.ts src/server/mappers/mock-exam-mapper.test.ts src/server/validators/mock-exam.test.ts src/server/services/exam-report-service.test.ts src/server/services/exam-report-route.test.ts src/server/mappers/exam-report-mapper.test.ts src/server/validators/exam-report.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts src/server/repositories/mistake-book-repository.test.ts src/server/mappers/mistake-book-mapper.test.ts src/server/validators/mistake-book.test.ts src/server/services/authorization-paper-mock-exam-access-context-service.test.ts src/server/services/paper-mock-exam-scope-service.test.ts src/server/validators/paper-mock-exam-scope.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/local-business-flow-mock-exam-isolation.test.ts tests/unit/phase-7-student-flow-runtime-smoke.test.ts
```

Result:

- test files: 32 passed
- tests: 221 passed

## Closeout Gates

- `corepack pnpm@10.26.1 run lint`: pass
- `corepack pnpm@10.26.1 run typecheck`: pass
- `git diff --check`: pass
- Module Run v2 pre-commit hardening: pass
- Module Run v2 pre-push readiness: pass with remote-ahead check skipped per task policy
