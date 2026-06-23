# Role Separated Account Inventory

taskId: acceptance-role-separated-account-inventory-2026-06-23
status: closed
result: pass_inventory_completed_with_dedicated_account_gaps_recorded
recordedAt: "2026-06-23T04:32:18-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_ACCOUNT_SCOPE_2026_06_23

## Plain-Language Result

This inventory confirms that the project already has meaningful local evidence for personal edition authorization,
organization authorization, one baseline learner path, unauthenticated route protection, and some admin/content/ops
boundaries.

It also confirms that this evidence is not enough to close the role-separated account blocker. Several important roles
are still represented by either a shared admin path, an authorization fixture, a negative-only fixture, or a dynamic
test flow. That is useful evidence, but it is not the same as proving that each role has its own safe account or fixture
and can pass both allowed and denied behavior checks.

## Judgment Rules

- `covered_account_or_seeded_local`: existing local evidence includes a safe role account or seed label suitable for a
  later role-specific walkthrough.
- `covered_authorization_not_separated_login`: authorization behavior is proven, but a distinct login account for that
  role is not proven.
- `partial_fixture_or_flow_only`: fixture or runtime flow covers part of the role, usually without a dedicated account
  or without a positive workflow.
- `missing_dedicated_role_account`: no sufficient separate role account or fixture label has been proven yet.
- `boundary_only`: useful for guardrail checks, but cannot replace a mandatory role row.

## Mandatory Role Rows

| Role row                    | Plain-language meaning                    | Existing safe label or evidence                                                         | Current judgment                            | What is still needed before blocker closure                                                                |
| --------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Individual learner on standard edition    | Local seed learner label and `personal-auth-dev-student` authorization evidence         | `covered_account_or_seeded_local`           | Later walkthrough still needs an allowed learner check, denied admin/content/ops check, and logout switch. |
| `personal_advanced_student` | Individual learner on advanced edition    | `personal-auth-db-advanced-local` DB-backed authorization evidence                      | `covered_authorization_not_separated_login` | A safe advanced learner account or approved test-only fixture for a login/session-style row.               |
| `org_standard_employee`     | Organization employee under standard auth | Organization training local flow and standard organization authorization evidence       | `partial_fixture_or_flow_only`              | A distinct standard employee account or fixture with allowed employee behavior and denied admin behavior.  |
| `org_advanced_employee`     | Organization employee under advanced auth | Advanced organization authorization evidence                                            | `covered_authorization_not_separated_login` | A distinct advanced employee account or fixture with advanced entitlement behavior and denied admin power. |
| `org_standard_admin`        | Standard organization administrator       | Existing admin/setup path and standard organization authorization evidence              | `partial_fixture_or_flow_only`              | A dedicated standard organization admin account or fixture, scoped to its own organization only.           |
| `org_advanced_admin`        | Advanced organization administrator       | Advanced organization authorization evidence                                            | `covered_authorization_not_separated_login` | A dedicated advanced organization admin account or fixture, with cross-organization denial proof.          |
| `content_admin`             | Content operations user                   | Fixture-only denial boundary for content/system separation; local content path evidence | `partial_fixture_or_flow_only`              | A positive content workflow using a dedicated content role label, plus denied system operations routes.    |
| `ops_admin`                 | System operations user                    | Fixture-only denial boundary for system/content separation; local ops path evidence     | `partial_fixture_or_flow_only`              | A positive system ops workflow using a dedicated ops role label, plus denied content editing routes.       |

## Boundary Rows

| Boundary row                       | Existing safe label or evidence                                      | Current judgment                 | Meaning                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `unauthenticated_visitor`          | Prior L5 unauthenticated route guard and safe-smoke evidence         | `boundary_only_covered`          | Useful route protection evidence, but not a role account.                                |
| `super_admin`                      | Existing local seed/admin setup label                                | `boundary_only_setup_account`    | Useful for setup and comparison, but cannot replace organization, content, or ops roles. |
| `auditor` / `auditor_if_supported` | Redacted audit and AI call log summary visibility through admin path | `missing_dedicated_role_account` | If the product keeps a distinct auditor role, it still needs a dedicated role row.       |

## Coverage Summary

- Mandatory rows with a usable existing local seed or account-like label: 1 of 8.
- Mandatory rows with authorization evidence but no separated login/account proof: 3 of 8.
- Mandatory rows with fixture-only or partial flow evidence: 4 of 8.
- Mandatory rows ready for final blocker closure without more decision or runtime evidence: 0 of 8.
- Boundary rows recorded: 3 of 3.

The role-separated blocker therefore remains open. The project has enough information to make the next decision, but
not enough to declare Standard MVP or Advanced MVP role separation complete.

## Recommended Next Decision

Run `acceptance-role-separated-account-fixture-gap-decision-2026-06-23` next. That task should decide, role by role,
whether the missing proof is best handled by:

- accepting an explicit MVP exclusion;
- adding test-only fixture coverage;
- adding seeded local account coverage;
- or postponing the row as a release blocker.

For speed and safety, the practical order is to prefer test-only fixture coverage for role separation and denial
boundaries first, then use seeded local accounts only for rows that truly need login/session and DB-backed runtime
evidence.

## Boundary Statement

This inventory did not record passwords or secrets, did not create or disable accounts, did not edit fixtures, did not
run a seed script, did not connect to or mutate a database, did not start a dev server, did not use browser or
Playwright runtime, did not call Provider/model services, did not run Cost Calibration, did not deploy staging/prod, and
does not claim final MVP pass.
