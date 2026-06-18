# Organization Training Employee Answer Runtime Repository Contract TDD Plan

## Task

- taskId: `organization-training-employee-answer-runtime-repository-contract-tdd`
- executionProfile: `local_unit_tdd`
- targetUseCase: `UC-ADV-EMPLOYEE-TRAINING-ANSWER`
- branch: `codex/organization-training-employee-answer-runtime-repository-contract-tdd`
- scope: metadata-only employee answer repository persistence using the existing `organization_training_answer` schema.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- prior organization-training runtime gap, version takedown, and employee answer queue materialization evidence.
- source surfaces: organization-training service, contract, mapper, repository, repository test, and schema declarations.

## Boundary

Allowed implementation files:

- `src/server/mappers/organization-training-mapper.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`

Allowed docs/state files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review.

Blocked:

- raw answer body persistence.
- answered-question count persistence.
- formal `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` writes.
- route, service, contract, validator, UI, e2e spec, script, schema, drizzle, migration, package, lockfile, dependency, `.env*`, provider/model, dev server, Browser/Playwright runtime, full e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, and Cost Calibration Gate work.
- secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, private data, screenshots, traces, and DOM dumps in evidence.

## Implementation Approach

1. RED: Add focused repository unit tests first for `saveEmployeeAnswerDraft` and `submitEmployeeAnswer`.
2. Implement minimal repository contract:
   - resolve trusted internal version/employee/organization lineage from public identifiers.
   - upsert metadata-only draft and submission rows through gateway methods.
   - generate answer public ids without exposing internal numeric ids.
   - keep formal write policy and answered-question count out of persistence input.
3. Implement mapper support for `organization_training_answer` rows to `EmployeeOrganizationTrainingAnswerDto` in the mapper layer, per ADR-002.
4. GREEN: Run focused repository unit tests.
5. Run scoped validation and readiness gates.
6. Update state/evidence/audit without claiming `experience_closed`.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- RED: `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`
- GREEN: `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown src/server/mappers/organization-training-mapper.ts src/server/repositories/organization-training-repository.ts src/server/repositories/organization-training-repository.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-employee-answer-runtime-repository-contract-tdd.md docs/05-execution-logs/evidence/2026-06-17-organization-training-employee-answer-runtime-repository-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-employee-answer-runtime-repository-contract-tdd.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-answer-runtime-repository-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-employee-answer-runtime-repository-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-answer-runtime-repository-contract-tdd`

## Risks

- The existing schema has no raw answer body or answered-question count field; this task must not infer or add those.
- Mapper modification is necessary because ADR-002 assigns row-to-DTO conversion to `src/server/mappers`; the task queue allowedFiles were adjusted narrowly for this exact mapper file.
- `experience_closed` remains blocked until runtime routes, UI entry surfaces, and separately approved localhost-only full-flow validation exist.
