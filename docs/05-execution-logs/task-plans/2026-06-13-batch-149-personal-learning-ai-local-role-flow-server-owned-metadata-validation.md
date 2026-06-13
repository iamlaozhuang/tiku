# Task Plan: batch-149-personal-learning-ai-local-role-flow-server-owned-metadata-validation

## Scope

- Task id: `batch-149-personal-learning-ai-local-role-flow-server-owned-metadata-validation`
- Branch: `codex/batch-149-personal-learning-ai-local-role-flow-server-owned-metadata-validation`
- Task kind: `local_verification`
- Goal: run the queued existing local personal AI generation e2e role-flow validation after server-owned metadata
  hardening and security review.
- Baseline SHA: `bd8d42b35e69b432c6539d6ca914d52a08d5483e`

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md`
- Existing e2e spec path from the queue: `e2e/personal-ai-generation-local-request.spec.ts`

## Approval Boundary

- The current queue approves running only `npm.cmd run test:e2e -- --list` and
  `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`.
- Allowed writes are limited to project state, task queue, this task plan, evidence, and audit review.
- This task must not edit source, tests, e2e specs, schema/migration, dependencies, env/secret, provider configuration,
  generated-content paths, deploy, payment, external-service, PR, force-push, or Cost Calibration surfaces.
- Any Playwright-generated local artifacts must remain uncommitted and be removed after verifying they are inside the
  repository workspace.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- Module Run v2 pre-commit, module closeout, and pre-push readiness.

## Stop Conditions

- The e2e validation requires editing source, tests, e2e specs, env/secret, schema/migration, dependencies, provider
  config, generated-content paths, deploy, payment, external-service, PR, force-push, or Cost Calibration surfaces.
- The e2e validation attempts to run broader e2e coverage than the queued list and single existing spec.
