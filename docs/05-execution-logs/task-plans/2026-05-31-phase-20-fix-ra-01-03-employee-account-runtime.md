# Phase 20 Fix RA-01-03 Employee Account Runtime Task Plan

## Task

- Task id: `phase-20-fix-ra-01-03-employee-account-runtime`
- Branch: `codex/phase-20-fix-ra-01-03-employee-account-runtime`
- Source finding: `F-RA-01-03-001`
- Goal: expose the full local single employee account creation workflow through the active `/api/v1/employees` runtime, including phone, name, initial password, organization binding, role permission, standard API envelope, and redacted audit evidence.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Scope

Allowed by queue:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/**`
- `tests/**`
- `e2e/**`

Blocked:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Human Approval Boundary

The current user authorized this batch to complete up to three local low-blocked tasks inside queue `allowedFiles`, including implementation, validation, commit, merge to `master`, push `origin master`, merged branch cleanup, and cleanup docs commit/push. This approval remains limited to local implementation and does not approve dependency, package, lockfile, schema, drizzle, env, staging/prod, cloud, deploy, real provider, external service, force push, unknown worktree deletion, or destructive data operations.

## Implementation Approach

1. Add a failing unit test proving `POST /api/v1/employees` accepts the full employee account payload (`phone`, `name`, `initialPassword`, `organizationPublicId`) for `ops_admin`, creates a password credential, returns employee account DTO data, and writes redacted audit metadata without plaintext password.
2. Reuse the existing `employee-account-service`, validator, mapper, and repository contract instead of duplicating employee creation logic.
3. Extend the active admin organization/org auth runtime route to route full employee account creation payloads through an injected employee account service while preserving the existing bind-by-`userPublicId` path.
4. Add a Postgres employee account repository adapter backed by existing auth/user/employee/organization tables without changing schema or migrations.
5. Keep API response envelope standard and route URL public-id safe; keep plaintext initial password out of responses, logs, tests snapshots, and evidence.

## Risk Defense

- No schema, migration, drizzle, package, lockfile, env, cloud, staging/prod, real provider, external service, force push, or destructive data operation.
- `ops_admin` and `super_admin` may manage employee account creation; `content_admin` remains denied.
- Route remains `/api/v1/employees`; body uses camelCase; response remains `{ code, message, data }`.
- Existing bind-by-`userPublicId` path remains supported to avoid breaking RA-06 organization employee management behavior.
- Evidence must include a `Security Review` section because `auth_permission_model` is in scope.
- TDD required: production code change starts only after the new unit test fails for the expected missing full creation path.
