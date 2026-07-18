# P1 F-0115 Phase-11 Scope Correction Hotfix Design

Date: 2026-07-17

Design approval source: the user's explicit 2026-07-17 approval of the one-time F-0115 phase-11 scope correction.

## Problem

F-0115 Task 8 full regression exposed one stale phase-11 unit fixture. The product branch cannot adapt it because `tests/unit/phase-11-system-ops-user-management-loop.test.ts` is outside the frozen task allowlist. Directly widening an `in_progress` task would correctly fail the P1 and Module guards.

## Selected Design

Create a base-pinned twelve-file governance commit. The queue delta inserts exactly one test path in the active F-0115 `allowedFiles` list. P1 and Module pre-commit independently validate base, branch, active task/status, exact files, approval, unsplit index/worktree, evidence/audit, and byte-exact queue transformation. P1 pre-push emits `transition_only` only for the resulting one-parent commit; Module pre-push independently permits ancestor checkpoints only for that topology.

Rejected alternatives are direct product-branch queue mutation, reuse of the already-materialized 2026-07-16 F-0115 bridge, and a generic `in_progress` ancestor allowance. Each would weaken one-time scope or drift isolation.

## Exact Queue Delta

In only task `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`, replace exactly once:

```yaml
- tests/unit/admin-user-org-auth-ops-baseline.test.ts
- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
```

with:

```yaml
- tests/unit/admin-user-org-auth-ops-baseline.test.ts
- tests/unit/phase-11-system-ops-user-management-loop.test.ts
- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
```

No other queue byte may change after LF normalization. Project state, product code/tests, hooks, dependencies, schema, migration, and product evidence are excluded from the governance commit.

## Guard and Smoke Contract

- Exact pre-commit positive on base `582c156afb0cdde8a3daa99785fda8540b56fe27` and branch `codex/p1-f0115-phase11-scope-correction-hotfix`.
- Negative fixtures for wrong base/branch/status, invalid approval, missing/extra/product path, partial staging, altered queue, replay, and ordinary steady-task SHA drift.
- Exact one-parent pre-push transition emits `p1TransitionScopeMode: transition_only`.
- Module pre-push requires `state checkpoint -> origin/master(base) -> master(hotfix)` ancestry and rejects state mismatch, origin movement, multi-parent/replay, and standard-mode drift.
- Existing F-0132, original F-0115, ordinary transition, closeout, P0, and Module behavior remain green.

## Stop Conditions

Stop if implementation needs more than the twelve authorized files, changes more than one queue line, touches product/package/schema/database/provider/runtime/P2/deploy/PR/force-push scope, permits a generic ancestor checkpoint, or cannot prove existing guard compatibility.
