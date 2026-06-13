# Task Plan: batch-148-personal-learning-ai-server-owned-metadata-security-review

## Scope

- Task id: `batch-148-personal-learning-ai-server-owned-metadata-security-review`
- Branch: `codex/batch-148-personal-learning-ai-server-owned-metadata-security-review`
- Task kind: `security_review`
- Goal: review the persistent request history and server-owned metadata boundary after batch-147 hardening.
- Baseline SHA: `2368b3795858392a000bb3e00690da96309bbfb0`

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md`
- Relevant read-only source and test files for the personal AI request route, flow read model, local browser
  experience, and persistent history repository.

## Approval Boundary

- The current queue approves docs-only/read-only security review for product code.
- Allowed writes are limited to project state, task queue, this task plan, evidence, and audit review.
- This task must not edit source, tests, e2e, schema/migration, dependencies, env/secret, provider configuration,
  generated-content paths, deploy, payment, external-service, PR, force-push, or Cost Calibration surfaces.

## Review Plan

1. Confirm batch-147 closed and master/origin/master baseline is clean.
2. Read the changed batch-147 implementation and the supporting read-model/repository files.
3. Check whether client-owned metadata can still become durable result/evidence/reference metadata for new local
   pending tasks.
4. Check whether history responses expose public IDs only and keep raw generated content/provider payloads out of the
   local contract.
5. Check whether provider and formal generated-content paths remain blocked by queue and code surface.
6. Record findings and residual risks in docs-only evidence and audit files.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Required anchor check for `server-owned metadata`, `public ids only`, `ai_call_log`, and
  `Cost Calibration Gate remains blocked`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- Module Run v2 pre-commit, module closeout, and pre-push readiness.

## Stop Conditions

- The review identifies a blocking product-code vulnerability that requires source changes; that must be queued as a
  separate implementation task.
- The review would require env/secret reads, provider calls, generated-content writes, schema/migration, dependency
  changes, e2e execution, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
