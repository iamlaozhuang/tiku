# Task Plan: batch-140-personal-learning-ai-route-post-persistent-request

## Baseline

- Branch: `codex/batch-140-personal-learning-ai-route-post-persistent-request`
- Baseline HEAD/master/origin/master: `c6facfbe3a3f18dff59583f26b8efea25ac99667`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-139-personal-learning-ai-route-get-persistent-history` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-139-personal-learning-ai-route-get-persistent-history.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-139-personal-learning-ai-route-get-persistent-history.md`

## Allowed Files

- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/repositories/personal-ai-generation-request-repository.ts`
- `src/server/repositories/personal-ai-generation-request-repository.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-140-personal-learning-ai-route-post-persistent-request.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-140-personal-learning-ai-route-post-persistent-request.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-140-personal-learning-ai-route-post-persistent-request.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `src/features/**`,
  `src/server/contracts/**`, `src/server/models/**`, `playwright-report/**`, `test-results/**`.
- UI refetch, schema/migration, contract/model edits, dependency changes, env/secret/provider work, generated-content
  persistence, deploy/payment/external-service work, PR, force-push, and Cost Calibration Gate execution remain blocked.

## Implementation Plan

1. Add RED tests proving POST normalizes owner/actor/quota public ids from session context before persistence.
2. Add RED tests proving idempotent POST can reuse repository task metadata without duplicate task rows.
3. Add RED tests proving repository/persistence failures keep the local browser response standard and redacted without
   exposing internal errors.
4. Implement a small POST persistence adapter in the route service for `local_browser_experience` requests only; do not
   call providers or write generated content.
5. If needed, adjust repository tests only within allowed files to cover race-safe idempotent insert behavior.
6. Run the declared focused unit tests, existing local e2e spec, lint, typecheck, full unit, build, diff check, and Module
   Run v2 closeout scripts before commit.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`

## Risk Controls

- Session-resolved public ids override stale client owner ids before persistence.
- Persistence input and output must not include internal numeric ids, raw prompts, provider payloads, raw answers, raw
  generated content, generated content, secrets, credentials, tokens, or session material.
- Local DB/schema unavailable states must not trigger schema/migration work in this task.
- Stop if the task requires changing blocked schema/drizzle, UI, contract/model, package, env/provider, or generated
  content files.
