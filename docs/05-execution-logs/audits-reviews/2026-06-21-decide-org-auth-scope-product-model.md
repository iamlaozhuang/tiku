# Audit Review: Decide Org Auth Scope Product Model

**Date:** 2026-06-21
**Task id:** `decide-org-auth-scope-product-model`
**Review type:** `product_architecture_decision_package`
**Runtime claim:** none

## Findings

| severity | findingId   | finding                                                                                                                                            | decision                                                                                    |
| -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| high     | ORG-AUTH-01 | Current `org_auth` runtime has no `subject`, but `paper` and `question` are subject-aware and users may expect `theory`/`skill` authorization.     | Record `subject` as a product authorization dimension; current records cover both subjects. |
| high     | ORG-AUTH-02 | Multi-`profession` and multi-`level` sales packages can become ambiguous if implemented as arrays on the existing row.                             | Require atomic authorization scopes for evaluation, quota, expiry, cancellation, and audit. |
| medium   | ORG-AUTH-03 | Multiple `org_auth` records could be misunderstood as multiple enterprise backends for the same `organization`/`employee` context.                 | Enterprise backend is shared; active scopes compose one effective capability set.           |
| high     | ORG-AUTH-04 | Authorization overlap, quota transfer, renewal, and upgrade semantics are security-sensitive and can leak or over-grant cross-organization access. | Runtime implementation remains blocked until split tasks and security review are approved.  |

## Audit Conclusion

This task closes the audit item as a decision package. It does not implement authorization-model changes, schema changes, contract/service/UI behavior, or runtime verification. Follow-up implementation must be split and security-reviewed before code changes.
