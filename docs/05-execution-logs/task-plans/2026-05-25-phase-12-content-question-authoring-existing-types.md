# Phase 12 Content Question Authoring Existing Types Task Plan

## Goal

Close the P1 local content question authoring gap for schema-supported question types only:

- `single_choice`
- `multi_choice`
- `true_false`
- `fill_blank`
- `short_answer`

This task does not add `case_analysis` or `calculation`, because that requires the separate schema/migration approval gate registered in the queue.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## Scope

Allowed:

- strengthen content question form UI for existing question types;
- map form values to existing `/api/v1/questions` payload fields;
- preserve publicId-only runtime behavior and standard API envelopes;
- add focused tests and evidence;
- update state/queue.

Forbidden:

- no package or lockfile changes;
- no schema, migration, or script changes;
- no `.env.local` or secret/env access;
- no staging/prod, deployment, cloud, COS, public object storage URL, or provider changes;
- no new question_type enum values.

## TDD Plan

1. RED: add a unit test that creates a `multi_choice` question through the content form and expects the posted payload to carry selected `questionType`, options, score, knowledge/material linkage fields, and multi-choice rule instead of the previous hardcoded `single_choice` payload.
2. RED: add a unit test for type switching to ensure form controls for true/false, fill_blank, and short_answer update the payload without requiring option rows where not applicable.
3. GREEN: update `QuestionFormValues`, defaults, edit hydration, `createQuestionInput()`, and `QuestionWriteForm` with minimal UI controls for existing schema-supported fields.
4. REFACTOR: keep state updates immutable, avoid broad layout churn, keep edit UX changes minimal because the dedicated P3 UX task follows later.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-authoring-existing-types
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts
npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```
