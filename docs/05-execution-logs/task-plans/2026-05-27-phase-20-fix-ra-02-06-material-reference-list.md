# Phase 20 Fix RA-02-06 Material Reference List

## Task

- Task id: `phase-20-fix-ra-02-06-material-reference-list`
- Finding: `F-RA-02-06-001`
- Goal: expose an API-backed material reference list for questions and papers that use a material, replacing UI-only local question-row inference.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-02-question-paper-content.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Scope

- Allowed implementation surface: `src/server/contracts/**`, `src/server/repositories/**`, `src/server/services/**`, `src/server/mappers/**`, `src/features/admin/question-material-management/**`.
- Allowed tests: focused material service/route/runtime and admin material UI tests.
- Allowed governance files: task plan, evidence, `project-state.yaml`, `task-queue.yaml`.
- Blocked: schema, migration, package/lockfile, env files, dependency changes, auth permission model, staging/prod/cloud/deploy/provider work.

## TDD Plan

1. Add a failing admin material UI test proving material rows display API-backed related questions and papers.
2. Add failing service/repository-facing tests proving material DTOs carry reference lists.
3. Extend material contract with `references.questions[]` and `references.papers[]` using public identifiers only.
4. Populate references from existing `question.material_id` and `question_group.material_id -> paper`.
5. Replace UI-local question inference with API-backed material DTO references.

## Risk Defense

- No database schema changes; references are read from existing foreign keys.
- No dependency changes.
- No env/secret reads or writes.
- No real provider, staging/prod, cloud, deploy, or destructive data operation.
- Reference DTOs expose only `publicId` values and display metadata, never internal numeric ids.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-06-material-reference-list`
- Focused failing tests before implementation.
- `npm.cmd run test:unit -- material-service.test.ts material-route.test.ts phase-9-content-question-material-runtime.test.ts admin-question-material-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
