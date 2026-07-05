# 2026-07-04 Full-chain Scenario 5 Advanced Org Package Rerun After Employee Import Harness Repair Audit

## Scope

- Task id: `full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope reviewed: Scenario 5 rerun from the advanced employee import node after harness repair.

## Findings

- PASS: restart node is defensible because prior Scenario 5 evidence already created and aggregate-verified advanced
  `org_auth`, `org_advanced_admin`, and admin-organization binding.
- PASS: the earlier local service-start symptom was not a durable product blocker. After explicit isolated DB target
  binding, the local app started, API sessions succeeded, and the employee import product route completed.
- PASS: advanced employee import completed with six imported employees and zero rejected rows.
- BLOCKED: browser/e2e login surface did not enable submit after valid input values were present in the DOM. This blocks
  the remaining advanced organization surface and permission-boundary checks until a source repair is completed.
- PASS: this task does not approve Provider, staging/prod, Cost Calibration, destructive DB work, dependency changes,
  release readiness, final Pass, or production usability claims.

## Adversarial Checks

| Check                                          | Result  | Evidence  |
| ---------------------------------------------- | ------- | --------- |
| Existing advanced org package preserved        | pass    | evidence  |
| Employee import uses CSV `content` shape       | pass    | evidence  |
| Employee import contains no authorization cols | pass    | preflight |
| Advanced employee import count exceeds 5       | pass    | evidence  |
| Org advanced admin allowed advanced surfaces   | blocked | evidence  |
| Org advanced admin denied global ops/content   | blocked | evidence  |
| Standard org admin denied advanced surfaces    | blocked | evidence  |
| Provider/staging/prod/Cost not executed        | pass    | evidence  |
| Redaction preserved                            | pass    | evidence  |

## Decision

BLOCKED: split `full-chain-login-input-state-binding-repair-2026-07-04`, repair the login UI state binding without
weakening authentication or permission checks, merge/push/cleanup that repair, then rerun Scenario 5 from the browser
login and advanced organization surface node. The passed employee import mutation should not be duplicated.
