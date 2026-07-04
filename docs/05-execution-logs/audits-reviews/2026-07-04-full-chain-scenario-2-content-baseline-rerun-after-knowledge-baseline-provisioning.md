# 2026-07-04 Full-chain Scenario 2 Content Baseline Rerun After Knowledge Baseline Provisioning Audit Review

## Review Result

- Task id: `full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning-2026-07-04`
- Result: `blocked_admin_flow_cookie_backed_session_not_accepted_by_paper_collection_get`
- Review stance: adversarial stop-on-fail review.

## Findings

| Severity | Finding                                                                                                               | Disposition                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| P0       | `content_admin` can log in, create/publish paper through lifecycle routes, but paper collection GET returns `401001`. | Stop Scenario 2 and split a source repair before rerunning the affected node.                                  |
| P1       | Product data aggregates show material/question/paper baseline exists, so rerunning blindly could duplicate state.     | Rerun after repair must use selector-scoped idempotency checks or read existing selector-owned product output. |
| P1       | The initial public-id based knowledge check used a mismatched verifier formula.                                       | Corrected by name/selector scoped aggregate verification; no evidence includes private content.                |

## Boundary Review

| Boundary                         | Status |
| -------------------------------- | ------ |
| Credentials kept in memory only  | pass   |
| Evidence redaction               | pass   |
| Raw DB rows/internal ids omitted | pass   |
| Screenshot/raw DOM/trace omitted | pass   |
| Provider/staging/Cost omitted    | pass   |
| Destructive DB operation omitted | pass   |
| Permission bypass omitted        | pass   |
| Fake data/fixture expansion      | pass   |

## Decision

The block is a real implementation inconsistency, not an expected acceptance stop or missing preparation artifact.
`admin-flow-runtime` should not require a client-visible bearer token when the shared session mechanism is
cookie-backed. The next task must repair the runtime session lookup narrowly, add focused regression coverage, close
out on its own branch, then rerun Scenario 2 from the affected paper collection route node.

No release readiness, final Pass, or production usability claim is made.
