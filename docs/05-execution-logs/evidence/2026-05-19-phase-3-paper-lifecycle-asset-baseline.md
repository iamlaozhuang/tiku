# Phase 3 Paper Lifecycle Asset Baseline Evidence

## Task

- Task id: `phase-3-paper-lifecycle-asset-baseline`
- Branch: `codex/phase-3-paper-lifecycle-asset-baseline`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-3-paper-lifecycle-asset-baseline.md`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-paper-lifecycle-asset-baseline-security-review.md`

## Changes

- Added paper lifecycle baseline behavior for:
  - `POST /api/v1/papers/{publicId}/archive`
  - `POST /api/v1/papers/{publicId}/copy`
  - `DELETE /api/v1/papers/{publicId}`
- Added `paper_asset` baseline contract, repository hook, mapper, validator, service, route factory, and Next.js route placeholders for:
  - `GET /api/v1/paper-assets`
  - `POST /api/v1/paper-assets`
  - `GET /api/v1/paper-assets/{publicId}`
  - `DELETE /api/v1/paper-assets/{publicId}`
- Kept live Next.js routes wired to unavailable runtime services until authenticated admin runtime integration lands.
- Updated Phase 3 automation state and task queue.

## TDD Evidence

- Existing baseline command before RED:
  - `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts`
  - Result: pass, 2 files and 11 tests.
- RED command:
  - `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-asset-route.test.ts`
  - Initial sandbox run hit `spawn EPERM`; escalated rerun failed for expected reasons:
    - `service.archivePaper is not a function`
    - `service.deletePaper is not a function`
    - `service.copyPaper is not a function`
    - `handlers.archive.POST` is undefined
    - `paper-asset-service` and `paper-asset-route` modules did not exist.
- GREEN command:
  - `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-asset-route.test.ts`
  - Result: pass, 4 files and 19 tests.

## Guardrails

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No dependency introduction.
- No `src/db/schema/**` change.
- No `drizzle/**` migration generation.
- No `.env.example` change.
- Runtime Next.js routes remain unavailable until authenticated admin runtime integration is implemented.
- DTOs expose public identifiers only; numeric ids stay inside repository access rows.
- `paper_asset.object_key` remains internal and is not exposed by the API DTO.

## Validation

Executed on `2026-05-19` in `F:\tiku\.worktrees\phase-3-paper-lifecycle-asset-baseline`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit`: pass, 37 files and 94 tests
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'paper_asset|paper_attachment_usage|copy|disable'`: pass
- `Select-String -Path 'src\app\api\v1\paper-assets\**\*.ts' -Pattern 'code|message|data'`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `npm.cmd run format:check`: initial fail on 6 new TS files
- `npm.cmd run format`: pass
- `npm.cmd run format:check`: pass after format
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass
  - lint: pass
  - typecheck: pass
  - test:unit: pass, 37 files and 94 tests
  - format:check: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; task branch has expected unstaged task-scoped changes before commit.
- `npm.cmd run format:check`: pass after evidence update

## Notes

- Archive is modeled as the non-destructive downlist transition from `published` to `archived`.
- Delete is limited to unreferenced draft papers at service/repository contract level.
- Copy is limited to published or archived paper and preserves paper-level scoring point adjustments from the source paper baseline.
- Actual admin role/session enforcement, answer-record termination, audit log writes, object storage provider validation, and database-backed referential checks remain accepted gaps because this task is a baseline service/route scaffold.
