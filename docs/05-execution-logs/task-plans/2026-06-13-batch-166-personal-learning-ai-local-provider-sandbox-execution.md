# Task Plan: batch-166-personal-learning-ai-local-provider-sandbox-execution

## Scope

- Task: `batch-166-personal-learning-ai-local-provider-sandbox-execution`
- Branch: `codex/batch-166-personal-learning-ai-local-provider-sandbox-execution`
- Baseline: `2b7da9d64c5b49479daf574a18c1166128fc6090`
- Task kind: blocked gate only.

## Readiness

- Re-read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, all ADR files, project state, task queue,
  batch-160 blocked sandbox evidence, and the current batch-166 queue entry before edits.
- Confirmed `master`, `HEAD`, and `origin/master` were all `2b7da9d64c5b49479daf574a18c1166128fc6090`.
- Confirmed the worktree was clean and no local or remote `codex/*` short branches remained before task branch creation.
- Created short branch `codex/batch-166-personal-learning-ai-local-provider-sandbox-execution`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it reported no tracked, staged, or
  untracked changes and no files changed against `origin/master`.

## Human Approval

- human approval: The user prompt on 2026-06-13 explicitly did not approve real provider calls, model requests, sandbox
  execution, cost measurement, or env/secret use for batch-166.
- The prompt allowed only stopping at a blocked gate or writing blocked evidence if batch-166 became the next task.
- Approved file surface: batch-166 state, queue, task plan, evidence, and audit only.
- Blocked files: `.env.local`, `.env.example`, package/lockfile, source, tests, e2e, schema/migration, drizzle, materials,
  paper assets, Playwright reports, and test-result paths.

## Execution Plan

1. Record batch-166 as a docs-only blocked gate.
2. Do not execute any sandbox, model request, provider call, cost measurement, env/secret read or use, generated-content
   write, schema/migration, e2e, deploy, payment, external-service, PR, or force-push.
3. Run the declared validation commands and Module Run v2 closeout/pre-push readiness.
4. Commit as an independent batch-166 docs-only blocked-gate commit, fast-forward merge to master, push origin/master,
   delete the short branch, and re-read state/queue.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-166-personal-learning-ai-local-provider-sandbox-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-166-personal-learning-ai-local-provider-sandbox-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-166-personal-learning-ai-local-provider-sandbox-execution`
