# Phase 20 Fix RA-05-05 Resource Enable Restore State Plan

**Task id:** `phase-20-fix-ra-05-05-resource-enable-restore-state`

**Branch:** `codex/phase-20-fix-ra-05-05-resource-enable-restore-state`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Scope

- Add local-only resource enable/restore behavior for disabled resources.
- Preserve existing publish, rebuild, disable, retrieval, and audit behavior.
- Add illegal transition matrix coverage for the resource lifecycle.
- Keep the change inside allowed files: `src/**`, `tests/**`, `e2e/**`, task plan, evidence, and agent state.

## Risk Boundaries

- No `.env.local` or `.env.example` access or edits.
- No dependency, package manifest, or lockfile changes.
- No schema, migration, Drizzle, staging, prod, cloud, deploy, provider, or destructive data operations.
- If implementation proves impossible without a schema/migration or external provider boundary, stop and record blocked evidence instead of implementing.

## Implementation Approach

1. Add tests that describe the missing enable/restore behavior and full transition matrix.
2. Implement local resource restoration by using the existing `disabledFromStatus` catalog field and the existing resource transition guard.
3. Add a publicId-safe REST action under `/api/v1/resources/{publicId}/enable`.
4. Add UI/service test coverage only where required for the lifecycle contract; defer broader ops-admin browser proof to RA-06-06.
5. Run focused unit tests, full unit tests, e2e, readiness, naming, diff check, and quality gate.

## Residual Gap Policy

- This task can close RA-05-05 only for local resource lifecycle behavior and transition coverage.
- Persistent `ops_admin` browser evidence remains RA-06-06 scope unless it is naturally covered by this task without auth model changes.
