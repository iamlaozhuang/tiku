# Task Plan: phase-11-staging-entry-admin-audit-navigation

## Task

- Task id: `phase-11-staging-entry-admin-audit-navigation`
- Branch: `codex/phase-11-staging-entry-admin-audit-navigation`
- Date: 2026-05-24
- Goal: fix `LPR-RP-002` by routing the admin shell audit navigation to the existing `/ops/ai-audit-logs` page instead of the missing `/ops/audit-logs` page.

## Human Approval

The user explicitly requested continuing to fix all issues found by the local product readiness role-play, with final merge and push to `origin/master`.

This task remains local dev only. It does not approve staging/prod connection, deployment, cloud resource changes, secret/env changes, package or lockfile changes, schema/migration changes, or provider calls.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-fix-scope.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-admin-audit-navigation.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-admin-audit-navigation.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/app/(admin)/**`
- `src/features/admin/**`
- `tests/unit/**`
- `e2e/**`

Blocked files remain blocked: package/lock files, `.env.*`, `drizzle/**`, and `scripts/**`.

## TDD Plan

1. Add a failing unit test asserting the admin shell audit link points to `/ops/ai-audit-logs`.
2. Add a focused browser test asserting the shell audit navigation reaches `/ops/ai-audit-logs` and does not hit `/ops/audit-logs`.
3. Update the admin shell menu target only.
4. Run task-specific and full quality gates, then write evidence.

## Risk Controls

- Do not change API routes or audit-log runtime behavior.
- Do not alter auth/session behavior in this task.
- Do not record local tokens or Authorization headers in evidence.
- Keep the change scoped to navigation correctness for `LPR-RP-002`.
