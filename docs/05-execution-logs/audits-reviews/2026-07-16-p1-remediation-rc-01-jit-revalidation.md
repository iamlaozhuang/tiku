# P1 RC-01 即时二级复检与范围审查

日期：2026-07-16

任务：`p1-remediation-rc-01-server-session-logout-2026-07-16`

## Round 1

Result: pass

逐 finding 重建当前权威路径，结论为 F-0001 `confirmed`、F-0003 `confirmed`、F-0129 `confirmed`、F-0131 `not_reproduced`。F-0131 不是原审计误报；它由 P0 的数据库事务级 auth-user advisory lock 改变了并发时序。其余三个缺口仍可由当前源码直接证明。

## Round 2

Result: pass

对抗复核排除了三种错误合并：

- 没有把“都出现 session”当成同一根因；F-0003 是客户端完成判定，F-0131 是签发互斥。
- 没有因 P0 加固 admin 生命周期就推定公共注册已具备跨域唯一性；公共注册仍未查询或互斥 `admin` 域。
- 没有把三个局部事务误判成一个工作单元；F-0129 的部分提交仍存在。

首任务选择 F-0003，避免在同一 WIP 中混入跨域身份不变量、注册事务、schema 或 migration。失败路径必须保持当前身份可见并提供重试，禁止“请求失败但 UI 宣告已退出”。

## Transition Disposition

Decision: APPROVE_SCOPE

批准物化 `p1-remediation-rc-01-server-session-logout-2026-07-16`，仅覆盖 F-0003。当前 transition 不批准产品变更以外的 schema、migration、依赖、数据库、runtime acceptance、浏览器/E2E、P2、PR、force push 或部署。

## Final Disposition

Decision: APPROVE

F-0003 的静态产品整改已通过 RED/GREEN、完整单元、lint、typecheck、format、diff、主线程对抗复核和独立只读二轮复核。首轮独立审查发现的畸形成功 envelope 假成功已补运行时验证与双端回归测试，复审无 blocking finding。

隔离 worktree 的默认 Turbopack build 因 `next` 物理依赖位于 project root 外失败；标准 `npm.cmd run build` 必须在 ff-only 合入后的 fresh `master` 通过，失败即停止 push 和任务关闭。数据库、runtime acceptance、浏览器/E2E、Provider、P2、PR、force push、部署仍在边界外。
