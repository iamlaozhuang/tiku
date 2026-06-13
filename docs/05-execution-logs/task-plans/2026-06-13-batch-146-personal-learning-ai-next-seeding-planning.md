# Task Plan: batch-146-personal-learning-ai-next-seeding-planning

## Scope

- Task id: `batch-146-personal-learning-ai-next-seeding-planning`
- Branch: `codex/batch-146-personal-learning-ai-next-seeding-planning`
- Task kind: `implementation_planning`
- Goal: seed the next personal-learning-ai sequence after batch-145, without product source edits.
- Baseline SHA: `d9fb619cdd421b6e04601949a7d4966ee6c39895`

## Required Context Read

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
- `docs/05-execution-logs/evidence/2026-06-12-batch-137-personal-learning-ai-task-persistence-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-143-personal-learning-ai-local-role-flow-persistent-history-validation.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-145-personal-learning-ai-provider-env-cost-blocked-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-145-personal-learning-ai-provider-env-cost-blocked-gate.md`

## Verified Facts

- `master`, `HEAD`, and `origin/master` are all `d9fb619cdd421b6e04601949a7d4966ee6c39895`.
- The worktree was clean before branch creation.
- No local or remote `codex/*` branches existed after `git fetch --prune origin`.
- `task-queue.yaml` has no `batch-146+` entry.
- `batch-145-personal-learning-ai-provider-env-cost-blocked-gate` is closed with `result: pass`.
- The current local POST persistence path still accepts result/evidence/reference metadata from request input before
  writing a pending task; follow-up hardening must make those fields server-owned or explicitly validated before any
  provider or generated-content path is enabled.

## Approval Boundary

- The current user prompt approves low-risk docs-only seeding/planning.
- The current user prompt approves later local source hardening only when it is explicitly queued and constrained by
  allowedFiles/blockedFiles.
- This task does not approve provider calls, provider configuration, env/secret work, dependency/package/lockfile
  changes, schema/migration, local provider sandbox execution, generated-content writes, formal `question` or `paper`
  adoption, `practice`, `mock_exam`, `exam_report`, `mistake_book` writes, deploy, payment, external-service, PR,
  force-push, or Cost Calibration Gate execution.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-146-personal-learning-ai-next-seeding-planning.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-146-personal-learning-ai-next-seeding-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-146-personal-learning-ai-next-seeding-planning.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`,
  `src/db/schema/**`, `drizzle/**`, `materials/**`, `paper_assets/**`, `playwright-report/**`, and `test-results/**`.
- Blocked capabilities: dependency changes, provider calls, provider configuration, env/secret work, local provider
  sandbox, generated-content writes, formal content adoption, schema/migration, destructive DB, staging/prod/cloud,
  deploy, payment, external-service, PR, force-push, and Cost Calibration Gate execution.

## Seeding Approach

Seed an ordered follow-up sequence:

1. `batch-147`: local source hardening so client-supplied result/evidence/reference metadata cannot become durable
   server metadata for personal AI request history.
2. `batch-148`: security review of persistent history and server-owned metadata boundaries.
3. `batch-149`: existing local e2e role-flow validation for the hardened request/history flow.
4. `batch-150`: docs-only blocked gate refinement for provider/env/dependency/local provider sandbox/Cost Calibration.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Scoped docs/state formatting:
  `node .\node_modules\prettier\bin\prettier.cjs --write <changed docs/state files>`
- Scoped formatting check:
  `node .\node_modules\prettier\bin\prettier.cjs --check <changed docs/state files>`
- Anchor check for `batch-147`, `batch-148`, `batch-149`, `batch-150`, `server-owned metadata`, and `Cost Calibration Gate remains blocked`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-146-personal-learning-ai-next-seeding-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-146-personal-learning-ai-next-seeding-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-146-personal-learning-ai-next-seeding-planning`

## Stop Conditions

- Any seeded task requires dependency, schema/migration, env/secret, provider, deploy, payment, external-service, formal
  generated-content write, or Cost Calibration execution.
- Any seeded task cannot define concrete allowedFiles, blockedFiles, dependencies, and validation commands.
- Any evidence would need secrets, tokens, provider payloads, raw prompts, raw answers, raw generated content, full
  `paper` content, cleartext `redeem_code`, Authorization headers, or database rows.
