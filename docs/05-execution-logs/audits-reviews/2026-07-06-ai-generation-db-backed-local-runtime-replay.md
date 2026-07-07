# 2026-07-06 AI Generation DB-backed Local Runtime Replay Audit Review

## Findings

| Finding                                                                                 | Severity | Evidence                                                                                                                                  | Required handling                                                                                                 |
| --------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Current local DB-backed runtime cannot be accepted as pass.                             | High     | Controlled local replay produced role-level partial/blocked results.                                                                      | Keep DB-backed runtime as `partial`; do not promote to release or production readiness.                           |
| Learner learning-session handoff is blocked by local DB schema mismatch.                | High     | `personal_advanced_student` and `org_advanced_employee` learning-session save paths returned `saveSession:db_schema_relation_missing`.    | Separate local DB schema/materialization decision is required before rechecking the learning-session closed loop. |
| Organization AI组卷 paths are blocked by organization training schema mismatch.         | High     | `org_advanced_employee` and `org_advanced_admin` AI组卷 paths returned `db_schema_column_missing` in enterprise training version queries. | Separate DB schema/materialization replay or fixture refresh is required; do not treat as Provider failure.       |
| Controlled local executor evidence cannot be extrapolated to Provider-enabled behavior. | Medium   | The replay intentionally avoided external Provider execution and used small count 1.                                                      | Provider-enabled bounded smoke remains a separate approval-gated task.                                            |
| Source/unit mechanisms remain healthy.                                                  | Low      | lint, typecheck, and 5 focused Vitest files / 83 tests passed.                                                                            | Keep source/unit as pass, but do not use it to close DB-backed runtime.                                           |

## Root-cause Classification

This task did not confirm a current source-code defect. The blockers are local DB/runtime materialization mismatches:

- missing local relation required by personal AI learning-session persistence;
- missing local column(s) required by organization training version queries for enterprise AI组卷 source resolution.

Because the approved scope excluded schema migration, seed, destructive DB work, and env/secret operations, no DB repair or migration was attempted.

## Contract Impact

| Contract area                             | Impact                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| AI出题 result persistence                 | Pass in controlled DB-backed replay for all four advanced roles.                                                                |
| AI组卷 plan-and-select result persistence | Pass for `personal_advanced_student` and `content_admin`; blocked for organization employee/admin due local DB schema mismatch. |
| Learner/employee learning session         | Blocked by local DB schema mismatch.                                                                                            |
| Content/admin formal boundary             | Held; content AI组卷/AI出题 produced draft/result path without direct formal publish claim.                                     |
| Enterprise source contract                | Not fully proved; enterprise source query is blocked before source selection can complete.                                      |

## Non-claims

- No Provider-enabled acceptance.
- No Cost Calibration.
- No staging/prod/deploy.
- No release readiness or production usability.
- No default-count acceptance.
- No schema migration or fixture refresh.
- No sensitive evidence captured.

## Recommended Next Decision

Do not proceed directly to Provider-enabled smoke. The next sensible step is a separate approval-gated local DB schema/materialization decision:

- either confirm and apply the non-destructive local schema/materialization needed for the current code;
- or refresh/switch to a local DB fixture that already contains the required post-recontract tables/columns.

After that, rerun DB-backed local runtime replay before any Provider-enabled bounded smoke.
