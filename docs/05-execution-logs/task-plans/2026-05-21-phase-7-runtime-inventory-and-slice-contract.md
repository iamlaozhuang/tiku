# Phase 7 Runtime Inventory And Slice Contract Task Plan

## Task

- Task id: `phase-7-runtime-inventory-and-slice-contract`
- Branch: `codex/phase-7-runtime-inventory-and-slice-contract`
- Task type: documentation-only runtime inventory and contract hardening.
- Scope boundary: no runtime code, no business source changes, no schema or migration changes, no dependency changes.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Phase 7 planning evidence: `docs/05-execution-logs/evidence/2026-05-21-phase-7-local-runtime-readiness-planning.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-runtime-inventory-and-slice-contract.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-runtime-inventory-and-slice-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-runtime-inventory-and-slice-contract-security-review.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Run task claim preflight on the short-lived branch.
2. Inventory every `createUnavailable...` factory under `src/app` and `src/server`.
3. Map each factory and route group to one of:
   - `required_for_mvp_slice`
   - `mock_runtime_allowed`
   - `deferred_runtime`
   - `blocked_by_dependency_or_env`
   - split or confirmation risk.
4. Update `runtime-slice-contract.md` with executable route/service inventory, priorities, dependency order, and follow-up constraints.
5. Create a security review artifact covering auth, session, admin, audit, AI log, and authorization boundary risks introduced by the plan.
6. Update project state and task queue only within allowed files.
7. Run required validation commands and record command results in evidence.

## Risk Controls

- This task does not replace unavailable runtime services.
- Services that mix MVP-required reads with deferred writes must be split method-by-method in future tasks.
- Future runtime tasks must preserve public-id-only external URLs and the standard API response envelope.
- Mock AI runtime remains allowed only after redaction and `ai_call_log` write paths are explicit.
- Full CRUD, real provider, RAG ingestion, object storage, and bulk operations remain deferred unless a later queued task expands scope.
