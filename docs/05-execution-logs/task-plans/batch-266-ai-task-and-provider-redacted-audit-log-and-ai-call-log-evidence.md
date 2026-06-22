# Task Plan: batch-266 AI Task Log Evidence References

## Scope

Close `batch-266-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence` by validating the existing redacted `audit_log` and `ai_call_log` evidence reference contracts.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/models/ai-generation-task-log-evidence-reference.ts`
- `src/server/services/ai-generation-task-log-evidence-reference-service.ts`
- `src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`

## Implementation Decision

Existing source already covers summary-only redacted references for `audit_log` and `ai_call_log`, explicit missing-reference states, retention-day metadata, and omission of internal or sensitive fixture fields.

No source edit is planned unless focused validation reveals a real coverage gap.

## Validation Plan

1. Run pre-work and pre-edit readiness.
2. Run the pre-edit seed readiness gate for batch 266.
3. Run `npm.cmd run test:unit -- src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`.
4. Run lint, typecheck, Prettier, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness.
5. Record evidence and audit with command/result summaries only.

## Boundaries

- No Provider/model calls.
- No env/secret reads or writes.
- No schema, migration, seed, database connection, or database mutation.
- No package or lockfile changes.
- No browser/e2e/dev-server runtime.
- No deployment, PR, force push, payment, external service, `org_auth` runtime change, raw prompt, raw generated AI content, raw employee answer, full paper content, or Cost Calibration Gate execution.
