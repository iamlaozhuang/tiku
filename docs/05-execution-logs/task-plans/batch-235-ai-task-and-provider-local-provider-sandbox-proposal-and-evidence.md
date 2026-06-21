# Task Plan: batch-235 ai-task-and-provider local provider sandbox proposal

## Scope

- Task id: `batch-235-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`.
- Branch: `codex/batch-235-ai-task-provider-local-sandbox-rules`.
- Target closure: local provider sandbox proposal and redacted evidence rules.
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
- local provider sandbox execution or real provider/model calls

## Implementation Plan

1. Run the auto-seed readiness gate for this candidate after plan materialization.
2. Inspect existing provider sandbox proposal model, contract, validator, service, and focused tests.
3. Prefer no `src` change when the existing implementation already covers proposal-only runtime behavior, local-only gating, redacted evidence rules, and high-risk blocking.
4. Run the focused local unit test for provider sandbox proposal behavior.
5. Run lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
6. Close the task with redacted evidence, FF merge to `master`, push `origin/master`, and clean the merged short branch.

## Current Assessment

Existing local source appears to already cover the target closure:

- `src/server/models/ai-generation-task-provider-sandbox-proposal.ts` defines proposal-only runtime status, approval decisions, high-risk blocked reasons, allowed metadata, forbidden evidence, and a blocked Cost Calibration status.
- `src/server/contracts/ai-generation-task-provider-sandbox-proposal-contract.ts` exposes a DTO with summary-only evidence rules and no provider payload fields.
- `src/server/validators/ai-generation-task-provider-sandbox-proposal.ts` rejects invalid proposal input and requires a log reference without reading env or provider configuration.
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.ts` returns the standard `{ code, message, data }` API response.
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts` verifies proposal-only behavior, explicit local sandbox approval without provider execution, redacted evidence metadata, high-risk proposal blocking, and invalid input rejection.

No product source edit is planned unless focused validation exposes a real gap.
