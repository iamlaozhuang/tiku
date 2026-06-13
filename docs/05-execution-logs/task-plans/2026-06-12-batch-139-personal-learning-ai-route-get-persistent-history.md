# Task Plan: batch-139-personal-learning-ai-route-get-persistent-history

## Baseline

- Branch: `codex/batch-139-personal-learning-ai-route-get-persistent-history`
- Baseline HEAD/master/origin/master: `f08cdcd1733d1d6dd92bae9ab6445acbd6116630`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-138-personal-learning-ai-request-history-repository` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-138-personal-learning-ai-request-history-repository.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-138-personal-learning-ai-request-history-repository.md`

## Allowed Files

- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-139-personal-learning-ai-route-get-persistent-history.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-139-personal-learning-ai-route-get-persistent-history.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-139-personal-learning-ai-route-get-persistent-history.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `src/features/**`,
  `src/server/repositories/**`, `src/server/mappers/**`, `src/server/contracts/**`, `src/server/models/**`,
  `playwright-report/**`, `test-results/**`.
- POST persistence, UI refetch, schema/migration, repository/mapper/contract/model edits, dependency changes,
  env/secret/provider work, generated-content persistence, deploy/payment/external-service work, PR, force-push, and Cost
  Calibration Gate execution remain blocked.

## Implementation Plan

1. Add focused RED tests to `personal-ai-generation-request-route.test.ts` proving GET calls the repository with the
   resolved session user public id, ignores query/body ids, returns repository DTOs, and converts repository errors to a
   standard envelope without stack traces.
2. Update route service so `createPersonalAiGenerationRequestRouteHandlers` accepts a request repository dependency for
   GET history and preserves current POST behavior.
3. Update the API route adapter to inject `createPostgresPersonalAiGenerationRequestRepository`.
4. Keep e2e changes minimal; only adjust the existing local spec if necessary to match the declared persistent GET
   envelope while preserving sensitive-content assertions.
5. Run the declared focused route unit test, existing local e2e spec, lint, typecheck, full unit, build, diff check, and
   Module Run v2 closeout scripts before commit.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-139-personal-learning-ai-route-get-persistent-history`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-139-personal-learning-ai-route-get-persistent-history`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-139-personal-learning-ai-route-get-persistent-history`

## Risk Controls

- GET must use only the resolved session user public id for repository filtering.
- Query/body user ids and numeric ids must not be echoed.
- Repository errors must return a standard error envelope without stack traces or internal exception text.
- No provider call, no generated-content write, no schema/migration, no repository/mapper edits, and no dependency/env
  changes.
- Stop if the task requires changing blocked repository, mapper, schema, contract, model, UI, package, env/provider, or
  e2e output directories.
