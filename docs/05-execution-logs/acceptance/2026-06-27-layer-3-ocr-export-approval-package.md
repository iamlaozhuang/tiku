# Layer 3 OCR Export Approval Package Acceptance

Task id: `layer-3-ocr-export-approval-package-2026-06-27`

result: pass_ocr_export_approval_package_prepared_execution_blocked

moduleRunVersion: 2

## Acceptance Decision

This docs/state-only package defines the OCR/import/export approval matrix for future work. It does not execute OCR,
parse files, import content, generate exports, access download paths, or change runtime readiness.

Layer 1 remains complete and preserved.

Layer 2 remains the minimum local PostgreSQL test-owned `rejected` review-command closure.

Layer 3 status after this package:

| Gate                     | Status                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| Provider smoke           | Passed on previous redacted `openai_compatible` / `alibaba-qwen` path.    |
| Cost Calibration         | Minimum local redacted single-sample estimate exists.                     |
| Staging/pre-release      | Blocked by missing concrete isolated staging target.                      |
| Payment/external-service | Approval package prepared; execution remains blocked.                     |
| OCR/import/export        | Approval boundary defined by this package; execution remains blocked.     |
| Archive/index cleanup    | Next docs/state-only cleanup task must apply approved nonterminal triage. |
| Release readiness        | Blocked.                                                                  |
| Final Pass               | Blocked.                                                                  |

## OCR Import Export Approval Matrix

| Area                   | Current decision              | Future approval must define                                                                    | Execution now |
| ---------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------- |
| OCR provider           | Not selected.                 | Provider label, account boundary, credential alias, call cap, retry cap, timeout, and owner.   | Blocked.      |
| Parser boundary        | Not executable.               | Supported formats, parser library/provider, max file size, page cap, failure classes.          | Blocked.      |
| Storage boundary       | Existing resource rules only. | Private bucket/path, object key policy, upload/download authorization, retention and deletion. | Blocked.      |
| Schema boundary        | No schema change.             | Exact tables/fields/migrations, rollback/recovery, migration gate, no raw content leakage.     | Blocked.      |
| Dependency/import cap  | No dependency change.         | Package names, dependency gate, import sample size, file count, parser cap, conversion cap.    | Blocked.      |
| Rollback/recovery      | Not executable.               | Targeted cleanup, failed-conversion state, old vector fallback, no destructive shared data.    | Blocked.      |
| Export format          | Not implemented.              | CSV/XLSX/PDF/etc., allowed fields, private fields excluded, generated-file retention.          | Blocked.      |
| Download path          | Not accessible.               | Authz checks, signed URL or stream policy, expiry, audit, no public permanent URL.             | Blocked.      |
| Privacy and permission | Summary-only baseline.        | Role/scope checks, employee answer exclusion, organization scope, private content redaction.   | Blocked.      |
| Audit and retention    | Planning only.                | `audit_log` entries, retention window, purge/disable policy, redacted evidence fields.         | Blocked.      |
| Evidence               | Redacted summary only.        | Labels, pass/fail/blocked, counts, cap status, redaction status, stop condition.               | Docs only.    |

## Required Future OCR Approval Text

```text
我 fresh approve 一个 Layer 3 OCR/import sandbox execution task: <task-id>。
允许仅对已登记的 test-owned 或 synthetic 文件执行 <OCR/parser label> 最小验证，最多 <N> 个文件、<N> 页、
<N> 次 provider/external-service call、0 retry，timeout <N>ms，使用 credential alias <ALIAS>（如需要），
但禁止输出、复制、记录或提交任何 .env* 内容、secret、token、Authorization header、raw OCR payload、raw OCR
output、完整 paper/material 内容、员工主观答案、customer/private data、DB row 或 SQL output。
证据只能记录 provider/parser label、file category、page/file count、pass/fail/blocked、cap status、
redaction status、failure category、stop condition 和 forbidden-action checklist。
不批准 schema/migration/seed/destructive DB、Provider 配置变更、Cost Calibration、浏览器/e2e、staging/prod/deploy、
payment/external-service、export generation、archive/index movement、PR、force push、release readiness 或 final Pass。
```

## Required Future Export Approval Text

```text
我 fresh approve 一个 Layer 3 export redacted execution task: <task-id>。
允许仅对已登记的 summary-only 数据集执行一次 <export format> 最小导出验证，最多 <N> 条 summary row，
禁止包含 employee answer text、raw sensitive content、full paper/material、secret、token、DB URL、Authorization header、
raw export file content、private customer data。证据只能记录 export format label、row count、file generated boolean、
pass/fail/blocked、cap status、redaction status、stop condition 和 forbidden-action checklist。
不批准 OCR、DB broad scan/raw row dump、schema/migration/seed/destructive DB、Provider、Cost Calibration、
浏览器/e2e、staging/prod/deploy、payment/external-service、PR、force push、release readiness 或 final Pass。
```

## Redaction Requirements

Evidence must not record `.env*` content, secret, token, API key, DB URL, Authorization header, raw OCR payload, raw OCR
output, raw export file content, full `paper` or `material` content, employee answer text, private customer data,
screenshot, trace, cookie, localStorage, raw DB row, or SQL output.

## Residual Decision

OCR/import/export remains future scope and cannot support release readiness or final Pass in the current Goal. The next
eligible task is `active-queue-nonterminal-closeout-retirement-apply-2026-06-27`.
