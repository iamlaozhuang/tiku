# Role Separated Account Coverage Review

taskId: acceptance-role-separated-account-coverage-review-2026-06-23
status: closed
result: blocked_role_separated_account_coverage_requires_seeded_local_accounts_or_owner_exclusions
recordedAt: "2026-06-23T06:44:49-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Verdict

The role-separated account blocker must remain `Blocked`.

The project now has better evidence than before: the fixture contract for seven role rows exists, that single spec
passed, and the current local browser session proved partial learner behavior. However, acceptance still cannot claim
credible role separation because the browser/runtime evidence does not show distinct real sessions for each mandatory
role.

The next step is needed: prepare a role-level scope package for either real seeded local account coverage or explicit
owner exclusions/acceptance variances. No mandatory role should be treated as excluded by default.

## Evidence Used

| Evidence source                   | Result available                                                                                           | Review impact                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Role separated account inventory  | 0 of 8 mandatory rows were ready for final blocker closure.                                                | Establishes that the blocker was still open before fixture supplement work.  |
| Fixture gap decision              | Fixture-first, seeded-runtime-second sequencing was approved; no mandatory role received silent exclusion. | Confirms the right order and keeps owner exclusions explicit.                |
| Test-only fixture supplement      | Seven missing fixture rows were added at contract level; auditor was excluded from this supplement.        | Improves static/contract confidence but does not prove real role sessions.   |
| Single-spec fixture runtime       | The approved role-separated fixture spec passed in the retry that reused the existing local server.        | Proves the new fixture contract can run, but still remains fixture evidence. |
| Local browser runtime walkthrough | Current learner session provided partial learner evidence; six mandatory rows remained blocked.            | Confirms that real runtime role separation is not yet proven.                |

## Role-by-Role Decision

| Role row                    | Current review status | Why it cannot close yet                                                                                           | Needed next path                                                                                                     |
| --------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | partial_blocked       | Current learner runtime evidence shows both standard and advanced labels, so it is not clean standard-only proof. | Clean standard-only seeded local account walkthrough, or explicit owner acceptance that this variance is acceptable. |
| `personal_advanced_student` | partial_blocked       | Advanced label is visible, but no dedicated advanced learner session or advanced-only workflow was proven.        | Seeded advanced learner walkthrough, or explicit owner acceptance of fixture-only/variance evidence.                 |
| `org_standard_employee`     | blocked               | No separated standard employee runtime session was proven.                                                        | Seeded standard employee walkthrough, or explicit owner exclusion if this role is outside MVP.                       |
| `org_advanced_employee`     | blocked               | No separated advanced employee runtime session was proven.                                                        | Seeded advanced employee walkthrough, or explicit owner exclusion if this role is outside MVP.                       |
| `org_standard_admin`        | blocked               | No dedicated standard organization admin runtime session was proven.                                              | Seeded standard organization admin walkthrough, or explicit owner exclusion if this role is outside MVP.             |
| `org_advanced_admin`        | blocked               | No dedicated advanced organization admin runtime session was proven.                                              | Seeded advanced organization admin walkthrough, or explicit owner exclusion if this role is outside MVP.             |
| `content_admin`             | blocked               | Current learner was denied content routes, but no dedicated content operations positive workflow was proven.      | Seeded content operations walkthrough, or explicit owner acceptance to defer/exclude this role.                      |
| `ops_admin`                 | blocked               | Current learner was denied ops routes, but no dedicated system operations positive workflow was proven.           | Seeded system operations walkthrough, or explicit owner acceptance to defer/exclude this role.                       |

## Decision

The blocker remains open because all eight mandatory rows are still either `partial_blocked` or `blocked` for final
runtime confidence.

The project should continue with a new approval package instead of executing account or seed work immediately. That
package should ask laozhuang to choose, row by row:

- which rows must receive real seeded local account/runtime evidence;
- which rows, if any, are explicitly excluded from MVP;
- which rows, if any, can rely on fixture-only or variance evidence for this acceptance phase.

## Recommended Next Package

Recommended next package id:

`ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23`

Recommended next task:

`acceptance-role-separated-account-seeded-local-or-owner-exclusion-scope-approval-2026-06-23`

This next task should prepare the approval package only. It should not create accounts, read password documents, enter
credentials, seed a database, edit `.env*`, change schema, run Provider, run Cost Calibration, deploy staging/prod, or
claim final MVP Pass.

## Closure Rule Going Forward

This blocker can close only when every mandatory role row has one of these recorded outcomes:

- pass with role-specific seeded local account/runtime evidence, including allowed and denied behavior;
- pass with owner-accepted fixture-only or variance evidence, recorded explicitly by role;
- excluded from MVP by laozhuang, recorded explicitly by role.

Until then, Standard and Advanced MVP acceptance must remain blocked at the role-separated account gate.
