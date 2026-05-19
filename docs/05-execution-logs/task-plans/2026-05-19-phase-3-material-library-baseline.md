# Phase 3 Material Library Baseline Task Plan

## Task

- Task id: `phase-3-material-library-baseline`
- Branch: `codex/phase-3-material-library-baseline`
- Phase: `phase-3-question-paper`
- Human approval: user requested `推进下一步` and then requested completion, merge, and push; this authorizes the queued material library baseline task and final push of this task after verification.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/security-review-gate.md`

## Scope

Implement the Phase 3 material library baseline for admin/content-management API boundaries:

- `GET /api/v1/materials`
- `POST /api/v1/materials`
- `GET /api/v1/materials/{publicId}`
- `PATCH /api/v1/materials/{publicId}`
- `POST /api/v1/materials/{publicId}/disable`
- `POST /api/v1/materials/{publicId}/copy`

The implementation follows the existing Phase 2 baseline pattern: route handlers are thin adapters, services own behavior, repositories are typed boundaries, mappers convert database `snake_case` rows to API `camelCase` DTOs, and validators normalize transport input.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-material-library-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-material-library-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-material-library-baseline-security-review.md`
- `src/app/api/v1/materials/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## TDD Plan

1. Add failing service tests for material list/create/get/update/disable/copy behavior.
2. Add failing route tests for standard response shape and public identifier route params.
3. Add focused validator/mapper tests if service tests cannot cover normalization or DTO mapping clearly.
4. Implement the minimal contracts, validators, mapper, repository interface, service, route handler factory, and Next.js route files.
5. Re-run targeted tests and then the full validation gate.

## Risk Controls

- `authorization`: this baseline exposes admin/content-management route shape only; the runtime route files use an unavailable service until authenticated admin runtime wiring is implemented. Security review records the accepted gap.
- `api_contract`: all responses must use `{ code, message, data, pagination? }` and camelCase DTO fields.
- `data_contract`: numeric `id` stays inside repository rows and is never returned by mappers.
- `admin`: state-changing material APIs are admin-only by contract; this task documents required future admin resolver integration.
- No dependency changes.
- No schema or migration changes.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\app\api\v1\materials\**\*.ts' -Pattern 'code|message|data'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
