# Task Plan: batch-236 personal-learning-ai personal generation request flow

## Scope

- Task id: `batch-236-personal-learning-ai-personal-generation-request-flow`.
- Branch: `codex/batch-236-personal-learning-ai-request-flow`.
- Target closure: personal generation request flow.
- Validation profile: `L5-local-implementation`.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Allowed Files

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- provider/env/dependency/schema/deploy/payment/PR/force-push/Cost Calibration Gate work
- real provider/model calls

## Implementation Plan

1. Run the auto-seed readiness gate for this candidate after plan materialization.
2. Inspect existing request-flow model, contract, validator, service, and focused tests.
3. Prefer no `src` change when existing implementation covers accepted personal request flow, idempotent reuse, blocked request behavior, context selection, redacted request/result references, and non-personal boundary rejection.
4. Run the focused local unit test for request-flow behavior.
5. Run lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
6. Close the task with redacted evidence, FF merge to `master`, push `origin/master`, and clean the merged short branch.

## Current Assessment

Existing local source appears to already cover the target closure:

- `src/server/models/personal-ai-generation-request-flow.ts` defines accepted/reused/blocked flow status and personal authorization boundary checks.
- `src/server/contracts/personal-ai-generation-request-flow-contract.ts` exposes the composed request, context, task request, and result reference DTO.
- `src/server/validators/personal-ai-generation-request-flow.ts` normalizes request and task policy input while rejecting non-personal boundaries.
- `src/server/services/personal-ai-generation-request-flow-service.ts` composes standard `{ code, message, data }` responses without provider execution.
- `src/server/services/personal-ai-generation-request-flow-service.test.ts` verifies accepted flow, mock_exam context selection, idempotent reuse, quota-blocked behavior, redacted references, and invalid boundary rejection.

No product source edit is planned unless focused validation exposes a real gap.
