# Task Plan: batch-135-personal-learning-ai-next-persistence-seeding

## Scope

- Task id: `batch-135-personal-learning-ai-next-persistence-seeding`
- Branch: `codex/batch-135-personal-learning-ai-next-persistence-seeding`
- Task kind: `implementation_planning`
- Goal: seed the next personal-learning-ai task sequence after batch-134, without executing product implementation.
- Fresh approval: user approved the docs-only decomposition and emphasized that task splitting must not omit work or
  mis-scope boundaries.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-134-personal-learning-ai-ui-initial-history-fetch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-134-personal-learning-ai-ui-initial-history-fetch.md`

## Verified Facts

- Current git baseline is `ee316358b15cbd5010c544ffb1406661dfb0f0e3` on `master` and `origin/master`.
- Worktree was clean and there were no local or remote `codex/*` branches before batch-135 branch creation.
- `GET /api/v1/personal-ai-generation-requests` currently returns a session-owned standard empty history list.
- The student `/ai-generation` UI now performs an initial GET history fetch and displays redacted history states.
- Existing schema includes `ai_call_log`, `model_provider`, `model_config`, and `prompt_template`; no dedicated
  `ai_generation_task` persistence schema is currently present.
- Personal AI requirements prohibit automatic writes to formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, and `mistake_book`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-135-personal-learning-ai-next-persistence-seeding.md`

## Blocked Files And Capabilities

- Blocked files: `.env*`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `drizzle/**`,
  `playwright-report/**`, and `test-results/**`.
- Blocked capabilities: product implementation, schema/migration execution, dependency changes, provider calls,
  env/secret changes, deploy, payment, external-service, generated-content writes, authorization model changes, PR,
  force-push, and Cost Calibration Gate execution.

## Seeding Approach

Seed an ordered sequence that separates review boundaries:

1. Schema/migration approval gate.
2. Local schema/migration task for AI task persistence.
3. Repository and redacted mapper task.
4. GET route repository integration.
5. POST route persistence/idempotency integration.
6. Student UI server-backed history refetch after submit.
7. Persistent history security/redaction review.
8. Local role-flow validation.
9. Personal generated-content domain blocked gate.
10. Provider/env/dependency/Cost Calibration blocked gate.

## Risk Defenses

- Use `freshApprovalRequired` on high-risk gates.
- Keep schema/migration separate from repository and route code.
- Keep provider/env/dependency/cost work separate from local persistence.
- Keep generated-content domain decisions separate from formal content domains.
- Keep all evidence redacted and free of secrets, tokens, provider payloads, raw prompts, raw answers, raw generated
  content, full `paper` content, and internal numeric ids.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Scoped formatting:
  `node .\node_modules\prettier\bin\prettier.cjs --write ...`
  `node .\node_modules\prettier\bin\prettier.cjs --check ...`
- Required anchor check:
  `Select-String` for batch-136 through batch-145, `freshApprovalRequired`, and blocked-gate statements.
- Broad gates required by user baseline:
  `npm.cmd run lint`
  `npm.cmd run typecheck`
  `npm.cmd run test:unit`
  `npm.cmd run build`
  `git diff --check`
- Module Run v2:
  `Test-ModuleRunV2PreCommitHardening.ps1`
  `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
  `Test-ModuleRunV2PrePushReadiness.ps1`

## Stop Conditions

- Any required task boundary cannot be represented with concrete allowedFiles or blockedFiles.
- Any seeded task would imply provider/env/schema/dependency/deploy/payment/external-service/Cost Calibration execution
  without fresh approval.
- Any validation or evidence would require recording sensitive data.
