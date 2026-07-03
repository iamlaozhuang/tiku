# 2026-07-03 Source Landing 8 Role Coverage Acceptance Checklist

## Scope

- Task ID: `source-landing-8-role-acceptance-coverage-review-2026-07-03`
- Review target: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Status: `closed`

This checklist reviews the current local 8-role acceptance evidence only. It does not rerun acceptance, start a dev
server, run browser validation, connect to a database, inspect env secrets, call a Provider, change source, or claim
release readiness, final Pass, or production usability.

## Acceptance Reading

The current 8-role rerun is acceptable as a local acceptance evidence checkpoint because every role has an explicit
coverage mode and no fail/block was recorded. It is not acceptable as an all-role seeded credential-backed closure,
release readiness, production usability, or a substitute for later DB/Provider/staging gates.

## Coverage Mode Legend

| Mode                                      | Meaning                                                                                                                          | Current acceptance use                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `credential_backed_runtime`               | Existing local account/session login and runtime UI/API flow were exercised.                                                     | Acceptable for current local evidence.                                       |
| `credential_backed_boundary_plus_fixture` | Credential-backed role/session or bounded runtime path exists, with fixture supplements for unobserved allowed/denied contracts. | Acceptable with named residual hardening.                                    |
| `hybrid_route_fulfilled_fixture_first`    | Runtime smoke or route-fulfilled context exists, but no dedicated seeded credential-backed role login was claimed.               | Acceptable only with caveat; should be hardened before broader claims.       |
| `fixture_first_contract`                  | Test-owned fixture contract proves allowed/denied shape without full role login/runtime journey.                                 | Useful as supplement only; not enough for full credential-backed acceptance. |

## Role Checklist

| Role                        | Current coverage classification                                             | Acceptance decision for current checkpoint | Evidence anchors                                                                                                                                                                      | Must not overclaim                                                                                                                         | Recommended next hardening                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `personal_standard_student` | `credential_backed_runtime`                                                 | Accept.                                    | rerun evidence rows 1-2; `student-practice-mock-entry.spec.ts`; repair evidence for two-step restart.                                                                                 | Does not prove all `redeem_code_type` redemption semantics or ambiguous `edition_upgrade` target selection.                                | Keep as baseline; only extend when card redemption hardening is in scope.                                                            |
| `personal_advanced_student` | `hybrid_route_fulfilled_fixture_first`                                      | Accept with caveat.                        | rerun evidence rows 3-4 and 7; `personal-ai-generation-local-request.spec.ts`; `edition-aware-authorization-local-flow.spec.ts`; `role-separated-account-fixture-supplement.spec.ts`. | No dedicated seeded advanced learner login or Provider execution was claimed.                                                              | Add seeded advanced learner account/context and credential-backed learner `AI训练` positive/negative walk.                           |
| `org_standard_employee`     | `fixture_first_contract` plus shared organization employee runtime coverage | Accept with caveat.                        | rerun evidence rows 5 and 7; organization flow spec; role-separated fixture supplement.                                                                                               | Does not prove a dedicated seeded standard employee login blocks `企业训练` and organization AI through runtime routes.                    | Add seeded standard employee account, organization context, standard-only learning positive path, and advanced-route denial.         |
| `org_advanced_employee`     | `fixture_first_contract` plus shared organization employee runtime coverage | Accept with caveat.                        | rerun evidence rows 5 and 7; organization flow spec; role-separated fixture supplement.                                                                                               | Does not prove a dedicated seeded advanced employee login for `企业训练` and learner `AI训练`.                                             | Add seeded advanced employee account with assigned training and AI context, including deadline/takedown/invalid-auth negative paths. |
| `org_standard_admin`        | `credential_backed_boundary_plus_fixture`                                   | Accept for current local evidence.         | rerun evidence rows 1, 5, and 7; baseline account smoke; organization flow spec; fixture supplement.                                                                                  | Does not prove every roster/status detail or every platform-owned mutation denial.                                                         | Add fuller standard org admin workspace route walkthrough if business requires credential-backed UI detail.                          |
| `org_advanced_admin`        | `credential_backed_boundary_plus_fixture`                                   | Accept for current local evidence.         | rerun evidence rows 1, 5, and 7; baseline account smoke; organization flow spec; fixture supplement.                                                                                  | Does not prove DB-backed training persistence, generated-field persistence, or raw-answer privacy across all cases.                        | Add credential-backed organization training, analytics, and organization AI workflow hardening after fixture/data setup.             |
| `content_admin`             | `credential_backed_boundary_plus_fixture`                                   | Accept with caveat.                        | rerun evidence rows 1, 6, and 7; baseline account smoke; admin denial spec; fixture supplement.                                                                                       | Does not prove a full credential-backed content resource and content AI draft/adoption browser workflow.                                   | Add content admin seeded workflow for resource management and content AI review/adoption boundaries.                                 |
| `ops_admin`                 | `credential_backed_boundary_plus_fixture`                                   | Accept with caveat.                        | rerun evidence rows 1, 5, 6, and 7; baseline account smoke; organization flow spec; admin denial spec; fixture supplement.                                                            | Does not prove full credential-backed `redeem_code`, `org_auth`, employee import/password, overlap closure, and user-management workflows. | Add ops credential-backed workbench fixtures and a guided operations walkthrough.                                                    |

## Business Acceptance Gate

If the product owner accepts fixture-first and hybrid coverage as a local checkpoint, the next task can be a design and
fixture-hardening plan rather than a defect repair. If the product owner requires all 8 roles to be seeded
credential-backed before any acceptance checkpoint is considered acceptable, then `personal_advanced_student`,
`org_standard_employee`, `org_advanced_employee`, `content_admin`, and `ops_admin` become the first hardening targets.

## Non-Claims

- No runtime rerun happened in this review task.
- No new pass/fail/block was produced by runtime execution in this review task.
- No all-role credential-backed closure is claimed.
- No release readiness, final Pass, production usability, Provider readiness, Cost Calibration, staging/prod readiness,
  schema readiness, or DB-backed full-flow claim is made.
