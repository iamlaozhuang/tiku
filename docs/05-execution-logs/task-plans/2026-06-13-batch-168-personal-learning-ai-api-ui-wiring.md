# Task Plan: batch-168-personal-learning-ai-api-ui-wiring

## Scope

- Task: `batch-168-personal-learning-ai-api-ui-wiring`
- Branch: `codex/batch-168-personal-learning-ai-api-ui-wiring`
- Baseline: `744248f0520291ab17813b2297fbc754bfcc02f8`
- Task kind: implementation.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-162 through batch-171 evidence and batch-170/batch-171 audit records.
- Confirmed `HEAD`, `master`, and `origin/master` are all `744248f0520291ab17813b2297fbc754bfcc02f8`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remained before task branch creation.
- Created short branch `codex/batch-168-personal-learning-ai-api-ui-wiring`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing batch-168 according to the recommended minimal
  API/UI wiring scope.
- Approved scope:
  - wire `personal-ai-generation-requests` API route and student UI minimal loop;
  - use already implemented local server-side service/repository/adapter boundaries;
  - expose loading, empty, error, permission-blocked, and no-formal-adoption behavior;
  - validate with lint, typecheck, unit, build, diff check, and Module Run v2 gates.
- Not approved: provider calls, model requests, sandbox execution, env/secret reads or writes, `.env.local`, e2e,
  schema/migration, dependency/package/lockfile changes, staging/prod/cloud, deploy, payment, external-service, formal
  generated-content adoption, PR, force-push, and Cost Calibration.

## Allowed Files

- `src/app/api/v1/personal-ai-generation-requests/**`
- `src/app/(student)/ai-generation/**`
- `src/features/student/ai-generation/**`
- `src/server/services/personal-ai-generation-*.ts`
- `src/server/services/personal-ai-generation-*.test.ts`
- `src/server/contracts/personal-ai-generation-*.ts`
- `src/server/validators/personal-ai-generation-*.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-168-personal-learning-ai-api-ui-wiring.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-168-personal-learning-ai-api-ui-wiring.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-168-personal-learning-ai-api-ui-wiring.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `e2e/**`, `src/db/schema/**`, `drizzle/**`, `materials/**`, `paper_assets/**`, `playwright-report/**`,
  `test-results/**`.
- Provider calls, model requests, sandbox execution, env/secret use, e2e, schema/migration, dependency changes,
  staging/prod/cloud, deploy, payment, external-service, PR, force-push, formal generated-content adoption, and Cost
  Calibration.

## Design

1. Keep the existing route boundary under `/api/v1/personal-ai-generation-requests`.
2. Keep authorization conservative: route ownership is session-derived via the local session runtime; client-supplied
   owner, actor, and quota owner public ids are overridden by the resolver user public id.
3. Keep provider behavior blocked: the UI and API expose local contract/read-model state only and do not call a model.
4. Surface draft result metadata from already implemented local persistence/read-model boundaries as redacted summary
   fields only.
5. Add explicit no-formal-adoption metadata to the API/UI contract so generated content remains visibly non-adoptable in
   this local student flow.

## TDD Plan

1. Add failing API/UI tests that expect `isFormalAdoptionBlocked: true` in the local browser contract and visible student
   UI metadata.
2. Run targeted unit tests and record RED.
3. Implement the minimal contract/service/UI change.
4. Rerun targeted tests and full validation.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-168-personal-learning-ai-api-ui-wiring`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-168-personal-learning-ai-api-ui-wiring`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-168-personal-learning-ai-api-ui-wiring`

## Rollback And Recovery

- Revert the batch branch before merge if validation fails.
- No database migration, provider execution, or e2e artifact rollback is needed because those actions remain blocked.
