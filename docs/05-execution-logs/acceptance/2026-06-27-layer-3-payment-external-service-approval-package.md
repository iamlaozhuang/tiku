# Layer 3 Payment External-Service Approval Package Acceptance

Task id: `layer-3-payment-external-service-approval-package-2026-06-27`

result: pass_payment_external_service_approval_package_prepared_execution_blocked

moduleRunVersion: 2

## Acceptance Decision

This docs/state-only package defines the payment/external-service approval matrix for future work. It does not execute
payment or external-service behavior and does not change runtime readiness.

Layer 1 remains complete and preserved.

Layer 2 remains the minimum local PostgreSQL test-owned `rejected` review-command closure.

Layer 3 status after this package:

| Gate                     | Status                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| Provider smoke           | Passed on previous redacted `openai_compatible` / `alibaba-qwen` path. |
| Cost Calibration         | Minimum local redacted single-sample estimate exists.                  |
| Staging/pre-release      | Blocked by missing concrete isolated staging target.                   |
| Payment/external-service | Approval boundary defined by this package; execution remains blocked.  |
| OCR/export               | Next docs/state-only approval package must define boundaries.          |
| Release readiness        | Blocked.                                                               |
| Final Pass               | Blocked.                                                               |

## Payment External-Service Approval Matrix

| Area                         | Current decision              | Future approval must define                                                                  | Execution now |
| ---------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- | ------------- |
| Payment provider             | Not selected.                 | Provider label, sandbox account, credential alias, SDK/API boundary, owner, and fallback.    | Blocked.      |
| Sandbox versus real boundary | Sandbox-only first if needed. | Explicit sandbox target, no real charge, no prod account, no customer-private data.          | Blocked.      |
| Real payment                 | Out of current scope.         | Separate production payment decision, legal/finance owner, refund and incident route.        | Blocked.      |
| Callback/webhook             | Not executable.               | Callback URL, signature verification, replay protection, idempotency, redacted evidence.     | Blocked.      |
| Env and credential handling  | No credential access.         | Secret alias, injection method, no value output, no `.env*` modification, rotation owner.    | Blocked.      |
| Deploy coupling              | No deploy.                    | Isolated staging target, callback origin, rollback owner, monitoring owner, no prod touch.   | Blocked.      |
| Refund                       | Not implemented.              | Refund authority, request source, audit trail, failure policy, and reconciliation ownership. | Blocked.      |
| Invoice                      | Not implemented.              | Invoice provider, tax/legal owner, private-data handling, retention, and redaction policy.   | Blocked.      |
| Settlement                   | Not implemented.              | Settlement report source, schedule, owner, mismatch handling, and evidence summary shape.    | Blocked.      |
| Reconciliation               | Not implemented.              | Idempotent matching keys, discrepancy workflow, audit summary, and no raw row evidence.      | Blocked.      |
| External-service dependency  | Not selected.                 | Service name, account boundary, API call cap, retry cap, timeout, spend or fee stop policy.  | Blocked.      |
| Authorization effect         | No runtime effect.            | Mapping from confirmed payment to `personal_auth`, `org_auth`, or support workflow decision. | Blocked.      |
| Evidence                     | Redacted summary only.        | Labels, pass/fail/blocked, counts, cap status, redaction status, stop condition.             | Docs only.    |

## Required Future Approval Text

Copy only after selecting a concrete provider and target:

```text
我 fresh approve 一个 Layer 3 payment/external-service sandbox execution task: <task-id>。
允许仅在已登记 sandbox target 中执行 <provider label> 的 <operation label>，最多 <N> 次 external-service call，
0 retry，timeout <N>ms，spend/fee stop limit <amount>，使用 credential alias <ALIAS>，但禁止输出、复制、
记录或提交任何 .env* 内容、secret、token、payment credential、Authorization header、raw payment payload、
raw callback payload、customer private data、invoice private data、settlement private data、DB row 或 SQL output。
证据只能记录 provider label、sandbox/real boundary、operation label、request count、retry count、pass/fail/blocked、
cap status、redaction status、failure category、stop condition 和 forbidden-action checklist。
不批准 real/prod payment、真实扣款、退款、发票开具、结算、对账、DB read/write、Provider、Cost Calibration、
浏览器/e2e、staging/prod deploy、OCR/export、PR、force push、release readiness 或 final Pass。
若缺少 alias、需要第二次调用/重试/第二目标、需要改 package/lockfile/SDK/config、需要输出 raw payload/private data、
或机制门禁失败，必须停止并只写脱敏 blocked evidence。
```

## Redaction Requirements

Evidence must not record `.env*` content, secret, token, payment credential, DB URL, Authorization header, raw payment
payload, raw callback payload, invoice private data, settlement private data, customer private data, screenshot, trace,
cookie, localStorage, raw DB row, or SQL output.

## Residual Decision

Payment/external-service remains future scope and cannot support release readiness or final Pass in the current Goal.
The next eligible task is `layer-3-ocr-export-approval-package-2026-06-27`.
