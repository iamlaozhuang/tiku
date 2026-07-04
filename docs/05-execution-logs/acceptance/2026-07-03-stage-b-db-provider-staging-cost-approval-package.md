# 2026-07-03 Stage B DB Provider Staging Cost Approval Package

## Scope

- Task ID: `stage-b-db-provider-staging-cost-approval-package-2026-07-03`
- Branch: `codex/stage-b-db-provider-staging-cost-approval-package-2026-07-03`
- Status: prepared

## Approval Requested

Stage B execution should be approved only as separate serial tasks. This package does not approve direct execution by
itself; it defines the materials and checks needed before each later task can start.

## Required Materials

| Area                 | Required before execution                                                                                                                | Evidence allowed                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| DB-backed acceptance | Exact local/staging DB target, allowed read/write scope, rollback/reset policy, raw-row redaction policy, and task-owned fixture plan.   | Aggregate counts, status categories, route names, migration/seed command status if explicitly approved.                 |
| Provider execution   | Provider name/model, max call count, retry count, max output tokens, timeout, expected cost ceiling, and prompt/output redaction policy. | Provider/model identifiers, call count, duration bucket, token/cost summary, status category, structured count summary. |
| Staging validation   | Exact staging URL/target, account source, route list, browser/runtime boundary, screenshot/trace policy, rollback owner.                 | Route labels, role labels, status categories, aggregate counts, redacted failure categories.                            |
| Cost calibration     | Budget owner, cost ceiling, sample size, stop threshold, Provider pricing source, and ledger path.                                       | Cost bucket, token bucket, call count, duration bucket, pass/fail category.                                             |

## Serial Execution Order

1. DB-backed acceptance boundary task.
2. Provider-backed bounded AI sample task.
3. Staging runtime boundary task.
4. Cost calibration task.

Each task must have its own short branch, task plan, evidence, audit, allowed files, blocked files, validation commands,
closeout policy, and redaction statement before execution.

## Stop Conditions

- Missing approval or missing exact target.
- Any required secret, credential, token, cookie, session, Authorization header, env value, raw DB row, Provider payload,
  Prompt, raw AI I/O, screenshot, trace, raw DOM, full generated/content body, or plaintext `redeem_code` would be
  written to evidence.
- Provider call exceeds approved call count, retry count, output token cap, timeout, or cost ceiling.
- Staging target differs from approved target.
- DB action would exceed task-owned scope or lacks rollback/reset policy.
- Any fail/block appears; stop and split a repair or approval refinement task.

## Non-Claims

- This package does not execute Stage B.
- This package does not claim release readiness, final Pass, production usability, Provider readiness, staging readiness,
  or Cost Calibration completion.
