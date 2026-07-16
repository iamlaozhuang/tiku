# P1 RC-01 账号手机号跨域唯一性审查

日期：2026-07-16

任务：`p1-remediation-rc-01-account-phone-identity-2026-07-16`

## Round 1

Result: pass

从登录身份不变量反推所有新增账号 writer，而不是只修原攻击路径表面：当前共三条权威写路径。若员工创建继续使用独立锁且不查 `admin`，管理员创建与员工导入仍能并发形成跨域双写，因此三条路径必须共享同一锁键并在锁后复核两域。

公共注册的快速预查只能减少预存冲突的无用副作用，不能作为正确性边界；决定性检查必须位于 `user` 写事务内。注册竞争失败可能保留先前 credential 的问题属于 F-0129，本任务只保证不会新增跨域 `user` 行或 session，并保留后续独立原子性任务。

实现复核确认三条 writer 均调用同一 helper：锁 namespace 与手机号键只有一个定义；helper 先查 `admin`、再查 `user`；只有返回 `null` 才允许插入。锁释放与数据库提交同边界，不存在“查完先释放、随后再写”的窗口。

## Round 2

Result: pass

对抗复核确认当前范围没有误合并：

- F-0001 的单一不变量是跨 `user`/`admin` writer 的手机号互斥；三个 writer 共享锁与双域重验属于同一根因和测试边界。
- F-0129 是单次公共注册内部的多事务部分提交，不能因都触及注册而合并。
- F-0049 还包含组织停用竞争、同域唯一异常与 failed audit；本任务可能改善其跨域子路径，但不分配或关闭 F-0049。
- 现有事务和 PostgreSQL advisory lock 足以形成静态修复，不需要 schema、migration、依赖或真实数据库操作。

独立只读复核结论为 `APPROVE`，blocking finding 为 0。复核者确认冲突映射、session 副作用、三条 writer 与锁后检查，并独立通过 typecheck、定向 28 项和 diff check。其 non-blocking 守卫演进建议不影响当前已人工穷举的 writer 结论。

## Transition Disposition

Decision: APPROVE_SCOPE

批准物化 `p1-remediation-rc-01-account-phone-identity-2026-07-16`，仅分配 F-0001，并严格使用 plan 中的文件 allowlist。实现前必须先得到失败测试；完成前必须执行 writer inventory、定向与完整静态回归及两轮复核。

## Final Disposition

Decision: APPROVE

F-0001 静态实现通过 RED/GREEN、writer inventory、定向 28 项、最终完整单元 2400 项、lint、typecheck、format、diff check 及两轮对抗复核。前两轮完整回归命中的两个既有异步 UI 抖动已独立复现并在第三次原命令全量通过；没有越界修改无关测试。

隔离 worktree build 的 Next/Turbopack 依赖布局限制保持为 fresh-master 强制门禁；只有 ff-only 合入后的标准 build 通过，才允许 push 和 closeout。真实 PostgreSQL 并发、数据库 mutation、runtime/browser acceptance、F-0129、F-0049、P2、PR、force push 与部署均未获本结论覆盖。
