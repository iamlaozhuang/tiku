# Phase 20 Fix RA-06-09 Paper Admin Lifecycle Gap Completion Plan

## Task

- Task id: `phase-20-fix-ra-06-09-paper-admin-lifecycle-gap-completion`
- Branch: `codex/phase-20-fix-ra-06-09-paper-admin-lifecycle-gap-completion`
- Scope: implementation
- Human approval: 2026-05-28 user approved local UI/runtime/test/evidence implementation for the paper admin lifecycle gap completion task.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md`

## Approval Boundary

Allowed:

- Create and use the short-lived branch named above.
- Complete the local paper admin lifecycle UI/runtime/test/evidence loop after RA-02 publish/archive/copy gaps have closed.
- Modify task-scoped `src/**`, `tests/**`, `e2e/**`, `docs/04-agent-system/state/**`, task plan, and task evidence.
- Commit, merge to `master`, validate on `master`, push `origin/master`, delete the short-lived branch, and update closeout evidence/state.

Blocked:

- `.env.local`, `.env.example`, package manifests, lockfiles, dependency changes.
- `src/db/schema/**`, `drizzle/**`, database migrations, and `drizzle-kit push`.
- Auth permission model changes.
- Staging/prod/cloud/deploy/real provider access.
- External service configuration changes.
- Destructive data operations.

Stop condition:

- If implementation requires `auth_permission_model`, database migration, dependency, secret/env, external service, real provider, deployment/cloud, or destructive data work, stop and request separate approval.

## Implementation Approach

1. Use TDD: first add focused failing coverage that proves the admin paper lifecycle surface now reports publish/archive/copy readiness from the closed RA-02 tasks.
2. Inspect existing paper admin UI/runtime fixtures and services before choosing the smallest implementation surface.
3. Prefer local deterministic fixtures and existing paper lifecycle APIs; do not introduce schema, migration, dependency, env, real provider, or cloud behavior.
4. Keep evidence explicit about residual gaps and do not claim real object storage or persistent role-login coverage.
5. Run task-declared local gates plus broader UI/build gates before closeout.

## Risk Controls

- No auth role or permission expansion in this task.
- No object storage provider, staging/prod, or cloud connection.
- No `.env.local` read or env value recording.
- No raw paper/customer-like content in evidence.
- Preserve standard API response envelope and camelCase DTO fields.
