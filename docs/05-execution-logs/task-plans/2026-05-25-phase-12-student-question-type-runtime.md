# Phase 12 Student Question Type Runtime Task Plan

## Goal

Close the P1 local student runtime gap for existing canonical question types only:

- `single_choice`
- `multi_choice`
- `true_false`
- `fill_blank`
- `short_answer`

This task aligns practice, mock_exam, report-facing student UI, and mistake_book behavior with current schema-supported types. It does not add `case_analysis` or `calculation` and does not change schema, migrations, scripts, dependencies, package files, secrets, env files, staging/prod, deployment, or cloud resources.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## Scope

Allowed:

- inspect and update student practice/mock_exam/mistake_book UI within the allowed files;
- inspect and update `practice-service.ts`, `mock-exam-service.ts`, and `mistake-book` validation where required;
- add focused AC-level tests for canonical question type behavior;
- keep API DTO fields camelCase and publicId-only externally;
- update state/queue and evidence.

Forbidden:

- no package or lockfile changes;
- no schema, migration, or script changes;
- no `.env.local` or secret/env access;
- no staging/prod, deployment, cloud, COS, public object storage URL, or provider changes;
- no destructive data operations;
- no new question_type enum values.

## TDD Plan

1. RED: add a focused student practice/mock unit test that fails where canonical question type handling is absent or non-canonical, especially `multi_choice`, `true_false`, `fill_blank`, and `short_answer`.
2. RED: add or strengthen mistake_book coverage so only objective types plus `fill_blank` with `auto_match` can enter mistake_book; `short_answer` must stay out.
3. GREEN: minimally align student UI/service branching and answer payload handling with existing canonical types.
4. REFACTOR: keep changes local to student runtime and avoid broad UX/layout churn beyond the type handling needed for AC coverage.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-student-question-type-runtime
npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts
npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```
