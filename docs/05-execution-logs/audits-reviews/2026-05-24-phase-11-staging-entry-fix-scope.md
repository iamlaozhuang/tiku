# Audit Review: phase-11-staging-entry-fix-scope

## Boundary

This task defines the staging-entry fix scope after the local product readiness role-play run.

It does not implement fixes. No application code, dependency, schema, migration, script, `.env.local`, `.env.example`, cloud resource, deployment target, staging/prod service, provider configuration, or secret is changed.

## Decision Summary

`stagingEntryDecision`: `blocked_until_p0_and_in_scope_p1_fixes_are_resolved`

The first staging-entry fix package should focus on making the local MVP honest and bounded before any staging environment implementation:

- enforce or explicitly gate protected UI routes;
- align broken admin navigation;
- restore student `practice` and `mock_exam` entry closure for accepted student flows;
- either close content admin actions or mark them unavailable;
- add explicit error/known-limitation states where a flow is out of scope.

## Finding Decisions

| Finding                                                                                        | Severity | Scope decision                                                                                                                          | stagingDecision             | Owner task                                           |
| ---------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| `LPR-RP-001` protected pages render without a local session                                    | `P0`     | Must fix before staging entry. It affects `student`, `admin`, and `content` route boundaries.                                           | `block_staging_entry`       | `phase-11-staging-entry-auth-route-guards`           |
| `LPR-RP-002` admin shell audit navigation points to `/ops/audit-logs` 404                      | `P1`     | Must fix if admin acceptance includes AI/audit logs; cheap and low-risk enough for first fix package.                                   | `fix_before_staging`        | `phase-11-staging-entry-admin-audit-navigation`      |
| `LPR-RP-003` student `practice` and `mock_exam` direct entry does not start an actionable flow | `P1`     | Must fix for student acceptance because `practice` and `mock_exam` are core MVP flows.                                                  | `fix_before_staging`        | `phase-11-staging-entry-student-practice-mock-entry` |
| `LPR-RP-004` content management primary actions are enabled but not browser-complete           | `P1`     | Must either wire browser-complete flows or visibly disable/unavailable-state them before content admin acceptance.                      | `fix_or_downgrade_by_scope` | `phase-11-staging-entry-content-action-closures`     |
| `LPR-RP-005` missing-object student error states are not explicit                              | `P2`     | Can enter staging only as a named known limitation if happy paths are fixed; otherwise include in first fix package if capacity allows. | `known_limitation_or_fix`   | `phase-11-staging-entry-student-error-states`        |
| `LPR-RP-006` resource operations disabled without acceptance guidance                          | `P2`     | Accept as named known limitation if RAG admin write operations are out of staging acceptance scope.                                     | `known_limitation`          | `phase-11-staging-entry-known-limitations`           |
| `LPR-RP-007` organization and `redeem_code` operations mostly read-only                        | `P2`     | Accept as named known limitation only if admin ops acceptance is read-only.                                                             | `known_limitation`          | `phase-11-staging-entry-known-limitations`           |

## First Fix Package Recommendation

### Required Before Staging Entry

1. `phase-11-staging-entry-auth-route-guards`
   - Fixes `LPR-RP-001`.
   - Risk: high, because it touches route protection and auth/permission behavior.
   - Requires explicit human approval before implementation.

2. `phase-11-staging-entry-admin-audit-navigation`
   - Fixes `LPR-RP-002`.
   - Risk: low to medium, likely navigation-only.
   - Can proceed after task claim if allowed files are narrow.

3. `phase-11-staging-entry-student-practice-mock-entry`
   - Fixes `LPR-RP-003`.
   - Risk: medium, because it affects core student runtime entry behavior.
   - Requires browser and unit verification.

4. `phase-11-staging-entry-content-action-closures`
   - Fixes or scopes `LPR-RP-004`.
   - Risk: medium. If full create/edit flows are too large, the first acceptable fix is to disable unavailable actions with explicit state.

### Known Limitations For Staging Acceptance Notes

1. `LPR-RP-005`: missing-object error states can be a named limitation only if core student happy paths are fixed.
2. `LPR-RP-006`: RAG/resource write operations are out of first staging acceptance unless explicitly approved.
3. `LPR-RP-007`: organization and `redeem_code` write operations are out of first staging acceptance unless explicitly approved.

## Queue Policy

This task registers follow-up queue entries as `blocked` rather than `pending` when the implementation would touch high-risk auth/permission behavior, source code, or broader runtime closure. A later user approval should unblock one implementation task at a time with narrow allowed files.

## Required Human Approval

Explicit human approval is required before any follow-up task that:

- changes route protection, auth context, permission behavior, or session handling;
- modifies `src/**`;
- changes `.env.local`, `.env.example`, package files, lockfiles, schema, migrations, scripts, or deployment configuration;
- connects to staging/prod or deploys.

## Recommended Next Action

Ask the user to approve `phase-11-staging-entry-auth-route-guards` as the first high-risk implementation task, because `LPR-RP-001` is the only `P0` and blocks staging entry.
