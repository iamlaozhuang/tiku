# Task Plan: batch-244 ai-task-and-provider lifecycle contract

## Scope

- Task id: `batch-244-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`.
- Branch: `codex/batch-244-ai-task-lifecycle-contract`.
- Target closure: provider-agnostic AI task lifecycle contracts.
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
2. Inspect existing lifecycle model, contract exposure, validator/service boundaries, and focused tests.
3. Prefer no `src` change when the existing implementation already covers the closure contract.
4. Run the focused local unit test for provider-agnostic lifecycle behavior.
5. Run lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
6. Close the task with redacted evidence, FF merge to `master`, push `origin/master`, and clean the merged short branch.

## Current Assessment

Existing local source appears to already cover the target closure:

- `src/server/models/ai-generation-task.ts` defines provider-agnostic status values, terminal statuses, retryable and non-retryable failure categories, transition effects, and provider boundary flags with provider/env/payload requirements set to `false`.
- `src/server/models/ai-generation-task.test.ts` asserts lifecycle status, transition behavior, failure category classification, and provider boundary output.

No product source edit is planned unless focused validation exposes a real gap.
