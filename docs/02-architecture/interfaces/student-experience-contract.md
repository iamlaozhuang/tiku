# Student Experience Contract

## Status

Approved for Phase 4 implementation planning.

## Purpose

Define the Phase 4 contract for `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, student-facing paper access, `authorization`, and published paper snapshots before implementation starts.

This document is a contract and approval artifact. It does not create schema, generate a Drizzle migration, add a dependency, or expose a runtime API by itself.

## Sources

- `AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-planning.md`
- `docs/04-agent-system/sop/security-review-gate.md`

## Non-Goals

- No dependency introduction.
- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No `src/**` implementation in this task.
- No `src/db/schema/**` implementation in this task.
- No `drizzle/**` migration generation in this task.
- No payment, formal exam, certificate, ranking, or enterprise analytics workflow.
- No AI model invocation in Phase 4; `ai_scoring`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `citation`, and RAG retrieval are Phase 5 concerns.
- No WeChat login integration in MVP Phase 4.

## Naming Rules

- Database tables and columns use `snake_case`.
- REST paths use `/api/v1/` and kebab-case plural nouns.
- API JSON fields use `camelCase`.
- External URLs use `public_id` in database rows and `publicId` in API JSON.
- External URLs must never expose auto-increment `id`.
- Use `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`.
- Use `authorization`, not forbidden alternatives.
- Use `analysis` for teacher-authored analysis.
- Use `standard_answer` for standard answers.
- Use `paper_section` and `question_option` when referencing paper structures from snapshots.

## Contract Boundary

Phase 4 consumes the Phase 3 published paper model:

- Student workflows must read published `paper` content through immutable paper snapshots.
- New `practice` and `mock_exam` sessions cannot start from `draft` or `archived` paper.
- New student sessions must not read mutable source `question`, `question_option`, `material`, `paper_section`, `question_group`, `scoring_point`, `analysis`, or `standard_answer` rows directly for display.
- Historical `answer_record` and `exam_report` rows must preserve the paper and answer snapshots needed to render history consistently.
- `paper_snapshot` means the immutable student-visible representation derived from Phase 3 published paper snapshots.

## Domain Invariants

### Authorization

- Every student-facing API requires authenticated `student` context.
- Effective access is the union of valid `personal_auth` and `org_auth`.
- Effective `authorization` is filtered by `profession`, `level`, validity window, and active status.
- Student paper listing only returns papers matching current effective `authorization`.
- Starting a `practice` or `mock_exam` requires current effective `authorization`.
- Continuing a `practice` or `mock_exam` requires current effective `authorization`.
- Viewing `exam_report` and `mistake_book` content requires current effective `authorization` for the matching `profession` and `level`.
- Authorization loss hides unavailable content and terminates active sessions as described below.
- `publicId` is not an access-control mechanism; every lookup must combine session, user ownership, resource status, and effective `authorization` checks.

### Student Paper Access

- Student home groups papers by selected `profession`, `level`, and `subject`.
- Student paper lists only include `published` paper, not `draft` or `archived` paper.
- Paper lists sort by `publishedAt` descending.
- If a student has multiple effective scopes, the API can return allowed scopes and the client can remember the last selected scope.
- If no effective `authorization` exists, APIs return an empty authorized scope result or a typed guidance state; they must not leak paper metadata outside the student's scope.

### Practice

- `practice` is training mode and does not create official scores.
- One active `practice` progress is allowed per user and paper.
- Practice progress is retained for 15 days.
- Re-entering a paper practice can continue or restart.
- Restarting a `practice` closes the previous active progress and starts a new progress for the same user and paper.
- Theory practice displays one question per page.
- Objective practice answers show correctness, `standard_answer`, and `analysis` after answer submission.
- Wrong objective answers create or update `mistake_book` records.
- Subjective skill practice is grouped by `question_group` or `paper_section`.
- Subjective skill practice may record placeholder fields for Phase 5 `ai_hint` and `ai_scoring`, but Phase 4 must not fabricate AI results.
- Practice authorization loss terminates the active progress, preserves backend `answer_record` rows for traceability, and hides the content from the student.

### Mock Exam

- `mock_exam` is simulation mode and is not a formal exam.
- A student may create multiple `mock_exam` attempts for the same paper.
- A `mock_exam` session is bound to `user`, not device.
- During `mock_exam` answering, APIs must not return correctness, `standard_answer`, `analysis`, `ai_hint`, or `ai_explanation`.
- Timed papers use server-side time calculation from `started_at` and `duration_minute`.
- Untimed papers are submitted manually.
- Leaving and returning to an in-progress `mock_exam` reuses the same user-bound session.
- If the server determines time has expired, the `mock_exam` is submitted automatically.
- Submit can proceed with unanswered questions; unanswered objective and subjective answers score 0.
- Unanswered subjective answers must not trigger Phase 5 `ai_scoring`.
- Authorization loss, paper archive, or account disable terminates the `mock_exam` as `terminated`; terminated attempts do not score and do not generate `exam_report`.
- Network recovery can submit locally cached answers only for answers not yet saved on the server; it must not overwrite newer server answers.

### Answer Records

- `answer_record` stores individual answers for both `practice` and `mock_exam`.
- `exam_mode` distinguishes `practice` and `mock_exam`.
- `answer_record` ownership is always user-bound.
- `answer_record` must include enough snapshot context to render the student's own answer and compare with the relevant `paper_snapshot`.
- Objective scoring can be computed synchronously in Phase 4.
- Subjective scoring fields can exist as pending or null until Phase 5.
- Internal numeric ids, session internals, secrets, and storage object keys must never appear in student DTOs.

### Exam Reports

- `exam_report` is generated from submitted `mock_exam` attempts when scoring is complete or partially complete.
- `exam_report` stores report snapshots so later paper, question, knowledge, or resource changes do not rewrite history.
- `exam_report` must include objective score, subjective score placeholder or actual value, total score, duration, and per-question details.
- Phase 4 may generate reports with subjective scoring pending or unavailable when Phase 5 is not implemented.
- `learning_suggestion`, `citation`, and AI scoring detail fields are reserved for Phase 5 and should be nullable in Phase 4 DTOs.
- Historical `exam_report` visibility still requires current effective `authorization`.

### Mistake Book

- `mistake_book` is limited to objective questions in Phase 4.
- Single choice, multi choice, true/false, and auto-match fill blank wrong answers can enter `mistake_book`.
- Subjective questions do not enter `mistake_book`.
- Records deduplicate by user and source question identity or stable paper snapshot question identity.
- Records store wrong count, latest wrong time, source, mastered state, and favorite state.
- A mastered record returns to unmastered when the student answers the same question wrong again.
- Authorization loss hides matching `mistake_book` content; renewed authorization restores visibility.
- Disabled source questions remain visible in existing mistake records with a disabled marker when the snapshot allows display.

## Enumerations

Use values registered in `docs/03-standards/glossary.yaml` when available.

| Concept                | Database enum candidate | Values                                                                        |
| ---------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `profession`           | `profession`            | `monopoly`, `marketing`, `logistics`                                          |
| `subject`              | `subject`               | `theory`, `skill`                                                             |
| `exam_mode`            | `exam_mode`             | `practice`, `mock_exam`                                                       |
| `mock_exam` status     | `exam_status`           | `in_progress`, `scoring`, `scoring_partial_failed`, `completed`, `terminated` |
| `practice` status      | `practice_status`       | `in_progress`, `completed`, `expired`, `terminated`                           |
| `answer_record` status | `answer_record_status`  | `draft`, `saved`, `submitted`, `scored`, `scoring_failed`                     |
| `mistake_book` source  | `mistake_book_source`   | `wrong_answer`, `favorite`                                                    |
| `mistake_book` status  | `mistake_book_status`   | `unmastered`, `mastered`, `removed`                                           |

`practice_status`, `answer_record_status`, `mistake_book_source`, and `mistake_book_status` are contract candidates for Phase 4 schema work. If implemented as database enums, the schema task must add them through the normal glossary and schema review path.

## Database Contract

All tables use `id` as internal BIGINT identity unless explicitly noted. Tables exposed in URLs must also have `public_id`.

### `practice`

Purpose: one user's training progress for one published paper.

Required columns:

- `id`
- `public_id`
- `user_id`
- `paper_id`
- `paper_public_id`
- `paper_snapshot`
- `profession`
- `level`
- `subject`
- `practice_status`
- `started_at`
- `last_answered_at`
- `expires_at`
- `terminated_at`
- `termination_reason`
- `created_at`
- `updated_at`

Indexes:

- `udx_practice_public_id`
- `idx_practice_user_id`
- `idx_practice_paper_id`
- `idx_practice_user_id_paper_id_practice_status`
- `idx_practice_expires_at`

Rules:

- Only one active `in_progress` row is allowed per user and paper.
- `paper_snapshot` stores the published paper structure needed to resume practice.
- `expires_at` is `started_at + 15 days` unless an implementation task chooses a config-backed equivalent.
- `termination_reason` is nullable and can represent authorization loss, archived paper, account disable, or restart.

### `mock_exam`

Purpose: one user-bound simulation attempt for one published paper.

Required columns:

- `id`
- `public_id`
- `user_id`
- `paper_id`
- `paper_public_id`
- `paper_snapshot`
- `profession`
- `level`
- `subject`
- `exam_status`
- `started_at`
- `submitted_at`
- `server_deadline_at`
- `duration_minute`
- `terminated_at`
- `termination_reason`
- `objective_score`
- `subjective_score`
- `total_score`
- `created_at`
- `updated_at`

Indexes:

- `udx_mock_exam_public_id`
- `idx_mock_exam_user_id`
- `idx_mock_exam_paper_id`
- `idx_mock_exam_exam_status`
- `idx_mock_exam_started_at`
- `idx_mock_exam_server_deadline_at`

Rules:

- `server_deadline_at` is nullable for untimed papers.
- `objective_score`, `subjective_score`, and `total_score` remain nullable until submission/scoring.
- `terminated` attempts must not create `exam_report`.
- `scoring` and `scoring_partial_failed` are reserved for Phase 5 subjective scoring behavior.

### `answer_record`

Purpose: a saved or submitted answer for one paper question in either `practice` or `mock_exam`.

Required columns:

- `id`
- `public_id`
- `user_id`
- `exam_mode`
- `practice_id`
- `mock_exam_id`
- `paper_id`
- `paper_question_id`
- `paper_question_public_id`
- `question_public_id`
- `question_snapshot`
- `answer_snapshot`
- `answer_record_status`
- `is_correct`
- `score`
- `max_score`
- `answered_at`
- `submitted_at`
- `created_at`
- `updated_at`

Indexes:

- `udx_answer_record_public_id`
- `idx_answer_record_user_id`
- `idx_answer_record_practice_id`
- `idx_answer_record_mock_exam_id`
- `idx_answer_record_paper_question_id`
- `idx_answer_record_exam_mode`

Rules:

- Exactly one of `practice_id` or `mock_exam_id` is set according to `exam_mode`.
- `answer_snapshot` stores the user's selected labels or subjective text in a structured JSON-compatible format.
- `question_snapshot` stores only student-visible fields and scoring metadata needed for the answer context.
- `score` is nullable before scoring.
- `is_correct` is nullable for subjective questions or pending scoring.

### `exam_report`

Purpose: immutable report generated from a submitted `mock_exam`.

Required columns:

- `id`
- `public_id`
- `user_id`
- `mock_exam_id`
- `paper_id`
- `paper_public_id`
- `report_snapshot`
- `exam_status`
- `profession`
- `level`
- `subject`
- `objective_score`
- `subjective_score`
- `total_score`
- `duration_second`
- `learning_suggestion_snapshot`
- `generated_at`
- `created_at`
- `updated_at`

Indexes:

- `udx_exam_report_public_id`
- `udx_exam_report_mock_exam_id`
- `idx_exam_report_user_id`
- `idx_exam_report_paper_id`
- `idx_exam_report_generated_at`
- `idx_exam_report_exam_status`

Rules:

- `report_snapshot` stores paper, answer, score, and per-question detail as rendered for the report.
- `learning_suggestion_snapshot` is nullable in Phase 4.
- Reports are not generated for `terminated` mock exams.
- Historical report reads require current effective `authorization`.

### `mistake_book`

Purpose: user's objective-question review list.

Required columns:

- `id`
- `public_id`
- `user_id`
- `question_public_id`
- `paper_question_public_id`
- `profession`
- `level`
- `subject`
- `question_snapshot`
- `latest_answer_snapshot`
- `mistake_book_source`
- `mistake_book_status`
- `wrong_count`
- `is_favorite`
- `is_removed`
- `mastered_at`
- `latest_wrong_at`
- `created_at`
- `updated_at`

Indexes:

- `udx_mistake_book_public_id`
- `idx_mistake_book_user_id`
- `idx_mistake_book_question_public_id`
- `idx_mistake_book_profession_level_subject`
- `idx_mistake_book_latest_wrong_at`
- `idx_mistake_book_mistake_book_status`

Rules:

- Deduplicate by user and stable question identity.
- Removed records remain auditable internally but are hidden from default student lists.
- `question_snapshot` stores enough content to display disabled source questions from historical records.
- `latest_answer_snapshot` stores the most recent wrong objective answer.

## Snapshot Contract

Snapshot field names use camelCase.

Minimum `paper_snapshot` shape:

```json
{
  "paperPublicId": "p_...",
  "name": "2024年4月烟草专卖管理员（三级）-理论试卷",
  "profession": "monopoly",
  "level": 3,
  "subject": "theory",
  "paperType": "past_paper",
  "durationMinute": 120,
  "totalScore": 100,
  "publishedAt": "2026-05-19T12:00:00Z",
  "paperSections": []
}
```

Minimum `question_snapshot` shape for student workflows:

```json
{
  "paperQuestionPublicId": "pq_...",
  "questionPublicId": "q_...",
  "questionType": "single_choice",
  "paperSectionTitle": "一、单项选择题",
  "questionGroupTitle": null,
  "stemRichText": "<p>...</p>",
  "questionOptions": [],
  "standardAnswerRichText": "<p>...</p>",
  "analysisRichText": "<p>...</p>",
  "score": 1,
  "scoringMethod": "auto_match",
  "multiChoiceRule": "all_correct_only"
}
```

Minimum `answer_snapshot` shape:

```json
{
  "selectedLabels": ["A"],
  "textAnswer": null,
  "savedFromClientAt": "2026-05-19T12:00:00Z"
}
```

Snapshots must not contain internal numeric `id`, password/session data, admin phone numbers, storage `object_key`, API keys, model secrets, or raw session tokens.

## API Contract

All APIs return `{ code, message, data, pagination? }`.

### Student Paper APIs

- `GET /api/v1/student-papers/scopes`
- `GET /api/v1/student-papers`
- `GET /api/v1/student-papers/{publicId}`

Rules:

- All routes require authenticated `student`.
- `GET /api/v1/student-papers` requires or infers a valid `profession` and `level`.
- Responses only include `published` paper matching current effective `authorization`.

### Practice APIs

- `POST /api/v1/practices`
- `GET /api/v1/practices/{publicId}`
- `POST /api/v1/practices/{publicId}/answers`
- `POST /api/v1/practices/{publicId}/restart`
- `POST /api/v1/practices/{publicId}/terminate`

Rules:

- `POST /api/v1/practices` starts or resumes practice for a published paper.
- Answer submission in practice can return immediate objective feedback.
- Practice answer responses may return `standardAnswerRichText` and `analysisRichText` after the answer is submitted.
- Subjective AI feedback fields must be `null` or pending placeholders in Phase 4.

### Mock Exam APIs

- `POST /api/v1/mock-exams`
- `GET /api/v1/mock-exams/{publicId}`
- `POST /api/v1/mock-exams/{publicId}/answers`
- `POST /api/v1/mock-exams/{publicId}/submit`
- `POST /api/v1/mock-exams/{publicId}/terminate`

Rules:

- Mock exam answer responses must not return correctness, `standardAnswerRichText`, `analysisRichText`, `ai_hint`, or `ai_explanation`.
- Submit returns `scoring`, `completed`, `scoring_partial_failed`, or `terminated` state depending on scoring capability and session state.
- Server time is authoritative for timed sessions.

### Exam Report APIs

- `GET /api/v1/exam-reports`
- `GET /api/v1/exam-reports/{publicId}`
- `POST /api/v1/exam-reports/{publicId}/retry-learning-suggestion`

Rules:

- Report list is user-owned and authorization-filtered.
- `retry-learning-suggestion` is reserved for Phase 5. Phase 4 can return a documented not-available response if the route is not implemented.

### Mistake Book APIs

- `GET /api/v1/mistake-books`
- `GET /api/v1/mistake-books/{publicId}`
- `POST /api/v1/mistake-books/{publicId}/favorite`
- `POST /api/v1/mistake-books/{publicId}/unfavorite`
- `POST /api/v1/mistake-books/{publicId}/mark-mastered`
- `POST /api/v1/mistake-books/{publicId}/remove`
- `POST /api/v1/mistake-books/{publicId}/ai-explanation`

Rules:

- Mistake book list is user-owned and authorization-filtered.
- `ai-explanation` is reserved for Phase 5. Phase 4 can expose only a disabled UI state or a documented not-available response.

Route implementation tasks may split nested routes into Next.js route folders, but folder names must remain kebab-case and dynamic route params must use `[publicId]` or another public identifier name, never `[id]`.

## DTO Contract

DTOs live in `src/server/contracts` during implementation. Names below are contractual names for Phase 4.

### Shared DTOs

- `StudentPaperScopeDto`
- `StudentPaperSummaryDto`
- `StudentPaperDetailDto`
- `PracticeDto`
- `PracticeAnswerFeedbackDto`
- `MockExamDto`
- `AnswerRecordDto`
- `ExamReportSummaryDto`
- `ExamReportDetailDto`
- `MistakeBookItemDto`

### Student Paper DTO

Required response fields:

- `publicId`
- `name`
- `profession`
- `level`
- `subject`
- `paperType`
- `durationMinute`
- `totalScore`
- `publishedAt`
- `questionCount`
- `canPractice`
- `canMockExam`

### Practice DTO

Required response fields:

- `publicId`
- `paperPublicId`
- `profession`
- `level`
- `subject`
- `practiceStatus`
- `startedAt`
- `lastAnsweredAt`
- `expiresAt`
- `currentQuestionIndex`
- `questionCount`
- `paperSnapshot`

### Practice Answer Feedback DTO

Required response fields:

- `answerRecordPublicId`
- `isCorrect`
- `score`
- `maxScore`
- `standardAnswerRichText`
- `analysisRichText`
- `mistakeBookPublicId`
- `aiExplanationStatus`
- `aiHintStatus`

Phase 4 returns `aiExplanationStatus` and `aiHintStatus` as `null` unless a later Phase 5 task implements them.

### Mock Exam DTO

Required response fields:

- `publicId`
- `paperPublicId`
- `profession`
- `level`
- `subject`
- `examStatus`
- `startedAt`
- `submittedAt`
- `serverNow`
- `serverDeadlineAt`
- `durationMinute`
- `questionCount`
- `answeredCount`
- `paperSnapshot`

### Answer Record DTO

Required response fields:

- `publicId`
- `examMode`
- `paperQuestionPublicId`
- `questionPublicId`
- `answerSnapshot`
- `answerRecordStatus`
- `isCorrect`
- `score`
- `maxScore`
- `answeredAt`
- `submittedAt`

### Exam Report DTO

Required response fields:

- `publicId`
- `mockExamPublicId`
- `paperPublicId`
- `paperName`
- `profession`
- `level`
- `subject`
- `examStatus`
- `objectiveScore`
- `subjectiveScore`
- `totalScore`
- `durationSecond`
- `generatedAt`
- `reportSnapshot`
- `learningSuggestionSnapshot`

### Mistake Book DTO

Required response fields:

- `publicId`
- `questionPublicId`
- `paperQuestionPublicId`
- `profession`
- `level`
- `subject`
- `questionSnapshot`
- `latestAnswerSnapshot`
- `mistakeBookSource`
- `mistakeBookStatus`
- `wrongCount`
- `isFavorite`
- `isRemoved`
- `masteredAt`
- `latestWrongAt`
- `createdAt`
- `updatedAt`

Optional fields must return `null`, not be omitted.

## Error Contract

Recommended error code ranges for Phase 4:

- `4033xx`: student authorization denied, expired, cancelled, disabled, or out of scope.
- `4043xx`: student-facing paper, practice, mock exam, report, or mistake book item not found.
- `4093xx`: invalid session state, duplicate active practice, already submitted mock exam, stale answer conflict.
- `4223xx`: validation failure, invalid answer payload, invalid transition.

Every error response shape:

```json
{
  "code": 403301,
  "message": "Student authorization is not valid for this paper.",
  "data": null
}
```

## Authorization Contract

Student-facing APIs:

- Require authenticated `student` context.
- Must enforce user ownership for `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`.
- Must enforce effective `authorization` for matching `profession` and `level`.
- Must consider active, expired, cancelled, disabled, and not-yet-started authorization records.
- Must hide content for unavailable scopes instead of returning partial paper metadata.
- Must not expose admin-only `paper_asset`, storage `object_key`, internal numeric ids, session internals, or audit internals.

Public identifier rules:

- `publicId` lookup must always be combined with session, ownership, and authorization checks.
- `publicId` is not a permission mechanism.

## Implementation Sequencing

1. `phase-4-answer-record-schema-baseline`
   - Implement storage contracts for `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`.
   - Do not generate Drizzle migration unless a dedicated approval task records human approval.
2. `phase-4-student-paper-access-baseline`
   - Implement authorized student paper listing and detail APIs.
3. `phase-4-practice-session-baseline`
   - Implement practice lifecycle, answer saving, objective feedback, and mistake book updates.
4. `phase-4-mock-exam-session-baseline`
   - Implement mock exam lifecycle, answer saving, server-side time rules, submit, and termination.
5. `phase-4-exam-report-baseline`
   - Implement report snapshots and report APIs.
6. `phase-4-mistake-book-baseline`
   - Implement mistake book APIs and visibility rules.
7. Student UI baselines
   - Implement mobile-first student pages after API and service contracts exist.

## Approval Decision

Approved for Phase 4 implementation tasks as a contract baseline.

This approval does not approve:

- Dependency installation.
- Migration generation.
- Production database changes.
- Remote push by itself.
- PR creation.
- Deployment.
