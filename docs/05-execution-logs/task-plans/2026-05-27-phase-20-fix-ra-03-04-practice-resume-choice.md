# Phase 20 Fix RA-03-04 Practice Resume Choice

## Task

- Task id: `phase-20-fix-ra-03-04-practice-resume-choice`
- Finding: `F-RA-03-04-001`
- Goal: 学员进入已有 `practice` 进度时，不再直接展示答题面，而是先给出继续练习或重新开始的明确选择。

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Scope

- Allowed implementation surface: `src/features/student/practice/StudentPracticePage.tsx`.
- Allowed test surface: `tests/unit/student-practice-ui.test.ts`, `e2e/**` if browser flow evidence needs a deterministic assertion.
- Allowed governance files: task plan, evidence, `project-state.yaml`, `task-queue.yaml`.
- Blocked: dependency changes, schema/migration, package manifests, environment files, auth permission model, cloud/deploy/provider work.

## Implementation Approach

1. Add a local resume-choice state for runtime-loaded active practice sessions.
2. Show a compact choice panel before the answer surface when an active practice is loaded from `/api/v1/practices`.
3. Continue action reveals the existing practice surface without additional API calls.
4. Restart action reuses the existing restart flow, calls `POST /api/v1/practices/{publicId}/restart`, then reveals the restarted practice.
5. Fixture-driven unit tests continue to render directly so existing static component tests do not need a new prompt unless explicitly testing the runtime path.

## Risk Defense

- No API contract or database changes.
- No new dependency.
- No secret/env reads or writes.
- Continue/restart uses existing public identifiers only; no internal `id` exposure.
- Keep copy and UI states inside existing token classes and component patterns.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-04-practice-resume-choice`
- `npm.cmd run test:unit -- student-practice-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
