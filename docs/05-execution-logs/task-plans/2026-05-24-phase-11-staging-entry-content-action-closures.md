# Task Plan: phase-11-staging-entry-content-action-closures

## Task

- Task id: `phase-11-staging-entry-content-action-closures`
- Branch: `codex/phase-11-staging-entry-content-action-closures`
- Date: 2026-05-24
- Goal: close or explicitly scope `LPR-RP-004` so content admin primary actions are no longer enabled dead ends in local dev.

## Human Approval

The user explicitly approved continuing to fix all local role-play findings after prior Phase 11 staging-entry fixes were merged and pushed to `origin/master`.

This task remains local dev only. It does not approve staging/prod connection, deployment, cloud resource changes, secret/env changes, package or lockfile changes, schema/migration changes, scripts, or provider calls.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-fix-scope.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-content-action-closures.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-content-action-closures.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/app/(admin)/content/**`
- `src/features/admin/**`
- `tests/unit/**`
- `e2e/**`

Blocked files remain blocked: package/lock files, `.env.*`, `drizzle/**`, and `scripts/**`.

## Investigation And TDD Plan

1. Reproduce content-admin primary action behavior on `/content/questions`, `/content/materials`, `/content/papers`, and `/content/knowledge-nodes`.
2. Add focused tests proving currently enabled dead-end actions are unacceptable.
3. Prefer minimal explicit unavailable states for out-of-scope mutations over wiring full create/edit workflows in this task.
4. Keep list/read/filter behavior untouched.
5. Verify content pages render no dead-end enabled primary actions: an action must either navigate/open a reachable UI state or be visibly disabled/unavailable with explanatory status.

## Risk Controls

- Do not record credentials, tokens, Authorization headers, raw content bodies, full material/paper/OCR text, raw prompt, raw answer, or raw model response.
- Do not change backend schema, routes, package files, dependencies, or cloud/staging/prod configuration.
- Keep fixes in admin content UI surfaces and tests only unless existing feature components require a narrow shared adjustment.
