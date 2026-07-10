# 2026-07-10 0704 Non-AI Learning Smoke Evidence

## Scope

- Task id: `0704-non-ai-learning-smoke-2026-07-10`
- Branch: `codex/0704-non-ai-learning-smoke`
- Mode: validation-only localhost acceptance with targeted contract/runtime/UI smoke.
- Source/test/package/schema/db/provider/deploy changes: none.

## Redaction Boundary

Evidence records only role labels, authorization context categories, route labels, status categories, command status, and
aggregate test counts. It does not record credential material, cookies, tokens, sessions, localStorage, Authorization
headers, env values, DB URLs, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full stems, full
answers, full analyses, full paper or material content, report snapshots, employee raw answers, screenshots, traces, raw
DOM, private fixture values, or plaintext `redeem_code` values.

## Read Gate

Required project, requirement, architecture, roadmap, coverage, handoff, historical evidence, targeted code, and targeted
test entry points were read before execution. The private credential index and canonical catalog under
`D:\tiku-local-private\acceptance` were read in memory only.

## Redacted Readiness Preflight

| Role label                  | Authorization context category  | Status category       |
| --------------------------- | ------------------------------- | --------------------- |
| `super_admin`               | `admin_session_no_learner_auth` | `ready_0704_verified` |
| `ops_admin`                 | `ops_admin_only`                | `ready_0704_verified` |
| `content_admin`             | `content_admin_only`            | `ready_0704_verified` |
| `personal_standard_student` | `standard_only_context`         | `ready_0704_verified` |
| `personal_advanced_student` | `personal_advanced_ai_context`  | `ready_0704_verified` |
| `org_standard_admin`        | `org_standard_admin_context`    | `ready_0704_verified` |
| `org_advanced_admin`        | `org_advanced_admin_context`    | `ready_0704_verified` |
| `org_standard_employee`     | `standard_only_context`         | `ready_0704_verified` |
| `org_advanced_employee`     | `org_advanced_ai_context`       | `ready_0704_verified` |

Result: pass, all 9 core roles ready.

## Targeted Contract Runtime UI Smoke

Command:

```powershell
corepack pnpm@10.26.1 exec vitest run src/server/models/student-experience.test.ts src/server/services/student-paper-service.test.ts src/server/services/student-paper-route.test.ts src/server/mappers/student-paper-mapper.test.ts src/server/validators/student-paper.test.ts src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts src/server/mappers/practice-mapper.test.ts src/server/validators/practice.test.ts src/server/services/mock-exam-service.test.ts src/server/services/mock-exam-route.test.ts src/server/mappers/mock-exam-mapper.test.ts src/server/validators/mock-exam.test.ts src/server/services/exam-report-service.test.ts src/server/services/exam-report-route.test.ts src/server/mappers/exam-report-mapper.test.ts src/server/validators/exam-report.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts src/server/repositories/mistake-book-repository.test.ts src/server/mappers/mistake-book-mapper.test.ts src/server/validators/mistake-book.test.ts src/server/services/authorization-paper-mock-exam-access-context-service.test.ts src/server/services/paper-mock-exam-scope-service.test.ts src/server/validators/paper-mock-exam-scope.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/local-business-flow-mock-exam-isolation.test.ts
```

Result: pass, 30 files, 204 tests.

## Localhost API Smoke

| Role label                  | Route label                 | Status category                           | Expectation |
| --------------------------- | --------------------------- | ----------------------------------------- | ----------- |
| `personal_standard_student` | `student_paper_scopes`      | `allowed_non_empty_scope_set`             | pass        |
| `personal_standard_student` | `student_paper_scoped_list` | `allowed_scoped_learning_entry_available` | pass        |
| `personal_standard_student` | `mistake_book_list`         | `allowed_success_or_empty_envelope`       | pass        |
| `personal_standard_student` | `exam_report_list`          | `allowed_success_or_empty_envelope`       | pass        |
| `personal_advanced_student` | `student_paper_scopes`      | `allowed_non_empty_scope_set`             | pass        |
| `personal_advanced_student` | `student_paper_scoped_list` | `allowed_scoped_learning_entry_available` | pass        |
| `personal_advanced_student` | `mistake_book_list`         | `allowed_success_or_empty_envelope`       | pass        |
| `personal_advanced_student` | `exam_report_list`          | `allowed_success_or_empty_envelope`       | pass        |
| `org_standard_employee`     | `student_paper_scopes`      | `allowed_non_empty_scope_set`             | pass        |
| `org_standard_employee`     | `student_paper_scoped_list` | `allowed_scoped_learning_entry_available` | pass        |
| `org_standard_employee`     | `mistake_book_list`         | `allowed_success_or_empty_envelope`       | pass        |
| `org_standard_employee`     | `exam_report_list`          | `allowed_success_or_empty_envelope`       | pass        |
| `org_advanced_employee`     | `student_paper_scopes`      | `allowed_non_empty_scope_set`             | pass        |
| `org_advanced_employee`     | `student_paper_scoped_list` | `allowed_scoped_learning_entry_available` | pass        |
| `org_advanced_employee`     | `mistake_book_list`         | `allowed_success_or_empty_envelope`       | pass        |
| `org_advanced_employee`     | `exam_report_list`          | `allowed_success_or_empty_envelope`       | pass        |

Result: pass, 16 route checks.

## Gate Status

| Gate                               | Status |
| ---------------------------------- | ------ |
| Redacted readiness preflight       | pass   |
| Targeted contract/runtime/UI smoke | pass   |
| Localhost API smoke                | pass   |
| Scoped Prettier write              | pass   |
| Scoped Prettier check              | pass   |
| `git diff --check`                 | pass   |
| Blocked path diff check            | pass   |
| `lint`                             | pass   |
| `typecheck`                        | pass   |
| Module Run v2 pre-commit hardening | pass   |
| Module Run v2 pre-push readiness   | pass   |

## Result

Stage 3 acceptance is ready for closeout pending static gates. The targeted evidence supports ordinary practice,
`mock_exam`, `exam_report`, objective `mistake_book`, resume/continue, and termination-status coverage without rerunning
AI generation or recording sensitive learning content.
