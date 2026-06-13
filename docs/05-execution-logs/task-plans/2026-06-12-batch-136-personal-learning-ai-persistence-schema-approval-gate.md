# Task Plan: batch-136-personal-learning-ai-persistence-schema-approval-gate

## Scope

- Task id: `batch-136-personal-learning-ai-persistence-schema-approval-gate`
- Branch: `codex/batch-136-personal-learning-ai-persistence-schema-approval-gate`
- Task kind: `blocked_gate`
- Goal: record the persistence schema approval gate outcome for the future `batch-137` local schema/migration task.
- Fresh approval: user explicitly approved executing `batch-136-personal-learning-ai-persistence-schema-approval-gate`.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`

## Verified Facts

- Current git baseline is `d6256ac9c332c728895246809a312a1b843ac5f1` on `master` and `origin/master`.
- Worktree was clean and there were no local or remote `codex/*` branches before creating the batch-136 branch.
- `batch-135-personal-learning-ai-next-persistence-seeding` is closed and pushed.
- Batch-136 is docs-only and may not create schema, migrations, repository code, route wiring, UI behavior, e2e specs,
  provider calls, env changes, dependency changes, or generated content.
- Requirements say AI task status can be inspected without sensitive input/output and generated content must not create
  formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records by itself.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-136-personal-learning-ai-persistence-schema-approval-gate.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-136-personal-learning-ai-persistence-schema-approval-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-136-personal-learning-ai-persistence-schema-approval-gate.md`

## Blocked Files And Capabilities

- Blocked files: `.env*`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `drizzle/**`,
  `playwright-report/**`, and `test-results/**`.
- Blocked capabilities: schema/migration execution, repository implementation, route wiring, UI changes, e2e spec
  authoring, provider calls, env/secret changes, dependency changes, deploy, payment, external-service work, formal
  generated-content write paths, authorization model changes, PR, force-push, and Cost Calibration Gate execution.

## Approach

- Record that batch-136 approval covers the docs-only gate only.
- Record that local schema/migration execution remains blocked until `batch-137` receives its own fresh approval.
- Name `batch-137-personal-learning-ai-task-persistence-schema-migration` as the exact next schema task.
- Keep evidence redacted and free of secrets, tokens, provider payloads, raw prompts, raw answers, raw generated
  content, database rows, and internal numeric ids.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Scoped formatting:
  `node .\node_modules\prettier\bin\prettier.cjs --write ...`
  `node .\node_modules\prettier\bin\prettier.cjs --check ...`
- Required anchor check:
  `Select-String` for `schema/migration execution remains blocked`, `batch-137`, and `Cost Calibration Gate remains blocked`.
- Broad gates requested by user baseline:
  `npm.cmd run lint`
  `npm.cmd run typecheck`
  `npm.cmd run test:unit`
  `npm.cmd run build`
- Diff and Module Run v2:
  `git diff --check`
  `Test-ModuleRunV2PreCommitHardening.ps1`
  `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
  `Test-ModuleRunV2PrePushReadiness.ps1`

## Stop Conditions

- Any schema/migration, runtime, test, e2e, dependency, env/provider, deploy/payment/external-service, or generated
  content write becomes necessary.
- Evidence would need sensitive data.
- The gate wording would imply that batch-137 is already approved.
