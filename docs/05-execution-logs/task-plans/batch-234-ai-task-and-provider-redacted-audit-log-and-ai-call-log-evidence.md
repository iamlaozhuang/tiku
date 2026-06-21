# Task Plan: batch-234 ai-task-and-provider redacted log evidence

## Scope

- Task id: `batch-234-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`.
- Branch: `codex/batch-234-ai-task-provider-redacted-log-evidence`.
- Target closure: redacted `audit_log` and `ai_call_log` evidence references.
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

1. Run the auto-seed readiness gate for this candidate.
2. Inspect existing redacted log evidence model, contract, validator, service, and tests.
3. Prefer no `src` change when the existing implementation already covers redacted `audit_log` and `ai_call_log` reference behavior.
4. Run focused local unit tests for log evidence reference behavior.
5. Run lint, typecheck, diff check, closeout readiness, and pre-push readiness.
6. Close the task with redacted evidence, FF merge to `master`, push `origin/master`, and clean the merged short branch.

## Current Assessment

Existing local source appears to already cover the target closure:

- `src/server/models/ai-generation-task-log-evidence-reference.ts` defines redacted, summary-only log evidence reference items.
- `src/server/services/ai-generation-task-log-evidence-reference-service.ts` maps task result, `audit_log`, and `ai_call_log` references without exposing raw payloads.
- `src/server/services/ai-generation-task-log-evidence-reference-service.test.ts` verifies available/missing references, failed task behavior, and sensitive fixture omission.

No product source edit is planned unless focused validation exposes a real gap.
