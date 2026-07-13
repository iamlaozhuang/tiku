# User-led B1-B2 Organization Training Runtime Recovery Evidence

result: pass

## Batch range

- B1：恢复 localhost 0704DB 的企业训练运行时查询条件。
- B2：企业训练失败状态保留业务动作、重试和返回路径，但不再向非技术用户展示内部数值错误码。
- 不包含新 migration/schema 生成、fixture、seed、依赖、Provider-enabled、staging、production、deploy 或 Cost Calibration。

## 根因证据

- 基线：`4ef7980845a7e6b0e9f28140e28acea230c1b4be`。
- 运行时代码已查询 `answer_deadline_at`，现有 `20260710110500_add_organization_training_answer_deadline.sql` 仅增加 nullable deadline column 和普通 btree index。
- 当前 0704DB 只读元数据预检：deadline column 不存在、对应 index 不存在、Drizzle journal 不存在。
- 因 journal 不存在，未运行可能重放全部历史 migration 的 `drizzle-kit migrate`，也未伪造 journal。
- 根因分类：代码与本地数据库迁移状态不一致；不是重新打开 A01-A30，也不是 Provider 问题。

## 数据库安全执行

1. 从 localhost 服务进程仅在内存继承 process-level 0704DB override，并确认 Provider 关闭；未输出连接信息或环境值。
2. 在仓库外创建迁移前备份；备份文件存在、大小非零、PostgreSQL custom-format header 与 SHA256 均校验通过。
3. 对仓库内既有 migration 文件进行逐条内容校验，只允许一个 nullable column 和一个 named index。
4. 在单个 PostgreSQL transaction 中执行两条已审阅语句；事务提交成功。
5. 迁移后回查：deadline column 与 index 均存在，journal 仍不存在，未执行 journal synthesis。
6. 未执行 DROP、DELETE、UPDATE、数据回填、fixture/schema 修改或 destructive DB 操作。

## TDD 与实现

- RED：管理员列表错误和创建失败 alert 分别暴露 `503001`、`500001`，2 个预期失败。
- GREEN：删除 UI 对 API 数值错误码的拼接；列表、创建、复制、下架、发布和详情失败只展示明确的中文业务动作。
- loading、empty、error、创建禁用、重试、返回组织概览及详情恢复路径未改变。
- 未修改 repository/service/route/mapper/schema 源码，组织范围、edition、deadline、takedown、duplicate submit 和正式域隔离语义不变。

## 运行时证据

- 用户当前已登录的企业高级版员工会话对 `/api/v1/organization-trainings/visible-list` 返回标准成功 envelope，`code = 0` 且 `data` 非空。
- 只读取响应 envelope、角色类别和聚合状态；未读取业务明细，未输出 public id、手机号、凭证、session、cookie 或 token。
- 当前浏览器会话为员工角色，管理员真实会话复核留在 B9 角色矩阵；管理员与员工共享的 deadline repository 查询链已由本批 7 文件定向测试覆盖。
- 未截图、未抓 raw DOM、未保存 trace。

## 验证结果

- `corepack pnpm@10.26.1 exec vitest run tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts src/server/mappers/organization-training-mapper.test.ts src/db/schema/organization-training.test.ts --maxWorkers=25% --testTimeout=20000`：pass，7 files / 162 tests。
- `corepack pnpm@10.26.1 exec vitest run --maxWorkers=25% --testTimeout=20000`：pass，360 files / 1982 tests。
- `corepack pnpm@10.26.1 run lint`：pass，0 warning / 0 error。
- `corepack pnpm@10.26.1 run typecheck`：pass。
- `corepack pnpm@10.26.1 run format:check`：pass。
- `corepack pnpm@10.26.1 exec next build --webpack`：pass，90/90 static pages。
- `git diff --check`：pass。

| Gate                           | Result                                  |
| ------------------------------ | --------------------------------------- |
| DB metadata preflight          | missing column/index/journal confirmed  |
| Repo-external backup           | pass, header and SHA256 verified        |
| Reviewed migration transaction | pass, committed                         |
| DB metadata postflight         | column/index present; journal untouched |
| TDD RED                        | 2 expected failures                     |
| Focused tests                  | 7 files / 162 tests passed              |
| Full unit                      | 360 files / 1982 tests passed           |
| lint / typecheck / format      | passed                                  |
| webpack build                  | 90/90 static pages                      |
| Employee localhost API         | standard success envelope               |
| Provider                       | closed, not called                      |
| New migration/schema source    | not created or changed                  |

## Module Run v2 anchors

- RED: pass_2_expected_failures。
- GREEN: pass_7_files_162_tests。
- Commit: `250c7a999`
- localFullLoopGate: pass
- Test-ModuleRunV2PreCommitHardening: pass_7_files_scope_sensitive_terminology
- Test-ModuleRunV2ModuleCloseoutReadiness: pass
- governanceCommit: `81dccc3d3`
- localMasterMerge: pass_ff_only_81dccc3d3
- masterPostMergeVerification: pass_7_files_162_tests_lint_typecheck_diff_check
- threadRolloverGate: not_required；本批可在当前任务内串行 closeout。
- nextModuleRunCandidate: `user-led-b9-cumulative-acceptance-closeout-2026-07-12`
- Cost Calibration Gate remains blocked。
- staging、production、deploy、PR、force push 和 release readiness 均不在本批结论内。

## Sensitive information

- 证据只记录布尔状态、数量、公开 route、命令类别和公开 commit SHA。
- 未记录 DB URL、env 值、账号、凭证、session、cookie、token、业务行、内部 id、手机号、题目内容或 Provider payload。

## Conclusion

B1-B2 的本地数据库迁移状态与企业训练查询已恢复，员工列表真实 localhost 响应成功，面向用户的内部错误码泄露已移除。管理员真实角色与 viewport 累计复核进入 B9；本结论只代表 localhost。
