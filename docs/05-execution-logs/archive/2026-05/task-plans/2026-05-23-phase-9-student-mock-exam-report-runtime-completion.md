# Phase 9 Student Mock Exam Report Runtime Completion Task Plan

## Task

- Task id: `phase-9-student-mock-exam-report-runtime-completion`
- Branch: `codex/phase-9-student-mock-exam-report-runtime-completion`
- Base: `master`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-practice-runtime-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`

## Scope

Complete the student `mock_exam` and `exam_report` runtime gaps that are inside the queue allowed files:

- Keep all runtime routes protected by session/user context.
- Preserve public identifier boundaries and avoid exposing auto-increment `id`.
- Keep mock exam answer saving free of correctness, `standard_answer`, `analysis`, `ai_hint`, and `ai_explanation` feedback.
- Submit mock exams using server-side time and existing saved answer records.
- Persist submitted answer-record scoring state so generated reports can render per-question scores.
- Generate `exam_report` snapshots from the whole paper snapshot, including unanswered questions, rather than only saved answers.
- Keep learning suggestion retry on the mock-provider/local boundary; do not connect a real AI provider.

## Boundary Notes

- `US-03-08` says the mock exam record list includes `terminated`; the `student-experience-contract` also says terminated mock exams do not generate `exam_report`. This task will not invent a new record DTO or expose terminated attempts through `exam_report` rows. The conflict is recorded as a residual product/API boundary item for later closeout or a dedicated contract update.
- Subjective AI scoring and AI explanations remain deferred to `phase-9-ai-scoring-explanation-hint-runtime`.
- Student UI and browser flow polish remain deferred to `phase-9-student-experience-ui-completion`.
- No dependency, schema, migration, `.env.example`, package, lockfile, or production resource changes.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-student-mock-exam-report-runtime-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-mock-exam-report-runtime-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-student-mock-exam-report-runtime-completion-security-review.md`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## TDD Plan

1. Add a failing `mock-exam-service` test proving submit passes scored/submitted answer-record results to the repository:
   - objective saved answers become `scored` with `isCorrect`, `score`, and `submittedAt`;
   - subjective saved answers become `submitted` with null scoring fields;
   - unanswered questions increase `unansweredCount`.
2. Add a failing `exam-report-service` test proving generated report snapshots include every paper question:
   - saved answers include answer record fields and score;
   - unanswered questions include `answerRecordPublicId: null`, `answerSnapshot: null`, `score: "0.0"`, and `isCorrect: false` for objective questions.
3. Implement minimal service/repository contract changes:
   - extend `SubmitMockExamInput` with answer scoring results;
   - update Postgres submit flow to mark related `answer_record` rows;
   - build report details from paper snapshot plus answer-record map.
4. Run focused tests first, then full validation commands from the queue.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-mock-exam-report-runtime-completion`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Security review required because task touches student authorization-protected runtime, mock exam scoring, `exam_report`, and AI learning suggestion boundary.
- Do not log or expose session tokens, password, secrets, API keys, raw prompts, raw answers, raw model responses, or internal numeric ids.
- Keep all APIs in standard `{ code, message, data, pagination? }` envelopes.
- Keep DTO fields camelCase and route folders kebab-case with `[publicId]`.
