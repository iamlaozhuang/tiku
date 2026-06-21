# Edition-aware authorization UI context packet

## Scope

- Task id: `edition-aware-authorization-ui-context-packet`
- Branch: `codex/edition-auth-ui-context-packet`
- Fresh approval: current user prompt on 2026-06-21 approves this packet after schema, API, and service packets are closed.
- This packet is limited to student/admin UI context display, client service shaping, hooks/components, and focused UI/unit tests.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`

## Allowed Files

- `src/features/student/profile/**`
- `src/features/admin/org-auth-redeem/**`
- `src/features/admin/admin-ops-management/**`
- `src/features/student/studentRuntimeApi.ts`
- `src/app/(student)/profile/**`
- `src/app/(student)/redeem-code/**`
- `src/app/(admin)/ops/redeem-codes/**`
- `src/app/(admin)/ops/users/**`
- `src/app/(admin)/ops/organizations/**`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No `src/db/schema/**`, `drizzle/**`, `src/server/**`, `src/app/api/**`, `e2e/**`, `scripts/**`, reports, dependency, provider, payment, deploy, PR, force-push, destructive DB, DB migration apply, or Cost Calibration Gate.
- No design token changes or unrelated UI expansion.
- UI visibility is not an authorization boundary.

## Implementation Plan

1. Materialize packet fresh approval in docs/state and record this plan before product code.
2. Run existing focused UI/unit tests to determine whether current implementation already satisfies the edition-aware UI context.
3. If coverage is missing, add minimal tests in allowed test files and implement only allowed UI/client-service changes.
4. Keep server/API/repository changes out of this packet.
5. Run focused tests, lint, typecheck, `git diff --check`, hardening, closeout readiness, and pre-push readiness.
6. Commit, FF merge to `master`, push `origin/master`, delete merged short branch, then run stage-end status commands.

## Risk Controls

- No new dependencies or token changes.
- No e2e/browser runtime in this packet.
- Evidence records UI state names and pass/fail only.
