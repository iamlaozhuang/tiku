# unified-repair-student-experience-layering-mistake-book Task Plan

## Task

- Task id: `unified-repair-student-experience-layering-mistake-book`
- Branch: `codex/unified-repair-student-experience-layering-mistake-book`
- Date: 2026-06-14
- Mode: strict serial repair task

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-student-experience-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-student-experience-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`

## Scope

Allowed implementation surfaces are limited to:

- `src/app/(student)/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/services/student-experience/**`
- `src/server/repositories/student-experience/**`
- `src/server/contracts/student-experience/**`
- `src/server/mappers/student-experience/**`
- `src/server/validators/student-experience/**`
- `tests/unit/student-experience/**`

Governance outputs are limited to state, queue, task plan, evidence, and audit/review files.

## Blocked Boundaries

- No `.env.local`, `.env.*`, secret, provider configuration, or database URL access.
- No provider/model request, quota use, raw prompt, raw answer, raw student answer evidence, or provider payload.
- No schema, migration, `src/db/schema/**`, or `drizzle/**` edits.
- No dependency, `package.json`, or lockfile edits.
- No e2e, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- If implementation requires a blocked surface, stop and record evidence instead of widening scope.

## TDD Plan

1. Add `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` first.
2. RED assertions:
   - scoped `student-experience` route handlers exist for `practice`, `mock_exam`, `exam_report`, and `mistake_book` and expose standard API envelopes without leaking raw row data;
   - mistake book contract remains objective-question scoped and rejects subjective entries from the scoped boundary;
   - provider-gated operations are represented as blocked handoffs instead of making provider/model/quota calls.
3. Run the target unit test and record the expected RED failure.
4. Implement the minimum scoped contract/service/repository/mapper/validator and route adapter wiring needed for GREEN.
5. Re-run the target unit test and required validation commands.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-student-experience-layering-mistake-book`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-student-experience-layering-mistake-book`

## Risk Defense

- Keep route handlers as thin adapters per ADR-002.
- Use `publicId`-style URL identifiers and do not expose auto-increment ids.
- Preserve standard `{ code, message, data, pagination? }` API response shape.
- Keep evidence redacted: only command names, pass/fail state, counts, and sanitized summaries.
- Do not touch existing root service/repository files unless they are within the task allowedFiles.
