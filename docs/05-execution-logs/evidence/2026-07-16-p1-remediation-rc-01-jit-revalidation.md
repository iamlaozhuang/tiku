# P1 RC-01 即时二级复检证据

日期：2026-07-16

任务：`p1-remediation-rc-01-server-session-logout-2026-07-16`

当前 transition 基线：`c67f940deda9f696c8921b7924f1e8a83e11a31f`

原始 JIT 复检读取基线为 `4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`。其后的 `c67f940deda9f696c8921b7924f1e8a83e11a31f` 仅修复 pre-push/P1/Module 治理门禁，产品、测试、schema、依赖和审计仓库零变化；transition 重放后将 repository checkpoint 更新到该治理基线，原逐 finding 结论与产品验证证据不变。

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

Result: pass

- RED-1：原行为下新增的 learner 服务端 DELETE、logout 失败保留状态、admin 业务失败测试失败；3 个新断言失败。
- GREEN-1：learner/admin 仅在 HTTP 与业务成功后清理本地状态；定向测试 24/24，扩展失败矩阵后 26/26 通过。
- 独立只读审查首轮发现 2xx 畸形 envelope 会被 TypeScript 断言误判成功，结论 `REQUEST_CHANGES`。
- RED-2：新增 learner 错类型 `message` 与 admin 缺失 `data` 的畸形 envelope 测试，2 个断言按预期失败。
- GREEN-2：两个客户端现在把 JSON 视为 `unknown`，运行时验证 object、`code === 0`、string `message`、`data === null`；定向测试 28/28 通过。
- 完整单元回归：400 个测试文件、2392 个测试，`--maxWorkers=1` 全部通过，耗时 735.66 秒。
- `npm.cmd run lint`：通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run format:check`：通过。
- `git diff --check`：通过。
- 默认 Turbopack build 在隔离 worktree 无法把物理位于仓库主工作树的 `next/package.json` 解析为 project-root 内依赖；这是已知 worktree 环境限制。一次 webpack 诊断触发仓库既有 `node:crypto` baseline 错误，未作为替代通过证据。标准 `npm.cmd run build` 保持为 ff-only 合入后的 fresh-master 强制门禁，失败则停止 push/closeout。
- 未执行数据库、runtime acceptance、浏览器/E2E、Provider、P2、PR、force push 或部署。

### Closeout Command Evidence

Cost Calibration Gate remains blocked。

- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; corepack pnpm@10.15.1 exec vitest run tests/unit/student-profile-redeem-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --maxWorkers=1`：在当前 worktree 执行，2 个文件、28 个测试通过；显式 PATH 仅复用主工作树已有依赖，不安装或变更依赖。
- `npm.cmd run test:unit -- --maxWorkers=1`：400 个文件、2392 个测试通过。
- `npm.cmd run lint`：通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run format:check`：通过。
- `npm.cmd run build`：隔离 worktree 结果受上述依赖物理布局限制；按任务门禁保留到 ff-only 合入后的 fresh `master` 执行，未预先标记通过。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`：`p1ProgramGuardResult: pass`，P1=125、P2=18、runtime pending=21。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`：`p0GlobalBaselineResult: pass`，P0=35、impact=143、runtime pending=21、dependency cycle=0。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-01-server-session-logout-2026-07-16`：closeout 状态提交前通过。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-01-server-session-logout-2026-07-16`：首次运行准确暴露本节缺失的精确命令、Cost Gate、线程续跑与下一候选字段；本节补齐后重新执行，`module-closeout readiness passed`。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-01-server-session-logout-2026-07-16 -SkipRemoteAheadCheck`：`pre-push readiness passed`。
- `git diff --check`：通过。

threadRolloverGate: `continue_current_thread`。当前线程继续串行推进，不创建并行 WIP。

nextModuleRunCandidate: `P1-RC-01 registration consistency JIT revalidation (F-0001/F-0129)`；仅声明下一即时复检候选，不预先物化修复范围。

## Round 1

Result: pass

- 学员退出现在先等待 `DELETE /api/v1/sessions`；只有 HTTP 成功且标准 envelope 完整成功才清 marker 和授权状态。
- 管理后台删除了 `finally` 假成功路径；失败保留当前 workspace、marker 和认证 UI，并显示可重试错误。
- submitting 状态禁用按钮并提供 `aria-busy`；error 状态使用 token 和 `role=alert`，没有硬编码颜色或主题判断。
- HTTP、业务、网络和可解析畸形响应反证均不能触发本地注销完成。

## Round 2

Result: pass

- 独立只读审查首轮 blocking 已用第二轮 RED/GREEN 关闭；复审结论 `APPROVE`。
- 响应运行时验证要求 `code`、`message`、`data` 完整，不再信任静态类型断言。
- 成功副作用严格位于服务端确认之后；失败路径按钮恢复可用，没有 redirect 或 localStorage 清理。
- diff 仍只有两个客户端和两个定向测试文件；无 schema、migration、依赖或其他产品域变更。

## Fresh-Master Closeout Gate

标准 Turbopack build 必须在 ff-only 合入后的真实 `master` 依赖布局执行并通过，之后才允许普通 push。该后置门禁不被本 evidence 预先描述为已完成。
