# Task Plan: batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate

## Scope

- Task: `batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate`
- Branch: `codex/batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate`
- Baseline: `440db7d6513ee4380faeb514dd56c407c7e253f7`
- Task kind: docs-only blocked gate.

## Readiness

- Re-read `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml` from
  `master` after batch-159 was merged and pushed.
- Confirmed current worktree was clean and no local or remote `codex/*` branch remained before claiming batch-160.
- Ran pre-edit readiness on the short branch before creating this plan.

## Normative Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-159-personal-learning-ai-generated-content-adoption-boundary-review.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-160-personal-learning-ai-local-provider-sandbox-plan-blocked-gate.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, package and lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, migration, `drizzle/**`,
  materials, generated-content paths, and Playwright artifacts remain blocked.
- Running a sandbox, provider calls, provider configuration, env/secret work, dependency changes, generated-content
  writes, formal content adoption, staging/prod/cloud, deploy, payment, external-service, PR, force-push, and Cost
  Calibration remain blocked.

## Implementation Plan

1. Record local provider sandbox boundaries without running a sandbox or calling providers.
2. Record redacted evidence requirements for any future approved sandbox.
3. Record no-formal-write controls that prevent sandbox output from becoming formal `question`, `paper`, `practice`,
   `mock_exam`, `exam_report`, or `mistake_book` records.
4. Record that future cost measurement and Cost Calibration require separate fresh approval.
5. Close the queue item and update project handoff to point to batch-161.

## Validation Plan

- Scoped Prettier check for the five allowed files.
- `git diff --check`
- Required anchor check for local provider sandbox blocked, redacted evidence, no formal write, and Cost Calibration
  blocked.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1`
