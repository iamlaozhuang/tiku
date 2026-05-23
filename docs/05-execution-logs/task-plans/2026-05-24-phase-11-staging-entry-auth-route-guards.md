# Task Plan: phase-11-staging-entry-auth-route-guards

## Task

- Task id: `phase-11-staging-entry-auth-route-guards`
- Branch: `codex/phase-11-staging-entry-auth-route-guards`
- Date: 2026-05-24
- Goal: fix `LPR-RP-001` by preventing unauthenticated local users from rendering protected student, admin, and content route shells.

## Human Approval

The user explicitly approved starting `phase-11-staging-entry-auth-route-guards` after merging and pushing `phase-11-staging-entry-fix-scope` to `origin/master`.

This approval is limited to local dev route-guard implementation, tests, browser verification, state/queue updates, and evidence. It does not approve staging/prod connection, deployment, cloud resource changes, secret/env changes, package or lockfile changes, schema/migration changes, or provider calls.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-fix-scope.md`

## Allowed Files

Use only the task queue allowlist:

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-auth-route-guards.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-auth-route-guards.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/**`
- `tests/**`
- `e2e/**`

Blocked files remain blocked: `package.json`, lockfiles, `.env.example`, `.env.local`, `drizzle/**`, and `scripts/**`.

## Implementation Plan

1. Add a failing unit test for protected route guard behavior:
   - no local session token redirects to `/login`;
   - protected layout chrome and children are not rendered before auth passes;
   - valid student/admin sessions allow the corresponding route shell to render;
   - wrong role or unauthorized session redirects without exposing the token.
2. Implement a shared client-side route guard component used by `(student)` and `(admin)` layouts.
3. Validate role-specific session context through `/api/v1/sessions` using the local session token:
   - student routes require a non-null `userType`;
   - admin/content routes require `adminPublicId` and at least one `adminRoles` item.
4. Keep fallback UI explicit and token-safe while validation is pending or rejected.
5. Run unit, quality, build, naming, task-claim, git-completion, docker, and browser route checks; write redacted evidence.

## Risk Controls

- No secret reads or outputs; do not inspect `.env.local`.
- Do not record Authorization headers or session token values in evidence.
- Do not change dependencies, lockfiles, database schema, migrations, scripts, staging/prod configuration, or cloud resources.
- Keep the fix local to route guarding and tests; do not address other role-play P1/P2 findings in this task.
- Preserve existing REST session contract and API response envelope.

## Expected Staging Decision

If protected local route shells no longer render for unauthenticated users and validation passes, `LPR-RP-001` can move from `P0 block_staging_entry_until_fixed_or_explicitly_downgraded` to `fixed_for_local_staging_entry_candidate`. Other P1/P2 findings remain out of scope.
