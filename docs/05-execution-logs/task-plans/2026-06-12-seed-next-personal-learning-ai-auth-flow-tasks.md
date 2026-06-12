# Task Plan: seed-next-personal-learning-ai-auth-flow-tasks

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- Evidence and audits for `batch-123` through `batch-126`
- Current personal-learning-ai route, session runtime, student UI, unit test, and local auth route guard files

## Goal

Register the next small personal-learning-ai product tasks after batch-126, prioritizing student session/auth bridge,
redacted request history/read-model work, and a dedicated local e2e spec task that is explicitly blocked until fresh
approval.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- product source, tests, and e2e edits during this seed task
- `package.json`, lockfiles, schema, migrations, env/secret, provider, deploy, payment, external-service, and formal
  generated-content write paths
- PR creation, force push, deployment, and Cost Calibration Gate execution

## Implementation Plan

1. Confirm git baseline on a clean short branch from `master`.
2. Register this docs/state-only seed task in `task-queue.yaml`.
3. Synchronize `project-state.yaml` to the current pre-seed checkpoint
   `67d1799e35ed88238644f2369c53590f3a5ef701`.
4. Append four serial tasks:
   - `batch-127-personal-learning-ai-student-session-auth-bridge`
   - `batch-128-personal-learning-ai-request-history-read-model`
   - `batch-129-personal-learning-ai-redacted-request-history-display`
   - `batch-130-personal-learning-ai-dedicated-local-e2e-spec`
5. Mark the first three implementation tasks with explicit allowedFiles/blockedFiles and local validation commands.
6. Mark the dedicated new e2e spec task as blocked until fresh approval because current standing e2e approval only covers
   running existing local specs.
7. Write evidence and audit review for the seed transaction.
8. Run local validation, commit, fast-forward merge to `master`, push `origin/master`, then delete the merged short
   branch.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId seed-next-personal-learning-ai-auth-flow-tasks -CandidateTaskId batch-127-personal-learning-ai-student-session-auth-bridge`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId seed-next-personal-learning-ai-auth-flow-tasks`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId seed-next-personal-learning-ai-auth-flow-tasks`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId seed-next-personal-learning-ai-auth-flow-tasks`

## Risk Controls

- This seed task is docs/state-only and does not touch student flow, UI, API, tests, or e2e files directly.
- API/UI/e2e implementation authority is deferred to the seeded task-specific allowedFiles/blockedFiles.
- New e2e spec authoring is not treated as covered by existing local e2e validation approval; it is seeded as blocked
  until fresh approval.
- Evidence records command names, pass/fail, counts, SHAs, and redacted summaries only.
- Cost Calibration Gate remains blocked.
