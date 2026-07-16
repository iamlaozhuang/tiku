# P1 RC-01 即时二级复检证据

日期：2026-07-16

任务：`p1-remediation-rc-01-server-session-logout-2026-07-16`

基线：`4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取用户/管理员身份、个人注册、学员与后台退出、session runtime/schema/service/repository、P0 RC-01 变更及原始 finding。类比实现包括 P0 引入的 auth-user 事务级 advisory lock、服务端 session logout route，以及现有 learner/admin 客户端会话检查。

## Requirement Mapping Result

- F-0001 对应跨 `user` 与 `admin` 账号域手机号不可复用；learner 绑定 employee 的同域统一账号模型不受影响。
- F-0003 对应九角色可见退出入口，完成条件是服务端 session 已撤销且 Cookie 已过期，不能用 localStorage/UI 切换替代。
- F-0129 对应一次注册形成一个可解释结果：credential、user/student、初始 session 不得部分提交。
- F-0131 对应 learner/employee 七天单活 session 与新登录撤销旧 session。

## JIT Revalidation Result

Result: pass

### F-0001 — confirmed

- 当前公共注册仍只调用 `findRegisteredUserByPhone`；默认 repository 只查询 `user`。
- `user.phone` 与 `admin.phone` 仍是两张表内各自唯一，没有共享数据库唯一键。
- 登录仍先查 `user`、未命中才查 `admin`，因此已有管理员手机号可被公共注册写入 learner 域并改变登录选择顺序。
- P0 RC-01 加固了管理员生命周期，但没有把公共注册和管理员创建收敛到同一手机号互斥事务。

Verdict: `confirmed`

### F-0003 — confirmed

- `StudentProfileRedeemPage.handleLogout` 只清理 localStorage marker 和 React 状态，没有调用 `DELETE /api/v1/sessions`。
- marker 不是 HttpOnly session Cookie；刷新后服务端仍可恢复原身份。
- `AdminDashboardLayout.handleLogoutClick` 虽调用 DELETE，但不检查 HTTP 或标准响应 `code`，且在 `finally` 中无条件清理本地状态并跳转。
- 服务端 logout route 已具备撤销 session 和过期 Cookie 的成功路径；缺陷位于两个客户端完成判定。

Verdict: `confirmed`

### F-0129 — confirmed

- 当前注册 service 依次调用 credential adapter、user repository、session adapter。
- 默认 runtime 分别开启 credential、user/student、session 三个事务；后一步失败不能回滚前一步。
- 当前测试只覆盖非法、同域重复和成功路径，没有三阶段失败、并发重试或响应未知测试。

Verdict: `confirmed`

### F-0131 — not_reproduced

- 原审计基线的 learner `createSingleActiveSession` 确实是无互斥的 DELETE 后 INSERT。
- P0 commit `2e529ea3d721af1511d5663bb6bcbaa5b39886fb` 已在 learner/employee session 创建事务开头对 `authUserId` 获取 `pg_advisory_xact_lock`。
- 同一 `authUserId` 的并发 learner/employee 登录现在被串行化；后进入事务只能在前一事务提交后执行 DELETE/INSERT，原“两事务都先 DELETE 再各自 INSERT”的交错不再成立。
- schema 仍只有 `user_id` 普通索引，但当前受影响登录写路径已有数据库事务级互斥；注册 adapter 面向新建且尚未共享的 `authUserId`，不构成原 finding 的同账号并发登录路径。

Verdict: `not_reproduced`

Superseding evidence: P0 commit `2e529ea3d721af1511d5663bb6bcbaa5b39886fb` current authority path.

## Scope Freeze

Result: pass

首个 successor 仅物化 F-0003：它有独立客户端注销完成边界、无需 schema/migration/dependency，并可用失败语义与刷新前置条件定向测试。F-0001 与 F-0129 虽都涉及注册，但前者还覆盖管理员创建并发写路径；两者不在本任务顺手合并。F-0131 以当前代码静态证据记录 `not_reproduced`，不创建重复修复。

允许产品文件：

- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`

允许治理文件仅为本任务 plan/evidence/audit。state/queue 只允许在 transition 与 closeout 两个治理提交中修改，不得与产品实现同提交修改范围。

## Validation Results

Result: pending_implementation

transition 阶段只执行静态复检、范围门禁、格式和 diff 检查；产品 focused/full gates 在实现后写入。

## Round 1

Result: pending_implementation

## Round 2

Result: pending_implementation
