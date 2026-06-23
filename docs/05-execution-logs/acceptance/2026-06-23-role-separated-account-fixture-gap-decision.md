# Role Separated Account Fixture Gap Decision

taskId: acceptance-role-separated-account-fixture-gap-decision-2026-06-23
status: closed
result: pass_gap_decision_completed_fixture_first_seeded_runtime_second
recordedAt: "2026-06-23T05:02:46-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Decision

The role-separated blocker should not be closed yet, and the recorded role gaps should not be accepted as broad MVP
exclusions. Role separation is part of making the acceptance result credible.

The recommended path is:

1. Use test-only fixture supplement first to close the cheapest and safest contract gaps: role identity, allowed
   workflow, denied workflow, organization boundary, and edition boundary.
2. Use seeded local account expansion only after the fixture contract is clear, and only for rows that need real
   login/session or DB-backed runtime confidence.
3. Treat `auditor_if_supported` as an explicit product decision: exclude it from MVP only if the product does not
   intend a separate auditor role in this release; otherwise keep it blocked until a role row exists.

This decision does not approve changing fixture files or seed data. It only records what should be requested next.

## Role-by-Role Decision

| Role row                    | Current gap                                   | Recommended next handling              | Later stronger evidence needed before L5/L6 confidence                                        | MVP exclusion?                        |
| --------------------------- | --------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| `personal_standard_student` | Existing local seed path; runtime row pending | Use existing seeded/local learner path | Runtime walkthrough with allowed learner behavior, denied admin/content/ops behavior, logout. | No exclusion.                         |
| `personal_advanced_student` | Advanced auth exists, separated login missing | Test-only fixture first                | Seeded advanced learner account if owner wants real login/session proof for Advanced MVP.     | No exclusion.                         |
| `org_standard_employee`     | Standard employee split proof missing         | Test-only fixture first                | Seeded standard employee account for real employee runtime walkthrough.                       | No exclusion.                         |
| `org_advanced_employee`     | Advanced employee split proof missing         | Test-only fixture first                | Seeded advanced employee account for real employee runtime walkthrough.                       | No exclusion.                         |
| `org_standard_admin`        | Dedicated standard org admin missing          | Test-only fixture first                | Seeded standard org admin account if org admin runtime is required before preview acceptance. | No exclusion.                         |
| `org_advanced_admin`        | Dedicated advanced org admin missing          | Test-only fixture first                | Seeded advanced org admin account if advanced org admin runtime is required before preview.   | No exclusion.                         |
| `content_admin`             | Positive content workflow missing             | Test-only fixture first                | Seeded content operations account only if owner requires real local login for operations.     | No exclusion.                         |
| `ops_admin`                 | Positive system ops workflow missing          | Test-only fixture first                | Seeded system operations account only if owner requires real local login for operations.      | No exclusion.                         |
| `auditor_if_supported`      | Dedicated auditor role not proven             | Product decision before fixture/seed   | If supported, add a test-only read-only auditor fixture; seeded auditor account is optional.  | Exclude only if no separate MVP role. |

## Why Fixture First

Test-only fixture supplement is the lowest-risk next step because it can define and check the intended role contract
without creating real accounts, touching database state, changing seed scripts, or handling credentials. It is the right
place to prove:

- the role label is distinct;
- the role sees the workflows it is supposed to see;
- the role is denied from workflows it must not access;
- an organization role cannot cross organization boundaries;
- a standard edition role does not silently receive advanced behavior;
- an advanced edition role receives advanced behavior without getting unrelated admin power.

## When Seeded Local Accounts Are Needed

Seeded local accounts are stronger, but they are more invasive. They should be used after the fixture contract is
stable, and only when the owner wants local runtime evidence that exercises real login/session and DB-backed data.

Seeded local account expansion is recommended for final confidence in:

- `personal_advanced_student`;
- `org_standard_employee`;
- `org_advanced_employee`;
- `org_standard_admin`;
- `org_advanced_admin`.

Seeded local account expansion is optional but useful for:

- `content_admin`;
- `ops_admin`;
- `auditor_if_supported`, if the product keeps a distinct auditor role.

## Rows That Should Continue Blocking

The blocker should remain open until each mandatory row has either:

- approved test-only fixture evidence with allowed and denied behavior;
- approved seeded local account/runtime evidence with allowed and denied behavior;
- or an explicit owner-accepted MVP exclusion recorded by role.

At this point, no mandatory row should be silently excluded from MVP.

## Next Approval To Request

Recommended next package:

`ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23`

That approval should allow a new task to prepare and then, if approved again for implementation, add test-only role
fixtures for the missing rows. It should still block seeded account changes, database work, browser runtime, Provider,
Cost Calibration, staging/prod, payment, external services, PR, force push, and final MVP pass.

## Boundary Statement

This task does not edit fixture files, source files, e2e files, scripts, package files, database schema, migrations, or
environment files. It does not create accounts, change passwords, seed a database, run browser/Playwright, call Provider,
run Cost Calibration, deploy staging/prod, or claim Standard/Advanced MVP pass.
