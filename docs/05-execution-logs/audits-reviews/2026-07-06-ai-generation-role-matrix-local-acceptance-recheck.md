# 2026-07-06 AI Generation Role Matrix Local Acceptance Recheck Audit

## Audit Position

This is an adversarial local recheck after the 2026-07-06 AI出题 / AI组卷 recontract implementation packets. It verifies what the current local evidence can and cannot prove. It is not a release audit and does not claim full browser, DB-backed runtime, Provider-enabled, staging, production, or Cost Calibration readiness.

## Requirement Mapping Result

| Requirement                                                                              | Evidence                                                                                        | Result     |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Standard roles cannot use advanced AI generation                                         | learner home/UI tests, personal route rejection tests, admin standard UI and route denial tests | Pass       |
| `personal_advanced_student` AI训练 entry and local AI出题 / AI组卷 contract remains live | learner home and AI训练 UI tests, personal route tests                                          | Pass       |
| `org_advanced_employee` AI训练 entry and organization-context AI组卷 remains live        | learner home and AI训练 UI tests, personal route organization-context assembly tests            | Pass       |
| `org_advanced_admin` AI出题 / AI组卷 admin surface and route contract remains live       | admin entry-surface tests and admin local route tests                                           | Pass       |
| `content_admin` AI出题 / AI组卷 admin surface and draft/review boundary remains live     | admin entry-surface tests and admin local route tests                                           | Pass       |
| Provider-disabled states are understandable and do not persist generated results         | route/UI source-unit checks for disabled runtime categories and persistence guard               | Pass       |
| Full 7-role browser runtime matrix                                                       | only synthetic admin cross-workspace smoke executed                                             | Partial    |
| DB-backed local runtime closed-loop                                                      | not executed in this package                                                                    | Not tested |
| Provider-enabled small sample                                                            | not executed in this package                                                                    | Not tested |

## Adversarial Findings

- The source/unit evidence is broad for role and route contracts, but it is still not equivalent to a real credential-backed 7-role browser pass.
- The synthetic browser smoke proves browser denial wiring for two backend workspace separation cases only. It does not prove personal/employee browser AI generation closed loops.
- The Provider-disabled route evidence is sufficient for local source/unit clarity and persistence guards. It does not prove real Provider-enabled behavior.
- The DB-backed runtime and browser full matrix remain the main residual gap before the active parent goal can be marked complete.
- Old 0704 runtime evidence remains historical baseline only. It cannot be reused as proof for the new AI组卷 plan-and-select contract.

## Boundary Review

- No dependency, package, lockfile, schema, migration, seed, env/secret, direct DB runtime, Provider-enabled, staging/prod, deploy, or Cost Calibration operation was executed.
- No source or test file was modified.
- Evidence records only file paths, test names, aggregate counts, role labels, route/surface categories, and non-sensitive status categories.
- Browser artifact risk was reduced by using line reporter and `--trace=off`; no screenshots or DOM dumps were produced by the task command.

## Conclusion

- source/unit: pass.
- DB-backed runtime: not tested.
- browser: partial.
- Provider-disabled: pass in source/unit scope.
- Provider-enabled small sample: not tested; requires separate bounded approval.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.

## Next Recommended Task

Run a separate credential-backed localhost role-matrix replay for the current recontract state, bounded to local 7-role UI and route behavior, with strict redaction and no Provider-enabled execution unless separately approved.
