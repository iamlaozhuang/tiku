# Task Plan: fix-agent-state-hygiene-after-batch-126

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent evidence and audit reviews for:
  - `2026-06-12-batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`
  - `2026-06-12-batch-122-personal-learning-ai-redacted-ai-call-log-reference`
  - `2026-06-12-fix-project-state-sha-sync-after-batch-122`
  - `2026-06-12-seed-next-personal-learning-ai-product-tasks`
  - `2026-06-12-batch-126-personal-learning-ai-local-browser-flow-e2e-validation`

## Goal

Synchronize durable mechanism state after batch-126 by updating repository checkpoints to the current real
`master`/`origin/master` baseline and closing stale `runStatus` values for batch-121 and batch-122 when evidence proves
those tasks already closed.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- product source, tests, and e2e edits
- `package.json`, lockfiles, schema, migrations, env/secret, provider, deploy, payment, and external-service work
- formal generated-content write paths
- PR creation, force push, deployment, and Cost Calibration Gate execution

## Implementation Plan

1. Confirm git baseline on a clean short branch from `master`.
2. Register this docs/state-only governance repair task in `task-queue.yaml` with explicit allowed and blocked files.
3. Update `project-state.yaml` repository checkpoints from the stale accepted ancestor to the current real
   `master`/`origin/master` SHA `22c238b6e400d8b554b965c5178ceeda544302c5`.
4. Update `project-state.yaml` current task and handoff metadata to this governance repair.
5. Change only batch-121 and batch-122 `registryLifecycle.runStatus` from `active` to `closed`, because their paired
   evidence and audit files show `status: closed`, `result: pass`, post-merge validation, and no blocking findings.
6. Write redacted evidence and audit review for the repair.
7. Run the required local validation gates, commit, fast-forward merge to `master`, push `origin/master`, and delete the
   merged short branch.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-agent-state-hygiene-after-batch-126`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-agent-state-hygiene-after-batch-126`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-agent-state-hygiene-after-batch-126`

## Risk Controls

- This task is docs/state-only and does not touch student flow, UI, API, test, or e2e surfaces; e2e is not applicable.
- The repair is limited to current checkpoint synchronization and two named historical runStatus fields.
- Evidence records command names, pass/fail, counts, SHAs, and redacted summaries only.
- Cost Calibration Gate remains blocked.
