# Phase 20 Fix RA-02-10 Paper Copy Disabled Question Marker

## Task

- Task id: `phase-20-fix-ra-02-10-paper-copy-disabled-question-marker`
- Finding: `F-RA-02-10-001`
- Goal: 复制已发布/下架 `paper` 为新草稿时，复制结果必须暴露源题已停用标记，内容老师能看到 copied draft 中存在 disabled source `question`。

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

- Allowed implementation surface: `src/server/contracts/**`, `src/server/repositories/**`, `src/server/services/**`, `src/server/mappers/**`, `src/features/admin/paper-management/**`.
- Allowed test surface: focused unit tests and e2e route/browser coverage if needed.
- Allowed governance files: task plan, evidence, `project-state.yaml`, `task-queue.yaml`.
- Blocked: schema, migration, package/lockfile, env files, dependency changes, auth permission model, staging/prod/cloud/deploy/provider work.

## TDD Plan

1. Add failing service/UI tests proving copied draft exposes a disabled source question marker.
2. Add `questionStatus` to `QuestionSnapshotDto` and snapshot construction.
3. Surface disabled-source count in the content admin copy success message.
4. Keep existing older snapshots safe by not requiring schema or migration changes.

## Risk Defense

- No database schema changes; snapshot JSON adds a camelCase field only for newly built snapshots.
- No dependency changes.
- No env/secret reads or writes.
- No real provider, staging/prod, cloud, deploy, or destructive data operation.
- Public URLs and UI continue using `publicId`, never internal `id`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-10-paper-copy-disabled-question-marker`
- Focused failing tests before implementation.
- `npm.cmd run test:unit -- paper-draft-service.test.ts admin-paper-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
