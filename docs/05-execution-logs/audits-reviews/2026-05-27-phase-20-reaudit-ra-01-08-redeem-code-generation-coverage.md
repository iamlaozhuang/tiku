# Phase 20 Reaudit RA-01-08 Redeem Code Generation Coverage

**Date:** 2026-05-27

**Task id:** `phase-20-reaudit-ra-01-08-redeem-code-generation-coverage`

## Scope

This re-audit reviews `CV-19-03-001` from Phase 19 for `RA-01-08` redeem_code batch generation coverage.

This report is governance and evidence only. It does not modify business implementation, source code, tests, e2e, schema, drizzle, scripts, dependencies, lockfiles, environment files, staging/prod/cloud/deploy configuration, real provider behavior, or data.

## Original Requirement Summary

`RA-01-08` maps to `US-01-08` card-code batch generation.

Requirement summary:

- An operations admin can batch-generate redeem_code values for personal distribution.
- The same batch specifies `profession`, `level`, authorization duration, and optional redeem deadline.
- A batch creates at most 100 codes.
- Each redeem_code is 8 uppercase alphanumeric characters and avoids confusing characters.
- Admin list supports plaintext visibility for authorized operations distribution, search, and status filtering.
- Status values are `unused`, `used`, and `expired`, where `expired` means an unused code whose redeem deadline has passed by server UTC+8 time.

The module detail also allows saving a lightweight `generation_group_id` for filtering and limits visibility to operations admins and super admins.

## Phase 18 And Phase 19 Records

Phase 18 RA-01 report recorded `RA-01-08` as:

| Field                  | Value                                                                                                                                                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| status                 | `implemented`                                                                                                                                                                                                                                                               |
| findingId              | `null`                                                                                                                                                                                                                                                                      |
| Code conclusion        | Admin redeem-code runtime supports batch generation, 100-code limit, UTC+8 deadline normalization, filtering/search/sort, audit log, and status derivation. List responses mask `codeDisplay`; plaintext is only returned by create response and must stay out of evidence. |
| Browser/e2e conclusion | Unit coverage exists for batch generation/list/filter/audit behavior. Browser evidence for persistent `ops_admin` is partial per Phase 17, but `super_admin` local flow is usable.                                                                                          |

The Phase 16 traceability matrix row recorded:

| implementation surface                     | unit/integration coverage | e2e/browser coverage | status        | findingId | notes                                                                                                      |
| ------------------------------------------ | ------------------------- | -------------------- | ------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| batch redeem code generation and filtering | `implemented`             | `partial`            | `implemented` | `null`    | Admin batch generation/list masking implemented; `ops_admin` browser account prerequisite remains partial. |

Phase 19 coverage matrix review recorded one caveat:

| caveatId       | auditId    | Finding impact | Recommendation                                                                                                                           |
| -------------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `CV-19-03-001` | `RA-01-08` | none yet       | Decide whether to register a re-audit/evidence-only follow-up for partial test coverage on implemented redeem_code generation/filtering. |

Phase 19 follow-up queue alignment registered this Phase 20 re-audit task rather than creating a canonical finding.

## Reaudit Evidence Review

Read-only review found that the Phase 18 evidence and current repository already include focused unit/API coverage for the requirement:

| Requirement area                               | Evidence reviewed                                                                                                                                                                                                              | Conclusion                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Batch parameters and count                     | `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` checks `count`, `profession`, `level`, `durationDay`, and `redeemDeadlineDate` are passed into create runtime.                                                 | Covered.                                                                                                                                         |
| 100-code limit                                 | `phase-11-redeem-code-batch-management-loop.test.ts` rejects `count: 101` before repository mutation.                                                                                                                          | Covered.                                                                                                                                         |
| UTC+8 deadline normalization                   | `phase-11-redeem-code-batch-management-loop.test.ts` expects `2026-06-24` to normalize to `2026-06-24T15:59:59.999Z`; service code uses `createUtcPlus8EndOfDay`.                                                              | Covered.                                                                                                                                         |
| 8-character uppercase non-confusing generation | Repository constants set alphabet to `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` and length to 8.                                                                                                                                       | Implemented; not separately asserted as a direct unit expectation, but covered by implementation inspection and generated create response tests. |
| Search/status/filter/sort                      | `phase-11-redeem-code-batch-management-loop.test.ts` passes keyword, status, pagination, `expiresAt`, and sort order to list runtime. Repository derives `expired` from unused deadline and filters `unused`/`used`/`expired`. | Covered.                                                                                                                                         |
| Plaintext and masking boundary                 | `phase-8-admin-redeem-code-runtime.test.ts` covers masked list output and plaintext only in creation response. `local-business-flow` asserts no `code_hash` or known plaintext fixture is leaked in admin reads.               | Covered with redacted evidence.                                                                                                                  |
| Role gate                                      | `phase-8-admin-redeem-code-runtime.test.ts` requires admin session and rejects `content_admin`; code allows `super_admin` and `ops_admin`.                                                                                     | Covered at unit/API level.                                                                                                                       |
| UI generation/filter loop                      | `admin-user-org-auth-ops-baseline.test.ts` covers redeem_code filtering and generation from the redeem code page.                                                                                                              | Covered in unit UI.                                                                                                                              |
| Browser/e2e route evidence                     | `local-business-flow` opens `/ops/redeem-codes` and reads `/api/v1/redeem-codes`; role-based full-flow creates a test-only batch and records plaintext-not-recorded summary.                                                   | Browser route evidence exists for local `super_admin`; persistent `ops_admin` browser account prerequisite remains partial.                      |

## Classification Of CV-19-03-001

| Question                                | Reaudit answer                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence missing?                       | No material evidence is missing for implementation or unit/API coverage. The Phase 18 evidence summary is terse but sufficient when combined with cited tests and source surfaces.                                                                                                                                                                 |
| Test coverage gap?                      | No blocking test coverage gap found. Focused unit/API tests cover batch creation, count limit, deadline normalization, filters, redaction, and role gates. A direct assertion on generated-character alphabet/length could be added in a future hardening task, but the current implementation and create-response tests do not justify a finding. |
| Status annotation inconsistency?        | Yes. The Phase 16 traceability row says unit/integration is `implemented` and e2e/browser is `partial`; Phase 19 coverage matrix describes the caveat as `testStatus=partial` and `browserStatus=implemented`. The actual caveat is browser/role-prerequisite partial, not test partial.                                                           |
| Phase 18/19 missed audit?               | No missed business audit found. Phase 19 correctly detected a coverage caveat, but the dimension label was inconsistent.                                                                                                                                                                                                                           |
| Needs canonical finding?                | No. There is no evidence-backed redeem_code generation defect or blocking test gap.                                                                                                                                                                                                                                                                |
| Needs Phase 20+ fix/test/re-audit task? | No additional task beyond this re-audit is needed. The only residual caveat is the already known persistent `ops_admin` browser account prerequisite, which is global/role-test infrastructure rather than a `RA-01-08` business finding.                                                                                                          |
| Blocked marker issue?                   | No. Long-lived gates remain global and should not mark this requirement as `blocked`.                                                                                                                                                                                                                                                              |

## Final Recommendation

Keep `RA-01-08` as implemented with `findingId=null`.

Recommended corrected coverage interpretation:

| dimension            | recommendation            | rationale                                                                                                                                                                                     |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| implementationStatus | `implemented`             | Batch generation, status derivation, filtering, role gate, audit metadata, and redaction boundary exist.                                                                                      |
| testStatus           | `implemented`             | Focused unit/API/UI tests cover the requirement's main behaviors.                                                                                                                             |
| browserStatus        | `partial` accepted caveat | Browser/local e2e evidence exists for `super_admin`, but persistent `ops_admin` browser account prerequisite remains partial. This is a global role-fixture caveat, not a `RA-01-08` finding. |
| findingId            | `null`                    | No canonical finding is warranted.                                                                                                                                                            |

No new Phase 20+ fix/test task is registered. This re-audit closes `CV-19-03-001` as a status annotation inconsistency plus documented browser role-prerequisite caveat.

## Redaction And Gate Notes

- No plaintext generated redeem_code value is recorded in this report.
- `.env.local` and `.env.example` were not read or modified.
- Long-lived blocked gates remain unchanged: real provider/staging/prod/cloud/deploy, dependency changes, secret/env changes, and destructive data operations remain blocked.
