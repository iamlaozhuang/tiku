# Phase 3 Question Library Baseline Evidence

## Task

- Task id: `phase-3-question-library-baseline`
- Branch: `codex/phase-3-question-library-baseline`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-library-baseline.md`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-library-baseline-security-review.md`

## Changes

- Added question API contract DTOs for `question`, `question_option`, `scoring_point`, `analysis`, `standard_answer`, and relationship identifier lists.
- Added question validator for create/update/list input, including enum validation, 10000-character rich-text limits, 0.5 score granularity, pagination, filters, and keyword normalization.
- Added question mapper from repository rows to API DTOs, exposing `materialPublicId` while keeping internal numeric ids private.
- Added question repository interface for list/create/get/update/disable/copy.
- Added question service behavior for list/create/get/update/disable/copy, locked-question edit prevention, standard errors, and unavailable runtime wiring.
- Added route handler factory and Next.js route files for:
  - `GET /api/v1/questions`
  - `POST /api/v1/questions`
  - `GET /api/v1/questions/{publicId}`
  - `PATCH /api/v1/questions/{publicId}`
  - `POST /api/v1/questions/{publicId}/disable`
  - `POST /api/v1/questions/{publicId}/copy`
- Added colocated question service and route tests.
- Updated automation state and task queue for this completed task.

## TDD Evidence

- RED command:
  - `npm.cmd run test:unit -- src/server/services/question-service.test.ts src/server/services/question-route.test.ts`
  - Initial sandbox run hit `spawn EPERM`; escalated rerun failed because `question-service` and `question-route` were missing.
- GREEN command:
  - `npm.cmd run test:unit -- src/server/services/question-service.test.ts src/server/services/question-route.test.ts`
  - First GREEN attempt exposed an overly narrow array expectation in the test fixture; the expected option list was corrected to match complete repository rows.
  - Final result: pass, 2 files and 6 tests.

## Guardrails

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No dependency introduction.
- No `src/db/schema/**` change.
- No `drizzle/**` migration generation.
- Runtime Next.js route files use unavailable service wiring until authenticated admin runtime integration is implemented.
- Repository rows keep numeric `id`, `question_id`, and `material_id` internal; DTOs expose `publicId` and `materialPublicId`.
- `knowledgeNodePublicIds` and `tagPublicIds` intentionally return `[]` because schema baseline deferred those relationships.

## Validation

Executed on `2026-05-19`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit -- src/server/services/question-service.test.ts src/server/services/question-route.test.ts`: pass, 2 files and 6 tests
- `npm.cmd run test:unit`: pass, 33 files and 75 tests
- `Select-String -Path 'src\app\api\v1\questions\**\*.ts' -Pattern 'code|message|data'`: pass
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'question|question_option|scoring_point|analysis|standard_answer'`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass
- `npm.cmd run format:check`: pass after running `npm.cmd run format`

## Notes

- Initial `format:check` found formatting issues in `src/server/validators/question.ts`; Prettier was run and the final `format:check` passed.
- This baseline is service/contract/route scaffolding only. Database-backed repository implementation, authenticated admin runtime wiring, and audit log writes remain follow-up tasks.
