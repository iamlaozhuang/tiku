# Task Plan: batch-162-personal-learning-ai-implementation-queue-seeding

## Scope

- Task: `batch-162-personal-learning-ai-implementation-queue-seeding`
- Branch: `codex/batch-162-personal-learning-ai-implementation-queue-seeding`
- Baseline: `1f12ccc35a7b2f540a62503de39d70a475c86434`
- Task kind: docs-only queue seeding.

## Readiness

- Re-read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, ADR files, `project-state.yaml`,
  `task-queue.yaml`, and batch-161 evidence/audit before edits.
- Confirmed current branch was `master`, worktree was clean, and local/remote `codex/*` branches were absent.
- Created short branch `codex/batch-162-personal-learning-ai-implementation-queue-seeding`.
- Ran pre-edit readiness on the short branch before editing.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-162-personal-learning-ai-implementation-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-162-personal-learning-ai-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-162-personal-learning-ai-implementation-queue-seeding.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, package and lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, migration, `drizzle/**`,
  materials, generated-content paths, and Playwright artifacts remain blocked for this task.
- Dependency install, env/secret work, provider adapter implementation, provider calls, local sandbox execution,
  generated-content persistence, API/UI implementation, e2e changes, staging/prod/cloud, deploy, payment,
  external-service, PR, force-push, and Cost Calibration remain blocked.

## Implementation Plan

1. Add batch-162 as the docs-only seeding task and close it with evidence.
2. Seed blocked batch-163 through batch-169 implementation tasks.
3. Keep each future task narrowly scoped with explicit dependencies, allowedFiles, blockedFiles, and
   freshApprovalRequired text.
4. Update project handoff to say the next action is task-specific approval for one blocked batch-163+ task.

## Validation Plan

- Scoped Prettier check for the five allowed files.
- `git diff --check`
- Required anchor check for blocked batch-163+ tasks, dependency block, provider/env/secret block, and Cost Calibration
  block.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1`
