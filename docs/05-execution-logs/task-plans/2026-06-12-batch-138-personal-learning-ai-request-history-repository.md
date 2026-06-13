# Task Plan: batch-138-personal-learning-ai-request-history-repository

## Baseline

- Branch: `codex/batch-138-personal-learning-ai-request-history-repository`
- Baseline HEAD/master/origin/master: `70d5fa65042349bbd483617fa046e7e81729e260`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-137-personal-learning-ai-task-persistence-schema-migration` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`

## Allowed Files

- `src/server/repositories/personal-ai-generation-request-repository.ts`
- `src/server/repositories/personal-ai-generation-request-repository.test.ts`
- `src/server/mappers/personal-ai-generation-request-mapper.ts`
- `src/server/mappers/personal-ai-generation-request-mapper.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-138-personal-learning-ai-request-history-repository.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-138-personal-learning-ai-request-history-repository.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-138-personal-learning-ai-request-history-repository.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `src/app/**`,
  `src/features/**`, `src/server/services/**`, `src/server/contracts/**`, `e2e/**`, `playwright-report/**`,
  `test-results/**`.
- Provider calls, schema/migration work, generated-content persistence, route/UI/e2e changes, dependency changes,
  env/secret work, deploy/payment/external-service work, PR, force-push, and Cost Calibration Gate execution remain
  blocked.

## Implementation Plan

1. Read existing repository and mapper test patterns before editing.
2. Add focused RED tests for:
   - mapper output uses camelCase DTO fields and public ids only;
   - raw prompt/provider/generated-content-like fields are absent;
   - repository list filters by `owner_public_id` and sorts newest first;
   - repository create-or-reuse uses a hashed idempotency key boundary and returns public task metadata.
3. Implement a narrow repository and mapper around `ai_generation_task` without changing schema, route, UI, service, or
   e2e files.
4. Keep repository APIs injectable/testable with a typed DB surface so unit tests do not require a live database.
5. Record evidence/audit, close task status, run all required validation commands, then commit/merge/push/delete branch
   before considering batch-139.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/mappers/personal-ai-generation-request-mapper.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-138-personal-learning-ai-request-history-repository`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-138-personal-learning-ai-request-history-repository`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-138-personal-learning-ai-request-history-repository`

## Risk Controls

- No numeric internal ids in outward mapper DTOs.
- No raw prompt, provider payload, raw answer, raw generated content, generated content, secret, credential, token, or
  session material in evidence.
- No N+1 database loop: repository methods should issue one query/mutation per operation.
- Stop if implementing the repository requires schema, route, service, contract, UI, e2e, env/provider, or dependency
  edits.
