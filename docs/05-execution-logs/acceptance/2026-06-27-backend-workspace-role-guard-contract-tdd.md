# Backend Workspace Role Guard Contract TDD Acceptance Note

## Status

Closed for permission contract scope after local source/static validation. This is not a release readiness or final Pass artifact.

## Accepted Scope

This task can close only the `permission_contract` slice for backend workspace route-guard behavior:

- operations/content/organization workspace role separation;
- direct-route denial independent of menu visibility;
- standard organization unavailable state for advanced-only organization routes;
- use of service-computed capability input instead of UI-derived `effectiveEdition`.

## Explicit Non-Claims

- No browser/runtime acceptance.
- No DB/schema/migration/seed acceptance.
- No Provider, Cost Calibration, staging/prod/deploy, payment, OCR/export, or external-service acceptance.
- No release readiness.
- No final Pass.

## Next Suggested Task

`organization-admin-standard-advanced-workspace-source-contract-2026-06-27`

Suggested approval text:

```text
我批准执行组织后台标准版/高级版 source + permission contract 任务 organization-admin-standard-advanced-workspace-source-contract-2026-06-27。允许修改任务队列列明的组织后台 workspace 页面/状态组件、必要 route guard 接入、capability contract adapter、focused unit test 以及 docs/evidence/audit。必须复用 backend-workspace-role-guard-contract-tdd-2026-06-27 的服务层能力摘要边界，保持 effectiveEdition 由服务层计算，UI 不得作为授权边界；禁止 schema/migration/seed、package/lockfile、.env*、DB 连接或写入、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```
