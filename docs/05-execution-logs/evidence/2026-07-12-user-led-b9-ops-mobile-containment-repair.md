# User-led B9 Operations Mobile Containment Repair Evidence

result: pass
status: pass_ready_for_closeout

## Batch range

- B9 discovered repair: shared operations-admin mobile containment only.
- No business API, authorization, Provider, database, schema, migration, fixture, dependency or environment behavior changed.

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

## Validation commands

- `corepack pnpm@10.26.1 exec vitest run src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`: pass, 1 file / 8 tests; the recorded run also used conservative worker and timeout arguments.
- `corepack pnpm@10.26.1 exec vitest run --maxWorkers=25% --testTimeout=20000`: pass, 360 files / 1983 tests.
- `corepack pnpm@10.26.1 run lint`: pass.
- `corepack pnpm@10.26.1 run typecheck`: pass.
- `corepack pnpm@10.26.1 run format:check`: pass after scoped formatting of the new test.
- `corepack pnpm@10.26.1 exec next build --webpack`: pass, 90/90 static pages.
- `git diff --check`: pass.

## Implementation

- `AdminDashboardLayout` main-area flex child now allows shrinking instead of inheriting wide table min-content width.
- The content main element also carries the same shrink boundary.
- `AdminTableFrame`, table minimum widths, B8 cell spacing, desktop sidebar behavior and business semantics are unchanged.

## Browser verification

- RED evidence came from the approved B9 in-app browser session and repository-external screenshot set.
- Product commit `b2ed0c05d` was ff-only merged to local `master`; the existing process-level 0704DB localhost service hot-reloaded the shared layout. No `.env.local` or alternate database target was introduced.
- At `/ops/organizations?view=org-auth`, 390px document width equals viewport width; the visible table frame owns horizontal scrolling with 325px client width and 1184px scroll width.
- At `/ops/organizations?view=employees`, 390px document width equals viewport width; the visible table frame owns horizontal scrolling with 325px client width and 992px scroll width.
- Both routes report no page-level horizontal overflow. Desktop employee view remains contained and fully usable.
- Repository-external screenshots were inspected; no screenshot is stored in the repository or evidence document.

## Boundary

- Localhost only; no staging, production, deploy, Cost Calibration or release-readiness claim.
- A14 remains `protected_deferred_decision`.
- A15 remains `protected_requirement`.

## Module Run v2 anchors

- batchEvidence: pass_fresh_390px_failure_reproduced_and_green_browser_replay_completed
- RED: pass_expected_missing_shared_admin_shrink_boundary
- GREEN: pass_1_file_8_tests
- Commit: `b2ed0c05d`
- batchCommitEvidence: pass_product_commit_b2ed0c05d_real_commit_hooks
- localFullLoopGate: pass
- Test-ModuleRunV2PreCommitHardening: pass_7_files_scope_sensitive_terminology
- Test-ModuleRunV2ModuleCloseoutReadiness: pass
- localMasterMerge: pass_ff_only_b2ed0c05d
- masterPostMergeVerification: pass_4_files_54_tests_lint_typecheck_diff_and_browser
- Test-ModuleRunV2PrePushReadiness: pass_real_push_hook
- remotePush: pass_origin_master_607c44fa8
- localRemoteComparison: pass_0_behind_0_ahead
- threadRolloverGate: not_required; this bounded repair can close in the current task.
- Provider execution: blocked_not_executed
- database connection: blocked_not_executed
- database mutation: blocked_not_executed
- schema migration: blocked_not_created_not_executed
- blocked remainder: staging, production, deploy, Provider-enabled and Cost Calibration remain outside this localhost repair.
- Cost Calibration Gate remains blocked
- nextModuleRunCandidate: `user-led-b9-cumulative-acceptance-closeout-2026-07-12`

## Remote closeout

- Product commit: `b2ed0c05d`.
- Governance commit: `607c44fa8`.
- `origin/master` ordinary push passed through the real pre-push hook.
- Local `master` and `origin/master` compare is `0 behind / 0 ahead` at `607c44fa8`.
- The repair is closed; B9 cumulative acceptance is the next task.
