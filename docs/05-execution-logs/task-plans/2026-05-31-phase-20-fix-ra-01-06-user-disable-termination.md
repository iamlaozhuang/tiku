# Phase 20 Fix RA-01-06 User Disable Termination Task Plan

## Task

- Task id: `phase-20-fix-ra-01-06-user-disable-termination`
- Branch: `codex/phase-20-fix-ra-01-06-user-disable-termination`
- Source finding: `F-RA-01-06-001`
- Goal: when an admin disables a `user`, revoke active sessions and terminate in-progress `practice` / `mock_exam` local runtime flows with a durable `terminated` state.

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

## Implementation Approach

1. Add a failing unit test proving `POST /api/v1/users/{publicId}/disable` invokes active flow termination after a successful disable.
2. Extend the admin user/org auth repository contract with a local `terminateUserActiveFlows` hook.
3. Call the hook only for successful `user.disable`, after status mutation and session revocation.
4. Implement the Postgres repository hook by resolving `user.public_id` to internal `user.id`, then setting in-progress `practice` and unfinished `mock_exam` rows to `terminated` with `termination_reason = "account_disabled"`.
5. Add a `Security Review` section in evidence because `auth_permission_model` is in scope.

## Risk Defense

- No schema, migration, drizzle, package, lockfile, env, cloud, staging/prod, real provider, or destructive data operation.
- API response remains `{ code, message, data }`.
- Public URL continues to use `publicId`; internal ids are repository-only.
- Evidence must not include tokens, credentials, raw provider payloads, or env values.
- TDD required: production code change starts only after the new unit test fails for the expected missing termination call.
