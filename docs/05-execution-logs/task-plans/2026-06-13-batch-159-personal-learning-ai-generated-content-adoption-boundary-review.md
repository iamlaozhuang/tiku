# Task Plan: batch-159-personal-learning-ai-generated-content-adoption-boundary-review

## Scope

- Task: `batch-159-personal-learning-ai-generated-content-adoption-boundary-review`
- Branch: `codex/batch-159-personal-learning-ai-generated-content-adoption-boundary-review`
- Baseline: `407ffab1803c897cc60f51f417d96a442152a027`
- Task kind: docs-only security review.

## Readiness

- Re-read `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml` from
  `master` after batch-158 was merged and pushed.
- Confirmed current worktree was clean and no local or remote `codex/*` branch remained before claiming batch-159.
- Ran pre-edit readiness on the short branch before creating this plan.

## Normative Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-158-personal-learning-ai-provider-env-secret-gate-docs.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-159-personal-learning-ai-generated-content-adoption-boundary-review.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-159-personal-learning-ai-generated-content-adoption-boundary-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-159-personal-learning-ai-generated-content-adoption-boundary-review.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, package and lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, migration, `drizzle/**`,
  materials, generated-content paths, and Playwright artifacts remain blocked.
- Provider calls, provider configuration, env/secret work, generated-content writes, formal content adoption,
  staging/prod/cloud, deploy, payment, external-service, PR, force-push, and Cost Calibration remain blocked.

## Implementation Plan

1. Record a docs-only security review that separates personal AI results from formal content domains.
2. Record future adoption governance requirements for any path that would adopt personal AI results into formal
   `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` flows.
3. Record evidence redaction requirements so future evidence does not expose prompt input, provider payloads, secrets,
   provider responses, or raw generated output.
4. Close the queue item and update project handoff to point to batch-160.

## Validation Plan

- Scoped Prettier check for the five allowed files.
- `git diff --check`
- Required anchor check for personal AI results, formal adoption blocked, generated-content writes blocked, and Cost
  Calibration blocked.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1`
