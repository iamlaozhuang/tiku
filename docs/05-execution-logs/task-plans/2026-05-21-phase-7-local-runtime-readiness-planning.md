# Phase 7 Local Runtime Readiness Planning Task Plan

## Task

- Task id: `phase-7-local-runtime-readiness-planning`
- Branch: `codex/phase-7-local-runtime-readiness-planning`
- Task type: documentation, queue seeding, and mechanism hardening.
- Human instruction: persist the Phase 7 strategy in project documents, run a self-check, optimize the mechanism, then run another self-check.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest handoff evidence: `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-ops-readiness.md`

## Scope

This task is intentionally documentation-first. It does not connect runtime services, change `src/**`, change database schema, generate migrations, alter environment examples, or introduce dependencies.

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-local-runtime-readiness-planning.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-local-runtime-readiness-planning.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Persist the six layers:
   - Roadmap: add Phase 7 goals, non-goals, and acceptance gates.
   - Task queue: seed Phase 7 tasks with dependencies, scopes, risk types, and validation commands.
   - Project state: move handoff and current phase to Phase 7 planning.
   - Task plan: this file.
   - Evidence: record commands, self-checks, and residual risk.
   - Runtime slice contract: create a durable scope anchor for MVP runtime replacement.
2. Run the first self-check:
   - Confirm all six layers exist.
   - Confirm future task queue entries reference the runtime slice.
   - Confirm no blocked files changed.
3. Optimize mechanism:
   - Update `automation-loop.md` with a phase-transition persistence gate and Phase 7 runtime-readiness gate.
   - Update `Test-AgentSystemReadiness.ps1` so readiness checks include the runtime slice contract after it exists.
4. Run the second self-check:
   - Confirm the mechanism mentions all six persistence layers.
   - Confirm readiness script checks the runtime slice contract.
   - Confirm queue/state handoff points to the next runtime inventory task.
5. Run local validation commands and record evidence.

## Risk Controls

- No dependency changes are planned.
- No source, schema, migration, or env-example changes are planned.
- Runtime route inventory is documentation-only in this task.
- Future runtime tasks must pass security review when they touch auth, session, authorization, admin, schema, secret, audit, or AI logging behavior.
- The Phase 7 sequence starts with a runtime inventory task before replacing any unavailable services.
