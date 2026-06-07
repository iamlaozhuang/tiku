# Task Plan: phase-11-staging-entry-known-limitations

## Task

- Task id: `phase-11-staging-entry-known-limitations`
- Branch: `codex/phase-11-staging-entry-known-limitations`
- Date: 2026-05-24
- Goal: close Phase 11 remaining P2 staging-entry findings by recording explicit known limitations and acceptance boundaries.

## Human Approval

The user explicitly approved continuing to fix or close all local role-play findings after prior Phase 11 staging-entry fixes were merged and pushed to `origin/master`.

This task is docs-only. It does not approve source changes, staging/prod connection, deployment, cloud resource changes, secret/env changes, package or lockfile changes, schema/migration changes, scripts, or provider calls.

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

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-known-limitations.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-known-limitations.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-known-limitations.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files include package/lock files, `.env.*`, `src/**`, `drizzle/**`, and `scripts/**`.

## Documentation Plan

1. Reconcile all remaining Phase 11 role-play findings after P0/P1 fixes:
   - `LPR-RP-005` student missing-object error states;
   - `LPR-RP-006` resource write operations outside first staging scope;
   - `LPR-RP-007` organization and redeem code write operations outside first staging scope.
2. Record each limitation with severity, staging decision, owner, acceptance boundary, and what would trigger a future implementation task.
3. Ensure the document clearly states that P0/P1 blockers were fixed and that the remaining P2 items are accepted limitations rather than untracked defects.
4. Validate with agent readiness, quality gate, and git completion readiness.

## Evidence Hygiene

- Do not record credentials, tokens, Authorization headers, raw provider payloads, raw prompt, raw answer, raw model response, full paper/material/OCR text, or customer/private data.
- Keep evidence to status, file paths, command results, and bounded finding identifiers.
