# Task Plan: Phase 12 Ops Org Auth Redeem UI Closure

## Task

Close `phase-12-repair-ops-org-auth-redeem-ui-closure` by making the local/dev operations admin UI action-closed for existing `org_auth` and `redeem_code` protected APIs.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Boundary

- Allowed: existing local/dev UI closure for `organization`, `org_auth`, and `redeem_code` pages against existing APIs and tests.
- Forbidden: dependency changes, package/lockfile changes, schema/migration/script changes, `.env*`, staging/prod/cloud/deploy, permission model rewrites, destructive data operations, secret output, raw code payload evidence.
- Clear-text generated `redeem_code` values may exist in runtime UI for authorized ops users, but evidence must not record generated plaintext codes.

## SSOT Acceptance Focus

- US-06-04: list org_auth, create org_auth, cancel org_auth, show authorization detail/coverage summary where existing API permits.
- US-06-05: generate redeem_code batch, filter/search list, show generation/redemption metadata, keep plaintext visibility only in authorized local UI and out of evidence.
- US-06-01: loading/empty/error states, mutation feedback, confirmation for dangerous actions where current component patterns permit.
- `admin-ops-contract`: route/API boundaries stay thin; this task should close UI-to-existing-API gaps without changing service/schema contracts.

## Implementation Approach

1. Inspect current UI and tests for `AdminOrgAuthRedeemPage` and admin ops management.
2. Add failing tests for missing action closure before implementation.
3. Implement only scoped UI/service adapter wiring inside allowed feature directories.
4. Verify with task unit tests, E2E, build, agent readiness, naming, git completion readiness, and diff check.
5. Record redacted evidence, close task state, commit, merge, push, and cleanup branch.

## Risk Controls

- If existing APIs do not support a requested action, record the gap instead of modifying schema/routes outside allowed files.
- Do not record generated `redeem_code` plaintext in evidence.
- Do not use staging/prod, cloud object storage, or `.env.local` content.
- Stop for approval if a fix requires blocked files or permission model changes.
