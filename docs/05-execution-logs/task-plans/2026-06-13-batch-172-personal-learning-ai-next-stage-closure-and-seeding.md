# Task Plan: batch-172-personal-learning-ai-next-stage-closure-and-seeding

## Scope

- Task: `batch-172-personal-learning-ai-next-stage-closure-and-seeding`
- Branch: `codex/batch-172-personal-learning-ai-next-stage-closure-and-seeding`
- Baseline: `dc0f60fa0e1f912ffabd1fa37a957236dfa3541a`
- Task kind: docs-only closure and queue seeding.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-169 evidence/audit.
- Confirmed `HEAD`, `master`, and `origin/master` are all `dc0f60fa0e1f912ffabd1fa37a957236dfa3541a`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remained before task branch creation.
- Created short branch `codex/batch-172-personal-learning-ai-next-stage-closure-and-seeding`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing the recommended docs-only
  personal-learning-ai next-stage closure and seeding task.
- Approved scope:
  - summarize completed local-only personal-learning-ai implementation surface;
  - record residual high-risk boundaries;
  - seed blocked next-stage tasks with explicit allowedFiles, blockedFiles, fresh approval requirements, and validation
    surfaces.
- Not approved: source/test/e2e edits, provider calls, model requests, sandbox execution, env/secret reads or writes,
  `.env.local`, schema/migration, dependency/package/lockfile changes, staging/prod/cloud, deploy, payment,
  external-service, formal generated-content adoption, PR, force-push, and Cost Calibration.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `materials/**`, `paper_assets/**`,
  `playwright-report/**`, `test-results/**`.
- Provider calls, model requests, sandbox execution, env/secret use, schema/migration, dependency changes,
  staging/prod/cloud, deploy, payment, external-service, PR, force-push, formal generated-content adoption, and Cost
  Calibration.

## Current Local-Only Completion Surface

- Dependency/provider adapter foundations and env destination documentation are closed through batch-163 to batch-165.
- Provider sandbox execution remains blocked as a real execution capability; batch-166 closed only as a blocked gate.
- Generated-content draft persistence and FK hardening are closed through batch-170 and batch-171.
- API/UI wiring and local browser validation are closed through batch-168 and batch-169.
- The current repository has no remaining queued personal-learning-ai implementation task with an executable approval.

## Seed Plan

Seed the next personal-learning-ai phase as blocked tasks:

1. Provider secret/runtime readiness gate.
2. Local provider sandbox smoke execution.
3. Cost Calibration Gate.
4. Formal generated-content adoption design.
5. Formal generated-content adoption implementation.
6. Staging/provider/deploy readiness planning.

Each seeded task must stay blocked until a future prompt grants task-specific fresh approval.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md docs/05-execution-logs/evidence/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-172-personal-learning-ai-next-stage-closure-and-seeding.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-172-personal-learning-ai-next-stage-closure-and-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-172-personal-learning-ai-next-stage-closure-and-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-172-personal-learning-ai-next-stage-closure-and-seeding`

## Rollback And Recovery

- Revert the batch branch before merge if validation fails.
- No runtime rollback is needed because this task does not change product source, schema, dependencies, provider
  configuration, env/secret files, deployment, or generated-content write behavior.
