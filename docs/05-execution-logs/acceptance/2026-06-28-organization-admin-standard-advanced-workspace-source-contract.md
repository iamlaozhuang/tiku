# Organization Admin Standard Advanced Workspace Source Contract Acceptance

Task id: `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`

Branch: `codex/organization-admin-workspace-source-contract-20260628`

result: pass

## Acceptance Summary

This task accepts the source/permission-contract slice for organization admin standard/advanced workspace behavior.

- Organization admin portal remains available for standard organization admins.
- Organization advanced entries and direct advanced pages consume the service-layer `AdminWorkspaceCapabilitySummary`.
- Standard or missing advanced capability does not render advanced organization training actions, does not load organization analytics, and does not load organization AI history.
- Organization training capability context is derived from the service capability summary rather than hardcoded UI edition state.

This is not browser runtime acceptance, DB-backed authorization acceptance, staging readiness, release readiness, or final Pass.

## Evidence Mapping

- RED focused unit covered role-only advanced access and missing service capability summary failures.
- GREEN focused unit covered session capability adapter, layout filtering, direct route denial, and organization AI standard-unavailable behavior.
- Existing entry-surface unit suites were updated so organization admin fixtures carry service-side workspace capability summaries.

## Follow-Up Recommendation

Recommended next task after this source contract closes:

`standard-advanced-backend-role-browser-validation-2026-06-27`

Copyable approval text:

```text
我批准执行本地浏览器验证任务 standard-advanced-backend-role-browser-validation-2026-06-27。范围仅限 localhost/127.0.0.1 上的既有本地目标和任务队列列明的后台角色/路由；证据只能记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code 或完整题目/试卷内容。禁止 DB/schema/migration、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、PR、force push、release readiness 和 final Pass。
```

## Blocked Remainder

- Browser/dev-server/e2e remain blocked in this task.
- DB connection or mutation remains blocked.
- Provider call/configuration and Cost Calibration remain blocked.
- Staging/prod/deploy, payment, OCR/export, external-service work, PR, force push, release readiness, and final Pass remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.
