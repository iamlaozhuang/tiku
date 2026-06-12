# Task Plan: seed-next-personal-learning-ai-product-tasks

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent personal-learning-ai evidence and audit reviews for batches 119-122.
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- Existing personal AI generation route, service, local browser experience, and redacted ai_call_log reference anchors.

## Goal

Register the next personal-learning-ai product task batch as small, serial, independently reviewable tasks before any
product implementation resumes.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- product source, tests, and e2e edits during this seed task
- package or lockfile changes
- schema, migration, env, provider, deploy, payment, external-service, and formal generated-content write paths
- PR creation, force push, and Cost Calibration Gate execution

## Implementation Plan

1. Confirm git baseline on `master` and create `codex/seed-next-personal-learning-ai-product-tasks`.
2. Record seed task state and synchronize repository accepted-ancestor checkpoint to the current pre-seed baseline
   `01788105fc4c43f0b3946a17444660a3bd3ce902`.
3. Append the docs/state-only seed task to `task-queue.yaml`.
4. Append four serial pending tasks:
   - `batch-123-personal-learning-ai-api-route-local-contract-bridge`
   - `batch-124-personal-learning-ai-student-local-request-entry-ui`
   - `batch-125-personal-learning-ai-redacted-reference-display-integration`
   - `batch-126-personal-learning-ai-local-browser-flow-e2e-validation`
5. For route, UI, and e2e tasks, explicitly name allowed files and blocked high-risk surfaces in the queue.
6. Write evidence and audit review for the seed transaction.
7. Run local validation, commit, fast-forward merge to `master`, push `origin master`, then delete the merged short branch.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId seed-next-personal-learning-ai-product-tasks -CandidateTaskId batch-123-personal-learning-ai-api-route-local-contract-bridge`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId seed-next-personal-learning-ai-product-tasks`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId seed-next-personal-learning-ai-product-tasks`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId seed-next-personal-learning-ai-product-tasks`

## Risk Controls

- The seed task is docs/state-only.
- UI/e2e/API route implementation is only authorized through later task-specific allowedFiles.
- Evidence records only command summaries and public task ids.
- Cost Calibration Gate remains blocked.
