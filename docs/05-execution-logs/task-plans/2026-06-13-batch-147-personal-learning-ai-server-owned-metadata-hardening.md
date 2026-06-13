# Task Plan: batch-147-personal-learning-ai-server-owned-metadata-hardening

## Scope

- Task id: `batch-147-personal-learning-ai-server-owned-metadata-hardening`
- Branch: `codex/batch-147-personal-learning-ai-server-owned-metadata-hardening`
- Task kind: `implementation`
- Goal: harden local personal AI request metadata so client-supplied result/evidence/reference metadata cannot become
  durable server metadata before provider or generated-content paths are enabled.
- Baseline SHA: `e7ca66af0186ca632d57553aaab319f5e245e0a1`

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-146-personal-learning-ai-next-seeding-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`
- Relevant source files under the batch-147 allowedFiles list.

## Verified Facts

- `batch-146` closed and pushed as `e7ca66af0186ca632d57553aaab319f5e245e0a1`.
- Worktree was clean before branch creation.
- Current POST persistence builds `CreatePersonalAiGenerationRequestInput` from request input and currently accepts
  `resultPublicId`, `evidenceStatus`, `citationCount`, and `aiCallLogPublicId` before writing the pending task.
- Existing route logic already normalizes `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId` from session user
  context.

## Approval Boundary

- The current user prompt approves this local source hardening only within queued allowedFiles.
- This task may add focused unit tests and implementation for local_contract_only metadata ownership.
- This task must not change the authorization permission model, call providers, configure providers, read/write env
  files, install dependencies, change package/lockfiles, execute e2e, change schema/migrations, write generated content,
  adopt formal content, deploy, touch payment/external-service surfaces, create a PR, force-push, or execute Cost
  Calibration.

## Allowed Files

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `src/server/services/ai-generation-task-request-service.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`
- `src/server/validators/ai-generation-task-request.ts`
- `src/server/validators/personal-ai-generation-request-flow.ts`
- `src/server/models/ai-generation-task-request.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `e2e/**`,
  `materials/**`, `paper_assets/**`, `playwright-report/**`, and `test-results/**`.
- Blocked capabilities: provider calls, provider configuration, env/secret work, dependency changes, schema/migration,
  e2e execution, generated-content persistence, formal content adoption, deploy, payment, external-service, PR,
  force-push, and Cost Calibration Gate execution.

## TDD Plan

1. Add a focused RED route test proving stale client-supplied result/evidence/reference metadata is not passed to
   `createOrReuseRequest` and is not echoed for a new local pending task.
2. Add any focused flow or task-request tests only if route-level hardening requires service-level support.
3. Implement the smallest route/service normalization needed to pass RED.
4. Re-run focused unit tests, then broad gates.

## Validation Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- RED/GREEN focused tests:
  `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
  `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`
  `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- Required anchor check for `server-owned metadata`, `client-supplied`, and `Cost Calibration Gate remains blocked`.
- Module Run v2 pre-commit, module closeout, and pre-push readiness.

## Stop Conditions

- The hardening requires schema/migration, dependency, env/secret, provider, e2e, generated-content persistence, formal
  content adoption, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- The implementation would need to alter the authorization permission model rather than keeping local request metadata
  conservative and server-owned.
- Evidence would need to record secrets, tokens, provider payloads, raw prompts, raw answers, raw generated content,
  full `paper` content, Authorization headers, database URLs, or database rows.
