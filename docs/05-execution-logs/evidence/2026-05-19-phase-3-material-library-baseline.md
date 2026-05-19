# Phase 3 Material Library Baseline Evidence

## Task

- Task id: `phase-3-material-library-baseline`
- Branch: `codex/phase-3-material-library-baseline`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-3-material-library-baseline.md`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-material-library-baseline-security-review.md`

## Changes

- Added material API contract DTOs.
- Added material validator for create/update/list input.
- Added material mapper from repository rows to API DTOs.
- Added material repository interface for list/create/get/update/disable/copy.
- Added material service behavior for list/create/get/update/disable/copy.
- Added route handler factory and Next.js route files for:
  - `GET /api/v1/materials`
  - `POST /api/v1/materials`
  - `GET /api/v1/materials/{publicId}`
  - `PATCH /api/v1/materials/{publicId}`
  - `POST /api/v1/materials/{publicId}/disable`
  - `POST /api/v1/materials/{publicId}/copy`
- Added colocated material service and route tests.

## TDD Evidence

- RED command:
  - `npm.cmd run test:unit -- src/server/services/material-service.test.ts src/server/services/material-route.test.ts`
  - Initial sandbox run hit `spawn EPERM`; escalated rerun failed because `material-service` and `material-route` were missing.
- GREEN command:
  - `npm.cmd run test:unit -- src/server/services/material-service.test.ts src/server/services/material-route.test.ts`
  - Result: pass, 2 files and 5 tests.

## Guardrails

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No dependency introduction.
- No `src/db/schema/**` change.
- No `drizzle/**` migration generation.
- Runtime Next.js route files use unavailable service wiring until authenticated admin runtime integration is implemented.
- Repository rows keep numeric `id` internal; DTOs expose `publicId`.

## Validation

Executed on `2026-05-19`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit -- src/server/services/material-service.test.ts src/server/services/material-route.test.ts`: pass, 2 files and 5 tests
- `npm.cmd run test:unit`: pass, 31 files and 69 tests
- `Select-String -Path 'src\app\api\v1\materials\**\*.ts' -Pattern 'code|message|data'`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass
- `npm.cmd run format:check`: pass

Full gate results are recorded below after final validation:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass, branch inventory completed before commit
