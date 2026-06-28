# Content Ops Organization Nav Entry Source-Only Acceptance

Task id: `content-ops-organization-nav-entry-source-only-2026-06-27`

Branch: `codex/content-ops-org-nav-source-20260627`

Acceptance label: `source_only`

Runtime claim: none

Final Pass claim: none

## Acceptance Mapping Result

| Requirement or contract point                                                         | Evidence                                                                                                              | Result                                      |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Operations workspace has discoverable authorization and `org_auth` governance entry   | `AdminDashboardLayout` renders `卡密与企业授权` linking to existing `/ops/redeem-codes`; focused unit asserts href    | pass_source_only_entry                      |
| Operations workspace has discoverable redacted `audit_log` and `ai_call_log` entry    | `AdminDashboardLayout` renders `审计与AI调用日志` linking to existing `/ops/ai-audit-logs`; focused unit asserts href | pass_source_only_entry                      |
| Content workspace keeps content AI and formal content entries scoped                  | Existing focused unit covers content `AI出题` and `AI组卷`; new assertions confirm ops governance entries are absent  | pass_source_only_entry                      |
| Standard organization admin does not receive operations or advanced organization menu | Existing focused unit covers hidden advanced items; new assertions confirm ops governance entries are absent          | pass_source_only_visibility                 |
| UI visibility is not an authorization boundary                                        | Evidence and audit mark permission/service guard work as deferred to the next task                                    | pass_boundary_preserved                     |
| Browser validation                                                                    | Current task forbids browser/dev-server/e2e                                                                           | blocked_by_scope_requires_separate_approval |

## Local Validation Level

Highest local validation level reached: `L2_focused_unit_plus_L1_static_no_browser`.

This task is accepted only as `entry-only` source behavior. It does not prove runtime route access, direct-route denial, service authorization, DB-backed `org_auth` or `audit_log` behavior, browser UX, staging, release readiness, or final Pass.

## Follow-Up

Next recommended task: `backend-workspace-role-guard-contract-tdd-2026-06-27`.

Approval text to use next:

```text
我批准执行权限/授权 contract 任务 backend-workspace-role-guard-contract-tdd-2026-06-27。允许修改任务队列列明的 route guard、capability contract、validator/mapper/service adapter、focused unit test 和 docs/evidence/audit。必须保持 effectiveEdition 由服务层计算，UI 不得作为授权边界；禁止 schema/migration/seed、DB 连接或写入、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

## Blocked Gates

- Browser/dev-server/e2e: blocked by current task approval.
- DB/schema/migration/seed: blocked.
- Provider and Cost Calibration Gate: blocked pending fresh explicit approval.
- staging/prod/deploy/payment/OCR/export/external-service: blocked.
- PR, force push, release readiness, final Pass: blocked.
