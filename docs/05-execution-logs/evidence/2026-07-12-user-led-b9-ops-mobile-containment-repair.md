# User-led B9 Operations Mobile Containment Repair Evidence

status: implementation_verified_browser_post_merge_pending

## Fresh failure record

| Field       | Value                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| roleLabel   | `ops_admin`                                                                                                |
| route label | `/ops/organizations?view=employees`                                                                        |
| 状态类别    | authenticated operations list                                                                              |
| 问题类别    | responsive containment / table scroll ownership                                                            |
| 严重程度    | P1                                                                                                         |
| 实际表现    | 390px viewport 下 document width 约为 1042px，出现页面级横向滚动；未发现拥有横向滚动的表格容器。           |
| 期望表现    | 页面 shell 保持 viewport containment，宽表仅在 `AdminTableFrame` 内横向滚动。                              |
| 复现步骤    | 使用运营管理员进入企业管理员工运营页，将 viewport 设为 390px，检查 document 与 table frame 宽度。          |
| 建议方案    | 为共享后台 main-area flex child 与 content main 增加 `min-w-0`，保留表格最小宽度和内部 `overflow-x-auto`。 |
| 疑似同根因  | `AdminDashboardLayout` flex child 的默认 `min-width:auto` 继承宽表 min-content width。                     |

## TDD

1. RED: `AdminDashboardLayout.test.tsx` 8 tests 中新增用例按预期失败；content main 缺少 `min-w-0`。
2. GREEN: 共享 main-area wrapper 与 content main 增加 `min-w-0` 后 8/8 通过。
3. 保护性定向回归：4 files / 54 tests 通过，覆盖共享后台布局、运营摘要、企业授权/员工与 A15 卡密边界。

## Repository verification

- Full unit: 360/360 files, 1983/1983 tests passed.
- Lint: passed.
- Typecheck: passed.
- Format check: first run correctly reported the new test formatting; scoped Prettier write completed and rerun passed.
- Webpack build: passed, 90/90 static pages generated.
- Provider, database, schema, migration, fixture, dependency and environment changes: none.

## Implementation

- `AdminDashboardLayout` main-area flex child now allows shrinking instead of inheriting wide table min-content width.
- The content main element also carries the same shrink boundary.
- `AdminTableFrame`, table minimum widths, B8 cell spacing, desktop sidebar behavior and business semantics are unchanged.

## Browser verification

- RED evidence came from the approved B9 in-app browser session and repository-external screenshot set.
- GREEN browser replay is intentionally deferred until the source commit is ff-only merged to local `master`, because the approved 0704DB localhost process serves the master checkout. No `.env.local` or alternate database target is introduced.
- Final evidence will record both organization authorization and employee views at desktop and 390px before remote push.

## Boundary

- Localhost only; no staging, production, deploy, Cost Calibration or release-readiness claim.
- A14 remains `protected_deferred_decision`.
- A15 remains `protected_requirement`.
