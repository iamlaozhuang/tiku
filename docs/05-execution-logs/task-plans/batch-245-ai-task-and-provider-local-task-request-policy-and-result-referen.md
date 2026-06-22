# Task Plan: batch-245 ai-task-and-provider request policy contract

## Scope

- Task id: `batch-245-ai-task-and-provider-local-task-request-policy-and-result-referen`.
- Branch: `codex/batch-245-ai-task-request-policy`.
- Target closure: local task request policy and result reference contracts.
- Validation profile: `L2-local-implementation`.

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

## Implementation Plan

1. Run the auto-seed readiness gate for this candidate after plan materialization.
2. Inspect existing request policy model, contract, validator, service, and focused tests.
3. Prefer no `src` change when the existing implementation already covers local request decisions and result reference redaction.
4. Run the focused local unit tests for request policy and result reference behavior.
5. Run lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
6. Close the task with redacted evidence, FF merge to `master`, push `origin/master`, and clean the merged short branch.

## Current Assessment

Existing local source appears to already cover the target closure:

- `src/server/models/ai-generation-task-request.ts` defines create/reuse/reject decisions, request failure categories, idempotent reuse, authorization ownership boundaries, and result reference public id rules.
- `src/server/services/ai-generation-task-request-service.ts` maps local request policy into standard `{ code, message, data }` responses with summary-only redacted result references.
- `src/server/services/ai-generation-task-request-service.test.ts` verifies accepted personal requests, duplicate idempotent reuse, deterministic rejection, caller-supplied result reference suppression, and organization authorization boundary behavior.

No product source edit is planned unless focused validation exposes a real gap.
